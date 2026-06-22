import pool from '../config/db.js';
import { nextId } from '../services/idService.js';
import { initiateMobileMoneyPayment } from '../services/mobileMoneyService.js';

// POST /api/paiements
export const createPaiement = async (req, res) => {
    const { vente_id, montant, mode_paiement, reference_externe, telephone_payeur } = req.body;
    const entreprise_id = req.user.entreprise_id;
    const montantNumber = Number(montant);
    const reference = String(reference_externe || '').trim();
    const telephone = String(telephone_payeur || '').trim();

    if (!vente_id || !Number.isFinite(montantNumber) || montantNumber <= 0 || !mode_paiement) {
        return res.status(400).json({ success: false, message: 'Donnees paiement incompletes ou invalides' });
    }

    if (mode_paiement === 'mobile_money' && (!reference || !telephone)) {
        return res.status(400).json({ success: false, message: 'Reference et numero requis pour Mobile Money' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [ventes] = await connection.query(
            `SELECT v.id_ventes, v.montant_ttc, IFNULL(SUM(p.montant), 0) AS total_paye
             FROM ventes v
             LEFT JOIN paiement p ON p.vente_id = v.id_ventes
             WHERE v.id_ventes = ? AND v.entreprise_id = ?
             GROUP BY v.id_ventes`,
            [vente_id, entreprise_id]
        );

        if (ventes.length === 0) {
            return res.status(404).json({ success: false, message: 'Facture introuvable dans votre entreprise' });
        }

        const reste = Number(ventes[0].montant_ttc) - Number(ventes[0].total_paye);
        if (montantNumber > reste) {
            return res.status(400).json({
                success: false,
                message: `Le paiement depasse le reste a payer (${reste.toFixed(2)} USD).`
            });
        }

        const idPaiement = await nextId(connection, 'paiement', 'PAY', 5);
        await connection.query(
            `INSERT INTO paiement
                (id_paiement, vente_id, montant, mode_paiement, reference_externe, telephone_payeur)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [idPaiement, vente_id, montantNumber, mode_paiement, reference || null, telephone || null]
        );

        await connection.commit();
        res.status(201).json({
            success: true,
            message: `Paiement de ${montantNumber} USD enregistre (${mode_paiement})`,
            data: { id_paiement: idPaiement }
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

// GET /api/paiements/rapport-caisse
export const getRapportCaisse = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;
    try {
        const [rows] = await pool.query(
            `SELECT DATE(p.date_paiement) AS Date,
                    p.mode_paiement AS Mode_Paiement,
                    COUNT(*) AS Nombre_Transactions,
                    IFNULL(SUM(p.montant), 0) AS Total_Encaisse
             FROM paiement p
             JOIN ventes v ON v.id_ventes = p.vente_id
             WHERE v.entreprise_id = ?
             GROUP BY DATE(p.date_paiement), p.mode_paiement
             ORDER BY Date DESC`,
            [entreprise_id]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRepartitionPaiements = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;
    try {
        const [rows] = await pool.query(
            `SELECT p.mode_paiement,
                    COUNT(*) AS transactions,
                    IFNULL(SUM(p.montant), 0) AS total
             FROM paiement p
             JOIN ventes v ON v.id_ventes = p.vente_id
             WHERE v.entreprise_id = ?
             GROUP BY p.mode_paiement
             ORDER BY total DESC`,
            [entreprise_id]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createClientMobilePayment = async (req, res) => {
    if (req.user.type !== 'client') return res.status(403).json({ success: false, message: 'Espace client requis.' });
    const venteId = String(req.body.vente_id || '').trim();
    const operateur = String(req.body.operateur || '').trim();
    const telephone = String(req.body.telephone_payeur || '').replace(/\s+/g, '');
    let reference = String(req.body.reference_externe || '').trim().toUpperCase();
    const montant = Number(req.body.montant);
    if (!venteId || !['mpesa', 'airtel_money', 'orange_money'].includes(operateur) || !/^\+?[0-9]{9,15}$/.test(telephone) || !Number.isFinite(montant) || montant <= 0) {
        return res.status(400).json({ success: false, message: 'Operateur, telephone et montant valides requis.' });
    }
    let providerResult = null;
    if (!reference) {
        try { providerResult = await initiateMobileMoneyPayment({ invoiceId: venteId, operator: operateur, phone: telephone, amount: montant, clientId: req.user.client_id }); }
        catch (error) { return res.status(502).json({ success: false, message: error.message }); }
        if (!providerResult?.reference) return res.status(503).json({ success: false, message: 'Paiement automatique non configure. Effectuez le transfert puis saisissez sa reference.' });
        reference = providerResult.reference;
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [[invoice]] = await connection.query(
            `SELECT v.montant_ttc, IFNULL(SUM(p.montant),0) total_paye
             FROM ventes v LEFT JOIN paiement p ON p.vente_id=v.id_ventes
             WHERE v.id_ventes=? AND v.client_id=? AND v.entreprise_id=? GROUP BY v.id_ventes FOR UPDATE`,
            [venteId, req.user.client_id, req.user.entreprise_id]
        );
        if (!invoice) throw new Error('Facture introuvable dans votre espace client.');
        const reste = Number(invoice.montant_ttc) - Number(invoice.total_paye);
        if (montant > reste + 0.001) throw new Error(`Le montant depasse le reste a payer (${reste.toFixed(2)} USD).`);
        const id = await nextId(connection, 'demandes_paiement_mobile', 'MOB', 6);
        const initialStatus = providerResult?.confirmed ? 'confirmee' : 'en_attente';
        await connection.query(
            `INSERT INTO demandes_paiement_mobile (id_demande,vente_id,client_id,entreprise_id,operateur,telephone_payeur,montant,reference_externe,statut,date_traitement)
             VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [id, venteId, req.user.client_id, req.user.entreprise_id, operateur, telephone, montant, reference, initialStatus, providerResult?.confirmed ? new Date() : null]
        );
        if (providerResult?.confirmed) {
            const paymentId = await nextId(connection, 'paiement', 'PAY', 5);
            await connection.query(`INSERT INTO paiement (id_paiement,vente_id,montant,mode_paiement,reference_externe,telephone_payeur) VALUES (?,?,?,'mobile_money',?,?)`, [paymentId, venteId, montant, reference, telephone]);
        }
        await connection.commit();
        res.status(201).json({ success: true, message: providerResult?.confirmed ? 'Paiement Mobile Money confirme automatiquement.' : 'Paiement Mobile Money recu et en cours de verification.', data: { id_demande: id, statut: initialStatus } });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ success: false, message: error.code === 'ER_DUP_ENTRY' ? 'Cette reference Mobile Money a deja ete utilisee.' : error.message });
    } finally { connection.release(); }
};

