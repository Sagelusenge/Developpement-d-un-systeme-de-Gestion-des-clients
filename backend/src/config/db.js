import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Création du pool de connexions MySQL
const pool = mysql.createPool({
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT || 3306),
    user:     process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl:      process.env.DB_SSL === 'REQUIRED' ? { rejectUnauthorized: true } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
});

export default pool;
