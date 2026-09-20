const attendanceService = require("../services/attendanceService");

exports.getAll = async (req, res, next) => {
    try {
        const query = { ...req.query };

        // If barber is logged in, restrict to personal attendance
        if (req.user && req.user.role === "Barber") {
            if (!req.user.barber_id) {
                return res.status(200).json({ success: true, count: 0, data: [] });
            }
            query.barber_id = req.user.barber_id;
        }

        const data = await attendanceService.getAll(query);
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
        const data = await attendanceService.getById(req.params.id);

        if (req.user && req.user.role === "Barber") {
            if (data.barber_id._id.toString() !== req.user.barber_id) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied: You can only view your own attendance records"
                });
            }
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.checkIn = async (req, res, next) => {
    try {
        let barberId = req.body.barber_id;

        // If user is Barber, always use their own barber_id
        if (req.user && req.user.role === "Barber") {
            if (!req.user.barber_id) {
                return res.status(400).json({
                    success: false,
                    message: "No barber profile associated with your user account"
                });
            }
            barberId = req.user.barber_id;
        }

        if (!barberId) {
            return res.status(400).json({
                success: false,
                message: "barber_id is required"
            });
        }

        const data = await attendanceService.checkIn(barberId, req.body.check_in || new Date());
        res.status(201).json({
            success: true,
            message: "Check-in recorded successfully",
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.checkOut = async (req, res, next) => {
    try {
        let barberId = req.body.barber_id;

        // If user is Barber, always use their own barber_id
        if (req.user && req.user.role === "Barber") {
            if (!req.user.barber_id) {
                return res.status(400).json({
                    success: false,
                    message: "No barber profile associated with your user account"
                });
            }
            barberId = req.user.barber_id;
        }

        if (!barberId) {
            return res.status(400).json({
                success: false,
                message: "barber_id is required"
            });
        }

        const data = await attendanceService.checkOut(barberId, req.body.check_out || new Date());
        res.status(200).json({
            success: true,
            message: `Check-out recorded successfully. Total shift duration: ${data.total_hours} hours.`,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const data = await attendanceService.checkIn(req.body.barber_id, req.body.check_in || new Date());
        res.status(201).json({
            success: true,
            message: "Attendance card created successfully",
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const data = await attendanceService.update(req.params.id, req.body);
        res.status(200).json({
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
        await attendanceService.delete(req.params.id);
        res.status(200).json({
            success: true,
            message: "Attendance deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};