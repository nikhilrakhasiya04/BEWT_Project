const customerService = require("../services/customerService");

exports.getAll = async (req, res, next) => {
    try {
        const { search, page, limit } = req.query;
        const result = await customerService.getAll({ search, page, limit });
        res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const result = await customerService.getById(req.params.id);
        res.status(200).json({
            success: true,
            data: result.customer,
            total_visits: result.total_visits,
            completed_visits: result.completed_visits,
            visit_history: result.visit_history
        });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const customer = await customerService.create(req.body);
        res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: customer
        });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const customer = await customerService.update(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            data: customer
        });
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        await customerService.delete(req.params.id);
        res.status(200).json({
            success: true,
            message: "Customer deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};