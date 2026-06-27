import pool from '../config/db.js';
import { nextId } from '../services/idService.js';
import { initiateMobileMoneyPayment } from '../services/mobileMoneyService.js';
import { createStripeCheckoutSession, isStripeReady, verifyStripeSignature } from '../services/stripeService.js';

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

const frontendOrigin = () => String(process.env.FRONTEND_URL || 'http://127.0.0.1:5174')
    .split(',')[0]
    .trim()
    .replace(/\/$/, '');

const getClientInvoiceBalance = async (connection, { venteId, clientId, entrepriseId, lock = false }) => {
    const [[invoice]] = await connection.query(
        `SELECT v.id_ventes, v.numero_facture, v.montant_ttc, IFNULL(SUM(p.montant),0) total_paye
         FROM ventes v
         LEFT JOIN paiement p ON p.vente_id=v.id_ventes
         WHERE v.id_ventes=? AND v.client_id=? AND v.entreprise_id=?
         GROUP BY v.id_ventes ${lock ? 'FOR UPDATE' : ''}`,
        [venteId, clientId, entrepriseId]
    );
    return invoice;
};

export const createStripeCheckoutPayment = async (req, res) => {
    if (req.user.type !== 'client') return res.status(403).json({ success: false, message: 'Espace client requis.' });
    const venteId = String(req.body.vente_id || '').trim();
    const amount = Number(req.body.montant);
    if (!venteId || !Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Facture et montant valides requis.' });
    }
    if (!isStripeReady()) {
        return res.status(503).json({ success: false, message: 'Paiement Stripe non configure sur le backend.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const invoice = await getClientInvoiceBalance(connection, {
            venteId,
            clientId: req.user.client_id,
            entrepriseId: req.user.entreprise_id,
            lock: true
        });
        if (!invoice) throw new Error('Facture introuvable dans votre espace client.');
        const reste = Number(invoice.montant_ttc) - Number(invoice.total_paye);
        if (reste <= 0) throw new Error('Cette facture est deja totalement payee.');
        if (amount > reste + 0.001) throw new Error(`Le montant depasse le reste a payer (${reste.toFixed(2)} USD).`);

        const idSession = await nextId(connection, 'paiement_stripe_sessions', 'STR', 6);
        await connection.query(
            `INSERT INTO paiement_stripe_sessions
                (id_session,vente_id,client_id,entreprise_id,montant,devise,statut)
             VALUES (?,?,?,?,?,?,?)`,
            [idSession, venteId, req.user.client_id, req.user.entreprise_id, amount, 'usd', 'en_attente']
        );

        const stripeSession = await createStripeCheckoutSession({
            internalReference: idSession,
            invoiceId: invoice.numero_facture || venteId,
            clientId: req.user.client_id,
            amount,
            currency: 'usd',
            successUrl: `${frontendOrigin()}/paiement/stripe/succes`,
            cancelUrl: `${frontendOrigin()}/paiement/stripe/annule`
        });

        await connection.query(
            `UPDATE paiement_stripe_sessions
             SET stripe_session_id=?, stripe_payment_intent=?, checkout_url=?, raw_response=?
             WHERE id_session=?`,
            [stripeSession.id || null, stripeSession.payment_intent || null, stripeSession.url || null, JSON.stringify(stripeSession), idSession]
        );
        await connection.commit();
        res.status(201).json({
            success: true,
            message: 'Session Stripe creee.',
            data: { id_session: idSession, checkout_url: stripeSession.url, stripe_session_id: stripeSession.id }
        });
    } catch (error) {
        await connection.rollback();
        res.status(error.statusCode || 400).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

export const getStripePaymentStatus = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id_session, vente_id, montant, devise, statut, stripe_session_id, created_at, confirmed_at
             FROM paiement_stripe_sessions
             WHERE (id_session=? OR stripe_session_id=?) AND client_id=? AND entreprise_id=?
             LIMIT 1`,
            [req.params.id, req.params.id, req.user.client_id, req.user.entreprise_id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'Paiement Stripe introuvable.' });
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const stripeWebhook = async (req, res) => {
    const rawBody = req.body;
    const signature = req.headers['stripe-signature'];
    if (!verifyStripeSignature(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)) {
        return res.status(400).json({ received: false, message: 'Signature Stripe invalide.' });
    }
    let event;
    try {
        event = JSON.parse(Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody || '{}'));
    } catch {
        return res.status(400).json({ received: false, message: 'Payload Stripe invalide.' });
    }
    if (event.type !== 'checkout.session.completed') {
        return res.json({ received: true, ignored: true });
    }

    const session = event.data?.object || {};
    const internalReference = session.client_reference_id || session.metadata?.internal_reference;
    if (!internalReference) return res.status(400).json({ received: false, message: 'Reference interne manquante.' });

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [[paymentSession]] = await connection.query(
            `SELECT * FROM paiement_stripe_sessions WHERE id_session=? FOR UPDATE`,
            [internalReference]
        );
        if (!paymentSession) throw new Error('Session Stripe inconnue.');
        if (paymentSession.statut === 'confirmee') {
            await connection.commit();
            return res.json({ received: true, duplicate: true });
        }
        const amountStripe = Number(session.amount_total || 0) / 100;
        const expected = Number(paymentSession.montant || 0);
        if (Math.abs(amountStripe - expected) > 0.01) {
            await connection.query(
                `UPDATE paiement_stripe_sessions SET statut='echec', raw_webhook=?, erreur=? WHERE id_session=?`,
                [JSON.stringify(event), `Montant Stripe ${amountStripe} different du montant attendu ${expected}`, internalReference]
            );
            await connection.commit();
            return res.status(400).json({ received: false, message: 'Montant Stripe invalide.' });
        }
        const [[invoice]] = await connection.query(
            `SELECT v.montant_ttc,IFNULL(SUM(p.montant),0) total_paye
             FROM ventes v LEFT JOIN paiement p ON p.vente_id=v.id_ventes
             WHERE v.id_ventes=? GROUP BY v.id_ventes FOR UPDATE`,
            [paymentSession.vente_id]
        );
        if (!invoice) throw new Error('Facture introuvable.');
        const reste = Number(invoice.montant_ttc) - Number(invoice.total_paye);
        if (expected > reste + 0.01) {
            await connection.query(
                `UPDATE paiement_stripe_sessions SET statut='echec', raw_webhook=?, erreur=? WHERE id_session=?`,
                [JSON.stringify(event), `Solde insuffisant au webhook: ${reste.toFixed(2)} USD`, internalReference]
            );
            await connection.commit();
            return res.status(409).json({ received: false, message: 'Solde facture insuffisant.' });
        }
        const paymentId = await nextId(connection, 'paiement', 'PAY', 5);
        await connection.query(
            `INSERT INTO paiement (id_paiement,vente_id,montant,mode_paiement,reference_externe,telephone_payeur)
             VALUES (?,?,?,'stripe',?,NULL)`,
            [paymentId, paymentSession.vente_id, expected, session.payment_intent || session.id || internalReference]
        );
        await connection.query(
            `UPDATE paiement_stripe_sessions
             SET statut='confirmee', stripe_session_id=?, stripe_payment_intent=?, raw_webhook=?, confirmed_at=NOW()
             WHERE id_session=?`,
            [session.id || paymentSession.stripe_session_id, session.payment_intent || paymentSession.stripe_payment_intent, JSON.stringify(event), internalReference]
        );
        await connection.commit();
        res.json({ received: true });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ received: false, message: error.message });
    } finally {
        connection.release();
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
