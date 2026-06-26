import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import { nextId } from '../services/idService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, '..', 'uploads', 'archives');
const allowedMimeTypes = new Map([
    ['image/jpeg', 'jpg'],
    ['image/png', 'png'],
    ['image/webp', 'webp'],
    ['application/pdf', 'pdf']
]);

const publicBaseUrl = (req) => String(process.env.API_PUBLIC_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');

const saveArchiveFile = async ({ req, dataUrl }) => {
    const match = String(dataUrl || '').match(/^data:(image\/(?:jpeg|png|webp)|application\/pdf);base64,([a-z0-9+/=]+)$/i);
    if (!match) throw new Error('Fichier invalide. Formats acceptes: JPG, PNG, WEBP ou PDF.');
    const mime = match[1].toLowerCase();
    const extension = allowedMimeTypes.get(mime);
    const buffer = Buffer.from(match[2], 'base64');
    const maxSize = Number(process.env.ARCHIVE_MAX_BYTES || 8 * 1024 * 1024);
    if (!buffer.length || buffer.length > maxSize) {
        throw new Error(`Fichier trop lourd. Taille maximum: ${Math.round(maxSize / 1024 / 1024)} Mo.`);
    }
    await fs.mkdir(uploadsRoot, { recursive: true });
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${extension}`;
    await fs.writeFile(path.join(uploadsRoot, filename), buffer);
    return { url: `${publicBaseUrl(req)}/uploads/archives/${filename}`, mime };
};

export const createArchiveDocument = async (req, res) => {
    if (req.user.role !== 'manager') return res.status(403).json({ success: false, message: 'Archivage reserve au manager.' });
    const titre = String(req.body.titre || '').trim();
    const type_document = String(req.body.type_document || 'document').trim().slice(0, 80) || 'document';
    const description = String(req.body.description || '').trim();
    const file_name = String(req.body.file_name || '').trim();
    if (!titre) return res.status(400).json({ success: false, message: 'Titre requis.' });
    try {
        const saved = await saveArchiveFile({ req, dataUrl: req.body.data_url });
        const id = await nextId(pool, 'documents_archive', 'ARC', 6);
        await pool.query(
            `INSERT INTO documents_archive
                (id_document, entreprise_id, uploaded_by, titre, type_document, description, file_url, file_name, mime_type)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, req.user.entreprise_id, req.user.id, titre, type_document, description || null, saved.url, file_name || null, saved.mime]
        );
        res.status(201).json({ success: true, message: 'Document archive.', data: { id_document: id, file_url: saved.url } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getArchiveDocuments = async (req, res) => {
    if (!['manager', 'caissier'].includes(req.user.role)) return res.status(403).json({ success: false, message: 'Archives reservees au manager et au caissier.' });
    try {
        const [rows] = await pool.query(
            `SELECT da.*, u.nom AS uploaded_by_name
             FROM documents_archive da
             LEFT JOIN utilisateur u ON u.id_utilisateur = da.uploaded_by
             WHERE da.entreprise_id = ?
             ORDER BY da.created_at DESC
             LIMIT 200`,
            [req.user.entreprise_id]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