export const getMobilePaymentRequests = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT d.*, v.numero_facture, c.nom AS client_nom, c.postnom AS client_postnom
             FROM demandes_paiement_mobile d
             JOIN ventes v ON v.id_ventes=d.vente_id JOIN client c ON c.id_client=d.client_id
             WHERE d.entreprise_id=? ORDER BY FIELD(d.statut,'en_attente','confirmee','rejetee'), d.date_demande DESC`,
            [req.user.entreprise_id]
        );
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const reviewMobilePayment = async (req, res) => {
    const statut = String(req.body.statut || '');
    if (!['confirmee', 'rejetee'].includes(statut)) return res.status(400).json({ success: false, message: 'Decision invalide.' });
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [[request]] = await connection.query(`SELECT * FROM demandes_paiement_mobile WHERE id_demande=? AND entreprise_id=? FOR UPDATE`, [req.params.id, req.user.entreprise_id]);
        if (!request || request.statut !== 'en_attente') throw new Error('Demande introuvable ou deja traitee.');
        if (statut === 'confirmee') {
            const [[invoice]] = await connection.query(`SELECT v.montant_ttc,IFNULL(SUM(p.montant),0) total_paye FROM ventes v LEFT JOIN paiement p ON p.vente_id=v.id_ventes WHERE v.id_ventes=? GROUP BY v.id_ventes`, [request.vente_id]);
            const reste = Number(invoice.montant_ttc) - Number(invoice.total_paye);
            if (Number(request.montant) > reste + 0.001) throw new Error(`Le solde actuel n'est plus suffisant (${reste.toFixed(2)} USD).`);
            const paymentId = await nextId(connection, 'paiement', 'PAY', 5);
            await connection.query(`INSERT INTO paiement (id_paiement,vente_id,montant,mode_paiement,reference_externe,telephone_payeur) VALUES (?,?,?,'mobile_money',?,?)`, [paymentId, request.vente_id, request.montant, request.reference_externe, request.telephone_payeur]);
        }
        await connection.query(`UPDATE demandes_paiement_mobile SET statut=?,date_traitement=NOW() WHERE id_demande=?`, [statut, request.id_demande]);
        await connection.commit();
        res.json({ success: true, message: statut === 'confirmee' ? 'Paiement Mobile Money confirme et encaisse.' : 'Demande Mobile Money rejetee.' });
    } catch (error) { await connection.rollback(); res.status(400).json({ success: false, message: error.message }); }
    finally { connection.release(); }
};
