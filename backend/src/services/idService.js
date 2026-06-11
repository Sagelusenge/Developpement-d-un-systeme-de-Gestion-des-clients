export const nextId = async (connection, nomTable, prefix, size = 5) => {
    await connection.query(
        `INSERT INTO sequences (nom_table, derniere_valeur)
         VALUES (?, 0)
         ON DUPLICATE KEY UPDATE derniere_valeur = derniere_valeur`,
        [nomTable]
    );
    await connection.query(
        `UPDATE sequences SET derniere_valeur = derniere_valeur + 1 WHERE nom_table = ?`,
        [nomTable]
    );
    const [[row]] = await connection.query(
        `SELECT derniere_valeur FROM sequences WHERE nom_table = ?`,
        [nomTable]
    );
    return `${prefix}-${String(row.derniere_valeur).padStart(size, '0')}`;
};

export const nextFactureId = async (connection) => {
    const sequence = await nextId(connection, 'ventes', `FAC-${new Date().getFullYear()}`, 5);
    return sequence;
};
