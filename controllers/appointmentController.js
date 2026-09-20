const appointmentService = require("../services/appointmentService");

exports.getAll = async (req, res, next) => {
    try {
        const data = await appointmentService.getAll(req.query);
        res.status(200).json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const data = await appointmentService.getById(req.params.id);
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
        const data = await appointmentService.create(req.body);
        res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const data = await appointmentService.update(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Appointment updated successfully",
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        await appointmentService.delete(req.params.id);
        res.status(200).json({
            success: true,
            message: "Appointment deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};