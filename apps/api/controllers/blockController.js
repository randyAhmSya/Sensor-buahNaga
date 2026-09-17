const Block = require('../models/Block');
const { successResponse, errorResponse } = require('../helpers/response');

const blockModel = new Block();

const getAllBlocks = async (req, res) => {
    try {
        const blocks = await blockModel.getAll();
        successResponse(res, 'Data blok berhasil diambil', blocks);
    } catch (error) {
        errorResponse(res, 'Terjadi kesalahan: ' + error.message, 500);
    }
};

const getBlocksByGarden = async (req, res) => {
    try {
        const { gardenId } = req.params;
        const blocks = await blockModel.getByGarden(gardenId);
        successResponse(res, 'Data blok berhasil diambil', blocks);
    } catch (error) {
        errorResponse(res, 'Terjadi kesalahan: ' + error.message, 500);
    }
};

const createBlock = async (req, res) => {
    try {
        const block = await blockModel.create(req.validatedBody);
        
        if (!block) {
            return errorResponse(res, 'Blok dengan nama tersebut sudah ada di garden ini', 409);
        }
        
        successResponse(res, 'Blok berhasil dibuat', block, 201);
    } catch (error) {
        errorResponse(res, 'Terjadi kesalahan: ' + error.message, 500);
    }
};

const deleteBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await blockModel.delete(id);
        
        if (!result) {
            return errorResponse(res, 'Blok tidak dapat dihapus karena masih memiliki siklus panen', 400);
        }
        
        successResponse(res, 'Blok berhasil dihapus');
    } catch (error) {
        errorResponse(res, 'Terjadi kesalahan: ' + error.message, 500);
    }
};

module.exports = {
    getAllBlocks,
    getBlocksByGarden,
    createBlock,
    deleteBlock
};