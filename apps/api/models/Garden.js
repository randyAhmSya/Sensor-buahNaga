const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Garden {
    async getAll() {
        const sql = `
            SELECT g.*, 
                   COUNT(b.id_blok) as total_blocks 
            FROM garden g 
            LEFT JOIN blok b ON g.id_garden = b.garden_id 
            GROUP BY g.id_garden 
            ORDER BY g.created_at DESC
        `;
        const result = await query(sql);
        return result.rows;
    }

    async getById(id) {
        const sql = `
            SELECT g.*, 
                   json_agg(b.*) as blocks 
            FROM garden g 
            LEFT JOIN blok b ON g.id_garden = b.garden_id 
            WHERE g.id_garden = $1 
            GROUP BY g.id_garden
        `;
        const result = await query(sql, [id]);
        return result.rows[0];
    }

    async create(data) {
        const id = uuidv4();
        const sql = `
            INSERT INTO garden (id_garden, name, location, created_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        const result = await query(sql, [id, data.name, data.location]);
        return result.rows[0];
    }

    async update(id, data) {
        const fields = [];
        const values = [];
        let index = 1;

        if (data.name) {
            fields.push(`name = $${index++}`);
            values.push(data.name);
        }
        if (data.location !== undefined) {
            fields.push(`location = $${index++}`);
            values.push(data.location);
        }

        if (fields.length === 0) return null;

        values.push(id);
        const sql = `
            UPDATE garden 
            SET ${fields.join(', ')}
            WHERE id_garden = $${index}
            RETURNING *
        `;
        const result = await query(sql, values);
        return result.rows[0];
    }

    async delete(id) {
        
        const checkSql = 'SELECT COUNT(*) as total FROM blok WHERE garden_id = $1';
        const checkResult = await query(checkSql, [id]);
        
        if (parseInt(checkResult.rows[0].total) > 0) {
            return false;
        }

        const sql = 'DELETE FROM garden WHERE id_garden = $1 RETURNING id_garden';
        const result = await query(sql, [id]);
        return result.rows[0] ? true : false;
    }

    async getWithBlocks(id) {
    const sql = `
        SELECT g.*, 
               COUNT(b.id_blok) as total_blocks 
        FROM garden g 
        LEFT JOIN blok b ON g.id_garden = b.garden_id 
        WHERE g.id_garden = $1
        GROUP BY g.id_garden
        `;
    const result = await query(sql, [id]);
    return result.rows[0];
 }
}

module.exports = Garden;