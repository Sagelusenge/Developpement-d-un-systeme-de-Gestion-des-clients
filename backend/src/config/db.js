import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const sslEnabled = process.env.DB_SSL === 'REQUIRED' || process.env.DB_SSL === 'true';
const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: sslEnabled ? { rejectUnauthorized } : undefined,
    waitForConnections: true,
    connectionLimit: 10
});

export default pool;
