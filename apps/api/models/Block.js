const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Block {
    async getAll() {
        const sql = `
            SELECT b.*, g.name as garden_name 
            FROM blok b 
            LEFT JOIN garden g ON b.garden_id = g.id_garden 
            ORDER BY b.created_at DESC
        `;
        const result = await query(sql);
        return result.rows;
    }

    async getByGarden(gardenId) {
        const sql = `
            SELECT b.*, g.name as garden_name,
                   COUNT(h.id_harvest) as total_harvests 
            FROM blok b 
            LEFT JOIN garden g ON b.garden_id = g.id_garden 
            LEFT JOIN harvestcycle h ON b.id_blok = h.block_id 
            WHERE b.garden_id = $1 
            GROUP BY b.id_blok, g.name 
            ORDER BY b.created_at DESC
        `;
        const result = await query(sql, [gardenId]);
        return result.rows;
    }

    async getById(id) {
        const sql = `
            SELECT b.*, g.name as garden_name 
            FROM blok b 
            LEFT JOIN garden g ON b.garden_id = g.id_garden 
            WHERE b.id_blok = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0];
    }

    async create(data) {
        // Check duplicate name
        const checkSql = 'SELECT COUNT(*) as total FROM blok WHERE name = $1 AND garden_id = $2';
        const checkResult = await query(checkSql, [data.name, data.garden_id]);
        
        if (parseInt(checkResult.rows[0].total) > 0) {
            return false; // Duplicate name
        }

        const id = uuidv4();
        const sql = `
            INSERT INTO blok (id_blok, name, areasize, garden_id, created_at)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        const result = await query(sql, [id, data.name, data.areasize, data.garden_id]);
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
        if (data.areasize !== undefined) {
            fields.push(`areasize = $${index++}`);
            values.push(data.areasize);
        }
        if (data.garden_id) {
            fields.push(`garden_id = $${index++}`);
            values.push(data.garden_id);
        }

        if (fields.length === 0) return null;

        values.push(id);
        const sql = `
            UPDATE blok 
            SET ${fields.join(', ')}
            WHERE id_blok = $${index}
            RETURNING *
        `;
        const result = await query(sql, values);
        return result.rows[0];
    }

    async delete(id) {
        // Check if has harvest cycles
        const checkSql = 'SELECT COUNT(*) as total FROM harvestcycle WHERE block_id = $1';
        const checkResult = await query(checkSql, [id]);
        
        if (parseInt(checkResult.rows[0].total) > 0) {
            return false; // Cannot delete block with harvest cycles
        }

        const sql = 'DELETE FROM blok WHERE id_blok = $1 RETURNING id_blok';
        const result = await query(sql, [id]);
        return result.rows[0] ? true : false;
    }

    async getWithHarvests(id) {
        const sql = `
            SELECT b.*, g.name as garden_name,
                   COALESCE(json_agg(h.*) FILTER (WHERE h.id_harvest IS NOT NULL), '[]') as harvests 
            FROM blok b 
            LEFT JOIN garden g ON b.garden_id = g.id_garden 
            LEFT JOIN harvestcycle h ON b.id_blok = h.block_id 
            WHERE b.id_blok = $1 
            GROUP BY b.id_blok, g.name
        `;
        const result = await query(sql, [id]);
        return result.rows[0];
    }
}

module.exports = Block;