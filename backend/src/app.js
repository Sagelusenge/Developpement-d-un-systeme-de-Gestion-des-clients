import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import errorHandler from './middleware/errorHandler.js';
import auditMiddleware from './middleware/auditMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import produitRoutes from './routes/produitRoutes.js';
import venteRoutes from './routes/venteRoutes.js';
import paiementRoutes from './routes/paiementRoutes.js';
import rapportRoutes from './routes/rapportRoutes.js';
import utilisateurRoutes from './routes/utilisateurRoutes.js';
import mailRoutes from './routes/mailRoutes.js';
import categorieRoutes from './routes/categorieRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import fournisseurRoutes from './routes/fournisseurRoutes.js';
import clientAuthRoutes from './routes/clientAuthRoutes.js';
import commandeRoutes from './routes/commandeRoutes.js';
import reclamationRoutes from './routes/reclamationRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import archiveRoutes from './routes/archiveRoutes.js';
import { stripeWebhook } from './controllers/paiementController.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5174')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Origine CORS non autorisee: ${origin}`));
    },
    credentials: true
}));
app.post('/api/paiements/stripe/webhook', express.raw({ type: 'application/json', limit: process.env.JSON_BODY_LIMIT || '8mb' }), stripeWebhook);
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '8mb' }));
app.use(auditMiddleware);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/categories', categorieRoutes);
app.use('/api/fournisseurs', fournisseurRoutes);
app.use('/api/ventes', venteRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/rapports', rapportRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/client-auth', clientAuthRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/reclamations', reclamationRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/archives', archiveRoutes);

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Quincaillerie Centrale API operationnelle' });
});
// bonjour
app.use(errorHandler);

export default app;
