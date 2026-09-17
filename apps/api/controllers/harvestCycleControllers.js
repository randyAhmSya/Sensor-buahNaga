const HarvestCycle = require('../models/HarvestCycle');
const { successResponse, errorResponse } = require('../helpers/response');

const harvestModel = new HarvestCycle();

const getAllHarvestCycles = async (req, res) => {
    try {
        const cycles = await harvestModel.getAll();
        successResponse(res, 'Data siklus panen berhasil diambil', cycles);
    } catch (error) {
        errorResponse(res, 'Terjadi kesalahan: ' + error.message, 500);
    }
};

const getHarvestCyclesByBlock = async (req, res) => {
    try {
        const { blockId } = req.params;
        const cycles = await harvestModel.getByBlock(blockId);
        successResponse(res, 'Data siklus panen berhasil diambil', cycles);
    } catch (error) {
        errorResponse(res, 'Terjadi kesalahan: ' + error.message, 500);
    }
};

const getActiveCycles = async (req, res) => {
    try {
        const cycles = await harvestModel.getActiveCycles();
        successResponse(res, 'Data siklus panen aktif berhasil diambil', cycles);
    } catch (error) {
        errorResponse(res, 'Terjadi kesalahan: ' + error.message, 500);
    }
};

const getCompletedCycles = async (req, res) => {
    try {
        const cycles = await harvestModel.getCompletedCycles();
        successResponse(res, 'Data siklus panen selesai berhasil diambil', cycles);
    } catch (error) {
        errorResponse(res, 'Terjadi kesalahan: ' + error.message, 500);
    }
};

const createHarvestCycle = async (req, res) => {
    try {
        const cycle = await harvestModel.create(req.validatedBody);
        
        if (!cycle) {
            return errorResponse(res, 'Blok ini masih memiliki siklus panen yang aktif', 400);
        }
        
        successResponse(res, 'Siklus panen berhasil dimulai', cycle, 201);
    } catch (error) {
        errorResponse(res, 'Terjadi kesalahan: ' + error.message, 500);
    }
};

const harvestNow = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await harvestModel.harvestNow(id);
        
        if (!result) {
            return errorResponse(res, 'Siklus panen tidak ditemukan atau sudah dipanen', 404);
        }
        
        successResponse(res, 'Panen berhasil dilakukan', result);
    } catch (error) {
        errorResponse(res, 'Terjadi kesalahan: ' + error.message, 500);
    }
};

const deleteHarvestCycle = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await harvestModel.delete(id);
        
        if (!result) {
            return errorResponse(res, 'Siklus panen tidak ditemukan', 404);
        }
        
        successResponse(res, 'Siklus panen berhasil dihapus');
    } catch (error) {
        errorResponse(res, 'Terjadi kesalahan: ' + error.message, 500);
    }
};

module.exports = {
    getAllHarvestCycles,
    getHarvestCyclesByBlock,
    getActiveCycles,
    getCompletedCycles,
    createHarvestCycle,
    harvestNow,
    deleteHarvestCycle
};