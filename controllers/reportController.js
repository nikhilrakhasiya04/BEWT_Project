const reportService = require("../services/reportService");

exports.getDailyRevenue = async (req, res, next) => {
    try {
        const { date } = req.query;
        const data = await reportService.getDailyRevenue(date);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.getMonthlyRevenue = async (req, res, next) => {
    try {
        const { year } = req.query;
        const data = await reportService.getMonthlyRevenue(year);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.getTopServices = async (req, res, next) => {
    try {
        const { limit } = req.query;
        const data = await reportService.getTopServices(limit);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.getBarberPerformance = async (req, res, next) => {
    try {
        const { month } = req.query;
        const data = await reportService.getBarberPerformance(month);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.getCustomerVisits = async (req, res, next) => {
    try {
        const data = await reportService.getCustomerVisits();
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};
