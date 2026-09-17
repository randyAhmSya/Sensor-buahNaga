const Garden = require('../models/Garden');
const { successResponse, errorResponse } = require('../helpers/response');

const gardenModel = new Garden();

const getAllGardens = async (req, res) => {
    try {
        const gardens = await gardenModel.getAll();
        successResponse(res, 'Data garden berhasil diambil', gardens);
    } catch (error) {
        errorResponse(res, 'Terjadi kesalahan: ' + error.message, 500);
    }
};

const getGardenById = async (req, res) => {
    try {
        const { id } = req.params;
        const garden = await gardenModel.getWithBlocks(id);
        
        if (!garden) {
            return errorResponse(res, 'Garden tidak ditemukan', 404);
        }
        
        successResponse(res, 'Data garden berhasil diambil', garden);
    } catch (error) {
        errorResponse(res, 'Terjadi kesalahan: ' + error.message, 500);
    }
};

const createGarden = async (req, res) => {
    try {
        const garden = await gardenModel.create(req.validatedBody);
        successResponse(res, 'Garden berhasil dibuat', garden, 201);
    } catch (error) {
        errorResponse(res, 'Terjadi kesalahan: ' + error.message, 500);
    }
};

const updateGarden = async (req, res) => {
    try {
        const { id } = req.params;
        const garden = await gardenModel.update(id, req.validatedBody);
        
        if (!garden) {
            return errorResponse(res, 'Garden tidak ditemukan', 404);
        }
        
        successResponse(res, 'Garden berhasil diupdate', garden);
    } catch (error) {
        errorResponse(res, 'Terjadi kesalahan: ' + error.message, 500);
    }
};

const deleteGarden = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await gardenModel.delete(id);
        
        if (!result) {
            return errorResponse(res, 'Garden tidak dapat dihapus karena masih memiliki blok', 400);
        }
        
        successResponse(res, 'Garden berhasil dihapus');
    } catch (error) {
        errorResponse(res, 'Terjadi kesalahan: ' + error.message, 500);
    }
};

module.exports = {
    getAllGardens,
    getGardenById,
    createGarden,
    updateGarden,
    deleteGarden
};