const Joi = require('joi');

const createGardenSchema = Joi.object({
    name: Joi.string().min(3).max(100).required()
        .messages({
            'string.empty': 'Nama garden tidak boleh kosong',
            'string.min': 'Nama garden minimal 3 karakter',
            'string.max': 'Nama garden maksimal 100 karakter',
            'any.required': 'Nama garden wajib diisi'
        }),
    location: Joi.string().max(200).optional()
        .messages({
            'string.max': 'Lokasi maksimal 200 karakter'
        })
});

const updateGardenSchema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    location: Joi.string().max(200).optional()
}).min(1);

module.exports = {
    createGardenSchema,
    updateGardenSchema
};