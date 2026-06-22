import app from './app.js';
import dotenv from 'dotenv';
import pool from './config/db.js';
import { ensureRuntimeSchema } from './services/schemaService.js';
import { sendProspectFollowUpEmails, sendWeeklyClientRecommendations } from './services/clientLoyaltyService.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    app.listen(PORT, () => {
        console.log(`Serveur demarre sur http://localhost:${PORT}`);
    });

    try {
        const connection = await pool.getConnection();
        console.log('Base de donnees CRM_PME connectee');
        connection.release();

        await ensureRuntimeSchema(pool);
        sendProspectFollowUpEmails().catch((error) => console.error('Relance prospects:', error.message));
        sendWeeklyClientRecommendations().catch((error) => console.error('Recommandations clients:', error.message));
        setInterval(() => sendProspectFollowUpEmails().catch((error) => console.error('Relance prospects:', error.message)), 60 * 60 * 1000).unref();
        setInterval(() => sendWeeklyClientRecommendations().catch((error) => console.error('Recommandations clients:', error.message)), 24 * 60 * 60 * 1000).unref();
    } catch (error) {
        console.error('Base de donnees indisponible au demarrage:', error.message);
        console.error('Le serveur reste en ligne. Verifiez DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME et DB_SSL sur Render.');
    }
};

startServer();
