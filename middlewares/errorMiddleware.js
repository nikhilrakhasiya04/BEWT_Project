exports.errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = undefined;

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation Error";
        errors = Object.values(err.errors).map((val) => val.message);
    }

    // Mongoose bad ObjectId / CastError
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid resource identifier: ${err.value}`;
    }

    // Mongoose duplicate key error (code 11000)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || "field";
        message = `Duplicate value entered for ${field}. It must be unique.`;
    }

    // JWT Error handling
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid authorization token";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Authorization token expired";
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(errors ? { errors } : {})
    });
};