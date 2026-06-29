import express from 'express';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, '..', 'uploads');
const allowedFolders = new Set(['products', 'categories', 'companies']);
const allowedMimeTypes = new Map([
    ['image/jpeg', 'jpg'],
    ['image/png', 'png'],
    ['image/webp', 'webp'],
    ['image/gif', 'gif']
]);

const publicBaseUrl = (req) => String(process.env.API_PUBLIC_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');

router.post('/image', protect, authorizeRoles('manager', 'magasinier'), async (req, res) => {
    try {
        const folder = allowedFolders.has(String(req.body.folder || 'products')) ? String(req.body.folder || 'products') : 'products';
        const canUpload = (folder === 'companies' && req.user.role === 'manager')
            || (folder !== 'companies' && req.user.role === 'magasinier');
        if (!canUpload) {
            return res.status(403).json({ success: false, message: 'Vous ne pouvez pas charger une image dans ce dossier.' });
        }
        const dataUrl = String(req.body.data_url || '');
        const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([a-z0-9+/=]+)$/i);
        if (!match) return res.status(400).json({ success: false, message: 'Image invalide. Formats acceptes: JPG, PNG, WEBP ou GIF.' });

        const mime = match[1].toLowerCase();
        const extension = allowedMimeTypes.get(mime);
        const buffer = Buffer.from(match[2], 'base64');
        const maxSize = Number(process.env.UPLOAD_MAX_BYTES || 3 * 1024 * 1024);
        if (!buffer.length || buffer.length > maxSize) {
            return res.status(400).json({ success: false, message: `Image trop lourde. Taille maximum: ${Math.round(maxSize / 1024 / 1024)} Mo.` });
        }

        const targetDir = path.join(uploadsRoot, folder);
        await fs.mkdir(targetDir, { recursive: true });
        const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${extension}`;
        await fs.writeFile(path.join(targetDir, filename), buffer);
        const url = `${publicBaseUrl(req)}/uploads/${folder}/${filename}`;
        res.status(201).json({ success: true, data: { url } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
