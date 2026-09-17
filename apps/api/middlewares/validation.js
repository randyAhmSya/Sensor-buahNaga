const { validateSchema } = require('../helpers/response');

const validate = (schema) => {
    return (req, res, next) => {
        const { error, errors, value } = validateSchema(schema, req.body);
        
        if (error) {
            return res.status(422).json({
                success: false,
                message: 'Validasi gagal',
                errors
            });
        }
        req.validatedBody = value;
        next();
    };
};

module.exports = validate;