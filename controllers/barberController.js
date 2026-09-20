const barberService = require("../services/barberService");

exports.getAll = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.specialization) {
            filter.specialization = { $regex: req.query.specialization, $options: "i" };
        }

        const data = await barberService.getAll(filter);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const data = await barberService.getById(req.params.id);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const data = await barberService.create(req.body);
        res.status(201).json({
            success: true,
            message: "Barber profile created successfully",
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const data = await barberService.update(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Barber profile updated successfully",
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const result = await barberService.delete(req.params.id);
        res.status(200).json({
            success: true,
            message: result.message,
            data: result.barber
        });
    } catch (error) {
        next(error);
    }
};