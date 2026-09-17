const Joi = require('joi');

const createBlockSchema = Joi.object({
    name: Joi.string().min(3).max(100).required()
        .messages({
            'string.empty': 'Nama blok tidak boleh kosong',
            'string.min': 'Nama blok minimal 3 karakter',
            'string.max': 'Nama blok maksimal 100 karakter',
            'any.required': 'Nama blok wajib diisi'
        }),
    areasize: Joi.number().positive().optional()
        .messages({
            'number.base': 'Luas area harus berupa angka',
            'number.positive': 'Luas area harus lebih dari 0'
        }),
    garden_id: Joi.string().uuid().required()
        .messages({
            'string.guid': 'ID Garden tidak valid',
            'any.required': 'Garden ID wajib diisi'
        })
});

const updateBlockSchema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    areasize: Joi.number().positive().optional(),
    garden_id: Joi.string().uuid().optional()
}).min(1);

module.exports = {
    createBlockSchema,
    updateBlockSchema
};