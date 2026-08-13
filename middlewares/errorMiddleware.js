exports.errorHandler = (err, req, res, next) => {

    console.error(err);

    if (err.name === "ValidationError") {

        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: Object.values(err.errors).map(
                error => error.message
            )
        });
    }

    if (err.name === "CastError") {

        return res.status(400).json({
            success: false,
            message: "Invalid ID"
        });
    }

    if (err.code === 11000) {

        return res.status(409).json({
            success: false,
            message: "Duplicate value already exists"
        });
    }

    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};