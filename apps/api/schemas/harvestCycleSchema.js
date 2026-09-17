const Joi = require('joi');

const createHarvestCycleSchema = Joi.object({
    block_id: Joi.string().uuid().required()
        .messages({
            'string.guid': 'ID Block tidak valid',
            'any.required': 'Block ID wajib diisi'
        }),
    startdate: Joi.date().iso().required()
        .messages({
            'date.base': 'Tanggal mulai harus berupa tanggal yang valid',
            'date.iso': 'Format tanggal harus ISO (YYYY-MM-DD)',
            'any.required': 'Tanggal mulai wajib diisi'
        }),
    targetflowering: Joi.number().integer().min(1).max(365).required()
        .messages({
            'number.base': 'Target flowering harus berupa angka',
            'number.integer': 'Target flowering harus bilangan bulat',
            'number.min': 'Target flowering minimal 1 hari',
            'number.max': 'Target flowering maksimal 365 hari',
            'any.required': 'Target flowering wajib diisi'
        }),
    predictedharvestdate: Joi.date().iso().greater(Joi.ref('startdate')).required()
        .messages({
            'date.base': 'Tanggal prediksi panen harus berupa tanggal yang valid',
            'date.iso': 'Format tanggal harus ISO (YYYY-MM-DD)',
            'date.greater': 'Tanggal prediksi panen harus setelah tanggal mulai',
            'any.required': 'Tanggal prediksi panen wajib diisi'
        }),
    actualharvestdate: Joi.date().iso().optional().allow(null)
});

const updateHarvestCycleSchema = Joi.object({
    block_id: Joi.string().uuid().optional(),
    startdate: Joi.date().iso().optional(),
    targetflowering: Joi.number().integer().min(1).max(365).optional(),
    predictedharvestdate: Joi.date().iso().optional(),
    actualharvestdate: Joi.date().iso().optional().allow(null)
}).min(1);

module.exports = {
    createHarvestCycleSchema,
    updateHarvestCycleSchema
};