const service = require("../services/attendanceService");

exports.getAll = async (req, res, next) => {
    try {
        const data = await service.getAll();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const data = await service.getById(req.params.id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const data = await service.create(req.body);

        res.status(201).json({
            success: true,
            message: "Attendance created successfully",
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const data = await service.update(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: "Attendance updated successfully",
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        await service.delete(req.params.id);

        res.json({
            success: true,
            message: "Attendance deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};