const serviceService = require("../services/serviceService");

exports.getAll = async (req, res, next) => {
    try {
        const data = await serviceService.getAll();
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
        const data = await serviceService.getById(req.params.id);
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
        const data = await serviceService.create(req.body);
        res.status(201).json({
            success: true,
            message: "Service item created successfully",
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const data = await serviceService.update(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Service item updated successfully",
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        await serviceService.delete(req.params.id);
        res.status(200).json({
            success: true,
            message: "Service item deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};