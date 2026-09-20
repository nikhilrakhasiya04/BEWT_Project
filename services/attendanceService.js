const attendanceRepository = require("../repositories/attendanceRepository");
const barberRepository = require("../repositories/barberRepository");

const getTodayDateStr = (d = new Date()) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

exports.getAll = (query = {}) => {
    const filter = {};

    if (query.barber_id) {
        filter.barber_id = query.barber_id;
    }

    if (query.date) {
        filter.date = query.date;
    } else if (query.month) {
        filter.date = { $regex: new RegExp(`^${query.month}`) };
    }

    return attendanceRepository.findAll(filter);
};

exports.getById = async (id) => {
    const attendance = await attendanceRepository.findById(id);
    if (!attendance) {
        const error = new Error("Attendance record not found");
        error.statusCode = 404;
        throw error;
    }
    return attendance;
};

/**
 * POST /api/attendance/checkin
 * Registers current timestamp data directly to open daily attendance cards.
 */
exports.checkIn = async (barberId, checkInTimestamp = new Date()) => {
    const barber = await barberRepository.findById(barberId);
    if (!barber) {
        const error = new Error("Barber not found");
        error.statusCode = 404;
        throw error;
    }

    const checkInDate = new Date(checkInTimestamp);
    const dateStr = getTodayDateStr(checkInDate);

    // Check if there is already an open check-in today
    const activeCheckIn = await attendanceRepository.findActiveCheckIn(barberId, dateStr);
    if (activeCheckIn) {
        const error = new Error(`Barber is already checked in for ${dateStr} at ${new Date(activeCheckIn.check_in).toLocaleTimeString()}`);
        error.statusCode = 400;
        throw error;
    }

    const record = await attendanceRepository.create({
        barber_id: barberId,
        check_in: checkInDate,
        date: dateStr,
        status: "Checked In"
    });

    return attendanceRepository.findById(record._id);
};

/**
 * POST /api/attendance/checkout
 * Closes the active time card tracking window for the current date.
 */
exports.checkOut = async (barberId, checkOutTimestamp = new Date()) => {
    const checkOutDate = new Date(checkOutTimestamp);
    const dateStr = getTodayDateStr(checkOutDate);

    // Locate open check-in
    let activeRecord = await attendanceRepository.findActiveCheckIn(barberId, dateStr);

    if (!activeRecord) {
        // Check if there is an active checkin from yesterday or any open record
        const anyActive = await attendanceRepository.findAll({ barber_id: barberId, check_out: null });
        if (anyActive && anyActive.length > 0) {
            activeRecord = anyActive[0];
        } else {
            const error = new Error("No active check-in record found for this barber to check out");
            error.statusCode = 400;
            throw error;
        }
    }

    const checkInTime = new Date(activeRecord.check_in).getTime();
    const checkOutTime = checkOutDate.getTime();

    if (checkOutTime < checkInTime) {
        const error = new Error("Check-out time cannot be earlier than check-in time");
        error.statusCode = 400;
        throw error;
    }

    const diffHours = parseFloat(((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2));

    const updated = await attendanceRepository.update(activeRecord._id, {
        check_out: checkOutDate,
        total_hours: diffHours,
        status: "Checked Out"
    });

    return updated;
};

exports.update = async (id, data) => {
    if (data.check_in && data.check_out) {
        const inTime = new Date(data.check_in).getTime();
        const outTime = new Date(data.check_out).getTime();
        data.total_hours = parseFloat(((outTime - inTime) / (1000 * 60 * 60)).toFixed(2));
        data.status = "Checked Out";
    }

    const attendance = await attendanceRepository.update(id, data);
    if (!attendance) {
        const error = new Error("Attendance record not found");
        error.statusCode = 404;
        throw error;
    }
    return attendance;
};

exports.delete = async (id) => {
    const attendance = await attendanceRepository.remove(id);
    if (!attendance) {
        const error = new Error("Attendance record not found");
        error.statusCode = 404;
        throw error;
    }
    return attendance;
};