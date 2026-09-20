const wageService = require("../services/wageService");

exports.getAll = async (req, res, next) => {
    try {
        const data = await wageService.getAll(req.query, req.user);
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
        const data = await wageService.getById(req.params.id, req.user);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.calculateStatement = async (req, res, next) => {
    try {
        let barberId = req.query.barber_id;
        const month = req.query.month;
        const salary = req.query.salary || 0;

        if (req.user && req.user.role === "Barber") {
            barberId = req.user.barber_id;
        }

        if (!barberId || !month) {
            return res.status(400).json({
                success: false,
                message: "barber_id and month (YYYY-MM) query parameters are required"
            });
        }

        const statement = await wageService.calculateMonthlyWage(barberId, month, salary);
        res.status(200).json({
            success: true,
            data: statement
        });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const result = await wageService.finalizeMonthlyWage(req.body);
        res.status(201).json({
            success: true,
            message: result.message,
            data: result.data,
            calculation_summary: result.calculation_summary
        });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const data = await wageService.update(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Wage record updated successfully",
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        await wageService.delete(req.params.id);
        res.status(200).json({
            success: true,
            message: "Wage record deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};