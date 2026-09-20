const appointmentRepository = require("../repositories/appointmentRepository");
const barberRepository = require("../repositories/barberRepository");
const slotExceptionRepository = require("../repositories/slotExceptionRepository");
const Service = require("../models/Service");

/**
 * 1. Double-Booking Overlap Checker
 * Intercepts execution to ensure stylist is never assigned overlapping tasks during matching timestamps.
 */
exports.validateDoubleBooking = async (barberId, startTime, endTime, excludeAppointmentId = null) => {
    const overlapping = await appointmentRepository.findOverlapping(
        barberId,
        startTime,
        endTime,
        excludeAppointmentId
    );

    if (overlapping && overlapping.length > 0) {
        const conflict = overlapping[0];
        const conflictStart = new Date(conflict.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const conflictEnd = conflict.end_time ? new Date(conflict.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'unknown';
        const error = new Error(
            `Scheduling Conflict: Barber already has an active appointment from ${conflictStart} to ${conflictEnd}. Overlapping is strictly prevented.`
        );
        error.statusCode = 409;
        throw error;
    }
};

/**
 * 2. Shift Window Validation Helper
 * The platform must verify that requested service start and end times fall strictly within a stylist's regular work hours.
 */
exports.validateShiftWindow = (barber, startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const pad = (n) => String(n).padStart(2, '0');
    
    // Check local hours
    const localStart = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
    const localEnd = `${pad(end.getHours())}:${pad(end.getMinutes())}`;

    // Check UTC hours
    const utcStart = `${pad(start.getUTCHours())}:${pad(start.getUTCMinutes())}`;
    const utcEnd = `${pad(end.getUTCHours())}:${pad(end.getUTCMinutes())}`;

    const shiftStart = barber.shift_start || "09:00";
    const shiftEnd = barber.shift_end || "19:00";

    // Detect if outside shift hours
    const isLocalViolated = localStart < shiftStart || localEnd > shiftEnd;
    const isUtcViolated = utcStart < shiftStart || utcEnd > shiftEnd;

    if (isLocalViolated && isUtcViolated) {
        const error = new Error(
            `Shift Window Violation: Requested booking (${localStart} - ${localEnd}) falls outside the stylist's working shift (${shiftStart} - ${shiftEnd}).`
        );
        error.statusCode = 400;
        throw error;
    }
};

/**
 * 3. Calendar Exception Validator
 * Intercepts entries to block appointments from being scheduled on official business holidays or blocked windows.
 */
exports.validateCalendarExceptions = async (barberId, startTime, endTime) => {
    const exceptions = await slotExceptionRepository.findOverlapping(startTime, endTime, barberId);

    if (exceptions && exceptions.length > 0) {
        const exc = exceptions[0];
        const error = new Error(
            `Calendar Exception: Booking blocked due to "${exc.title}" (${exc.type}) from ${new Date(exc.start_time).toLocaleString()} to ${new Date(exc.end_time).toLocaleString()}.`
        );
        error.statusCode = 400;
        throw error;
    }
};

/**
 * GET /api/slots - Checks active barber calendars to list open time windows.
 */
exports.getOpenTimeSlots = async ({ barber_id, date, service_id, slot_interval = 30 }) => {
    if (!barber_id || !date) {
        const error = new Error("barber_id and date (YYYY-MM-DD) query parameters are required");
        error.statusCode = 400;
        throw error;
    }

    const barber = await barberRepository.findById(barber_id);
    if (!barber) {
        const error = new Error("Barber not found");
        error.statusCode = 404;
        throw error;
    }

    let requiredDuration = Number(slot_interval);
    if (service_id) {
        const service = await Service.findById(service_id);
        if (service) {
            requiredDuration = service.duration;
        }
    }

    const shiftStart = barber.shift_start || "09:00";
    const shiftEnd = barber.shift_end || "19:00";

    const [startH, startM] = shiftStart.split(":").map(Number);
    const [endH, endM] = shiftEnd.split(":").map(Number);

    const targetDate = new Date(date);
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), startH, startM, 0);
    const dayEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), endH, endM, 0);

    // Fetch existing appointments on this date
    const existingAppointments = await appointmentRepository.findAll({
        barber_id: barber_id,
        status: { $nin: ["Cancelled"] },
        appointment_date: {
            $gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0),
            $lte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59)
        }
    });

    // Fetch exceptions/holidays on this date
    const exceptions = await slotExceptionRepository.findAll({
        start_time: { $lte: dayEnd },
        end_time: { $gte: dayStart },
        $or: [{ barber_id: null }, { barber_id: barber_id }]
    });

    const slots = [];
    let currentSlotStart = new Date(dayStart);

    while (currentSlotStart.getTime() + requiredDuration * 60000 <= dayEnd.getTime()) {
        const currentSlotEnd = new Date(currentSlotStart.getTime() + requiredDuration * 60000);

        // Check if overlaps with any appointment
        const hasAppointmentConflict = existingAppointments.some((app) => {
            const appStart = new Date(app.appointment_date);
            const appEnd = app.end_time ? new Date(app.end_time) : new Date(appStart.getTime() + 30 * 60000);
            return currentSlotStart < appEnd && currentSlotEnd > appStart;
        });

        // Check if overlaps with any exception / holiday
        const hasExceptionConflict = exceptions.some((exc) => {
            const excStart = new Date(exc.start_time);
            const excEnd = new Date(exc.end_time);
            return currentSlotStart < excEnd && currentSlotEnd > excStart;
        });

        const pad = (n) => String(n).padStart(2, '0');
        const timeStr = `${pad(currentSlotStart.getHours())}:${pad(currentSlotStart.getMinutes())}`;
        const endTimeStr = `${pad(currentSlotEnd.getHours())}:${pad(currentSlotEnd.getMinutes())}`;

        slots.push({
            start_time: currentSlotStart.toISOString(),
            end_time: currentSlotEnd.toISOString(),
            time_display: `${timeStr} - ${endTimeStr}`,
            is_available: !hasAppointmentConflict && !hasExceptionConflict,
            reason: hasAppointmentConflict
                ? "Booked"
                : hasExceptionConflict
                ? "Holiday / Blocked"
                : "Available"
        });

        currentSlotStart = new Date(currentSlotStart.getTime() + 30 * 60000);
    }

    return {
        barber: {
            id: barber._id,
            name: barber.user_id ? barber.user_id.name : "Stylist",
            specialization: barber.specialization,
            shift: `${shiftStart} - ${shiftEnd}`
        },
        date,
        duration_minutes: requiredDuration,
        available_slots_count: slots.filter((s) => s.is_available).length,
        total_slots_count: slots.length,
        slots
    };
};

/**
 * Slot Exceptions / Blocked Windows Configuration
 */
exports.createSlotException = (data) => {
    return slotExceptionRepository.create(data);
};

exports.getAllSlotExceptions = (filter) => {
    return slotExceptionRepository.findAll(filter);
};

exports.deleteSlotException = async (id) => {
    const res = await slotExceptionRepository.remove(id);
    if (!res) {
        const error = new Error("Slot exception not found");
        error.statusCode = 404;
        throw error;
    }
    return res;
};
