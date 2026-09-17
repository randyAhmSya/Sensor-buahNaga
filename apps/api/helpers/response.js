const successResponse = (res, message, data = null, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const errorResponse = (res, message, statusCode = 400, errors = null) => {
    const response = {
        success: false,
        message
    };
    
    if (errors) {
        response.errors = errors;
    }
    
    return res.status(statusCode).json(response);
};

const validateSchema = (schema, data) => {
    const { error, value } = schema.validate(data, { abortEarly: false });
    
    if (error) {
        const errors = error.details.map(detail => ({
            field: detail.path[0],
            message: detail.message
        }));
        return { error: true, errors };
    }
    
    return { error: false, value };
};

module.exports = {
    successResponse,
    errorResponse,
    validateSchema
};