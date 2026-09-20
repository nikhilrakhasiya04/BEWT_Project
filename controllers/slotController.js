const slotService = require("../services/slotService");

exports.getAvailableSlots = async (req, res, next) => {
    try {
        const { barber_id, date, service_id, slot_interval } = req.query;
        const result = await slotService.getOpenTimeSlots({
            barber_id,
            date,
            service_id,
            slot_interval
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.createSlotException = async (req, res, next) => {
    try {
        const exception = await slotService.createSlotException(req.body);
        res.status(201).json({
            success: true,
            message: "Slot exception / blocked window created successfully",
            data: exception
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllSlotExceptions = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.type) {
            filter.type = req.query.type;
        }
        if (req.query.barber_id) {
            filter.barber_id = req.query.barber_id;
        }

        const data = await slotService.getAllSlotExceptions(filter);
        res.status(200).json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteSlotException = async (req, res, next) => {
    try {
        await slotService.deleteSlotException(req.params.id);
        res.status(200).json({
            success: true,
            message: "Slot exception removed successfully"
        });
    } catch (error) {
        next(error);
    }
};
