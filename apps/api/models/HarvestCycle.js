const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class HarvestCycle {
    async getAll() {
        const sql = `
            SELECT h.*, b.name as block_name, g.name as garden_name 
            FROM harvestcycle h 
            LEFT JOIN blok b ON h.block_id = b.id_blok 
            LEFT JOIN garden g ON b.garden_id = g.id_garden 
            ORDER BY h.startdate DESC
        `;
        const result = await query(sql);
        return result.rows;
    }

    async getByBlock(blockId) {
        const sql = `
            SELECT h.*, b.name as block_name, g.name as garden_name 
            FROM harvestcycle h 
            LEFT JOIN blok b ON h.block_id = b.id_blok 
            LEFT JOIN garden g ON b.garden_id = g.id_garden 
            WHERE h.block_id = $1 
            ORDER BY h.startdate DESC
        `;
        const result = await query(sql, [blockId]);
        return result.rows;
    }

    async getById(id) {
        const sql = `
            SELECT h.*, b.name as block_name, g.name as garden_name 
            FROM harvestcycle h 
            LEFT JOIN blok b ON h.block_id = b.id_blok 
            LEFT JOIN garden g ON b.garden_id = g.id_garden 
            WHERE h.id_harvest = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0];
    }

    async create(data) {
        // Check for active cycle
        const checkSql = 'SELECT COUNT(*) as total FROM harvestcycle WHERE block_id = $1 AND actualharvestdate IS NULL';
        const checkResult = await query(checkSql, [data.block_id]);
        
        if (parseInt(checkResult.rows[0].total) > 0) {
            return false; // Active cycle exists
        }

        const id = uuidv4();
        const sql = `
            INSERT INTO harvestcycle (id_harvest, block_id, startdate, targetflowering, predictedharvestdate, actualharvestdate)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const result = await query(sql, [
            id,
            data.block_id,
            data.startdate,
            data.targetflowering,
            data.predictedharvestdate,
            data.actualharvestdate || null
        ]);
        return result.rows[0];
    }

    async update(id, data) {
        const fields = [];
        const values = [];
        let index = 1;

        if (data.block_id) {
            fields.push(`block_id = $${index++}`);
            values.push(data.block_id);
        }
        if (data.startdate) {
            fields.push(`startdate = $${index++}`);
            values.push(data.startdate);
        }
        if (data.targetflowering) {
            fields.push(`targetflowering = $${index++}`);
            values.push(data.targetflowering);
        }
        if (data.predictedharvestdate) {
            fields.push(`predictedharvestdate = $${index++}`);
            values.push(data.predictedharvestdate);
        }
        if (data.actualharvestdate !== undefined) {
            fields.push(`actualharvestdate = $${index++}`);
            values.push(data.actualharvestdate);
        }

        if (fields.length === 0) return null;

        values.push(id);
        const sql = `
            UPDATE harvestcycle 
            SET ${fields.join(', ')}
            WHERE id_harvest = $${index}
            RETURNING *
        `;
        const result = await query(sql, values);
        return result.rows[0];
    }

    async harvestNow(id) {
        const sql = `
            UPDATE harvestcycle 
            SET actualharvestdate = CURRENT_TIMESTAMP 
            WHERE id_harvest = $1 AND actualharvestdate IS NULL 
            RETURNING *
        `;
        const result = await query(sql, [id]);
        return result.rows[0] || false;
    }

    async delete(id) {
        const sql = 'DELETE FROM harvestcycle WHERE id_harvest = $1 RETURNING id_harvest';
        const result = await query(sql, [id]);
        return result.rows[0] ? true : false;
    }

    async getActiveCycles() {
        const sql = `
            SELECT h.*, b.name as block_name, g.name as garden_name 
            FROM harvestcycle h 
            LEFT JOIN blok b ON h.block_id = b.id_blok 
            LEFT JOIN garden g ON b.garden_id = g.id_garden 
            WHERE h.actualharvestdate IS NULL 
            ORDER BY h.startdate DESC
        `;
        const result = await query(sql);
        return result.rows;
    }

    async getCompletedCycles() {
        const sql = `
            SELECT h.*, b.name as block_name, g.name as garden_name 
            FROM harvestcycle h 
            LEFT JOIN blok b ON h.block_id = b.id_blok 
            LEFT JOIN garden g ON b.garden_id = g.id_garden 
            WHERE h.actualharvestdate IS NOT NULL 
            ORDER BY h.actualharvestdate DESC
        `;
        const result = await query(sql);
        return result.rows;
    }
}

module.exports = HarvestCycle;