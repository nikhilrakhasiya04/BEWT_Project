const appointmentRepository = require("../repositories/appointmentRepository");
const barberRepository = require("../repositories/barberRepository");
const customerRepository = require("../repositories/customerRepository");
const serviceRepository = require("../repositories/serviceRepository");
const slotService = require("./slotService");

exports.getAll = async (query = {}) => {
    const filter = {};

    if (query.status) {
        filter.status = query.status;
    }

    if (query.barber_id) {
        filter.barber_id = query.barber_id;
    }

    if (query.customer_id) {
        filter.customer_id = query.customer_id;
    }

    if (query.date) {
        const d = new Date(query.date);
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
        const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
        filter.appointment_date = { $gte: start, $lte: end };
    } else if (query.startDate && query.endDate) {
        filter.appointment_date = {
            $gte: new Date(query.startDate),
            $lte: new Date(query.endDate)
        };
    }

    return appointmentRepository.findAll(filter);
};

exports.getById = async (id) => {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
        const error = new Error("Appointment not found");
        error.statusCode = 404;
        throw error;
    }
    return appointment;
};

exports.create = async (data) => {
    // 1. Validate Customer
    const customer = await customerRepository.findById(data.customer_id);
    if (!customer) {
        const error = new Error("Customer not found");
        error.statusCode = 404;
        throw error;
    }

    // 2. Validate Barber
    const barber = await barberRepository.findById(data.barber_id);
    if (!barber) {
        const error = new Error("Barber not found");
        error.statusCode = 404;
        throw error;
    }

    if (barber.status === "Inactive") {
        const error = new Error("Selected barber is currently inactive");
        error.statusCode = 400;
        throw error;
    }

    // 3. Validate Service
    const service = await serviceRepository.findById(data.service_id);
    if (!service) {
        const error = new Error("Service not found");
        error.statusCode = 404;
        throw error;
    }

    // 4. Compute End Time based on Service Duration
    const startTime = new Date(data.appointment_date);
    const durationMinutes = service.duration || 30;
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    data.end_time = endTime;

    // 5. Run Scheduling Business Validations
    // a) Shift Window Validation
    slotService.validateShiftWindow(barber, startTime, endTime);

    // b) Calendar Exception / Holiday Validation
    await slotService.validateCalendarExceptions(barber._id, startTime, endTime);

    // c) Double-Booking Overlap Checker
    await slotService.validateDoubleBooking(barber._id, startTime, endTime);

    // 6. Default status to "Pending" if not provided
    if (!data.status) {
        data.status = "Pending";
    }

    const created = await appointmentRepository.create(data);
    return appointmentRepository.findById(created._id);
};

exports.update = async (id, data) => {
    const existing = await appointmentRepository.findById(id);
    if (!existing) {
        const error = new Error("Appointment not found");
        error.statusCode = 404;
        throw error;
    }

    // If barber or appointment_date or service changed, re-validate scheduling
    const targetBarberId = data.barber_id || existing.barber_id._id;
    const targetServiceId = data.service_id || existing.service_id._id;
    const targetStartTime = data.appointment_date ? new Date(data.appointment_date) : new Date(existing.appointment_date);

    if (data.barber_id || data.appointment_date || data.service_id) {
        const service = await serviceRepository.findById(targetServiceId);
        const barber = await barberRepository.findById(targetBarberId);

        if (!service || !barber) {
            const error = new Error("Service or Barber not found");
            error.statusCode = 404;
            throw error;
        }

        const durationMinutes = service.duration || 30;
        const targetEndTime = new Date(targetStartTime.getTime() + durationMinutes * 60000);
        data.end_time = targetEndTime;

        // Run validation excluding current appointment ID
        slotService.validateShiftWindow(barber, targetStartTime, targetEndTime);
        await slotService.validateCalendarExceptions(barber._id, targetStartTime, targetEndTime);
        await slotService.validateDoubleBooking(barber._id, targetStartTime, targetEndTime, id);
    }

    const updated = await appointmentRepository.update(id, data);
    return updated;
};

exports.delete = async (id) => {
    const appointment = await appointmentRepository.remove(id);
    if (!appointment) {
        const error = new Error("Appointment not found");
        error.statusCode = 404;
        throw error;
    }
    return appointment;
};