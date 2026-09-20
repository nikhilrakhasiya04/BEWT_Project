const wageRepository = require("../repositories/wageRepository");
const barberRepository = require("../repositories/barberRepository");
const appointmentRepository = require("../repositories/appointmentRepository");

/**
 * Calculates payroll variables and returns summarized statements for selected staff members.
 * Mandated Operational Commission Business Logic:
 * Process completed appointments automatically using individual performance shares.
 * Example: Base Haircut Price ₹300 * 40% = ₹120 Stylist Commission Share, ₹180 Salon Retained Share.
 */
exports.calculateMonthlyWage = async (barberId, month, baseSalary = 0) => {
    const barber = await barberRepository.findById(barberId);
    if (!barber) {
        const error = new Error("Barber not found");
        error.statusCode = 404;
        throw error;
    }

    const [yearStr, monthStr] = month.split("-");
    const year = parseInt(yearStr, 10);
    const m = parseInt(monthStr, 10) - 1;

    const startOfMonth = new Date(year, m, 1, 0, 0, 0);
    const endOfMonth = new Date(year, m + 1, 0, 23, 59, 59);

    // Fetch all completed appointments for this barber in this month
    const appointments = await appointmentRepository.findCompletedInMonth(barberId, startOfMonth, endOfMonth);

    const commissionRate = (barber.commission_percentage || 0) / 100;
    let totalServiceRevenue = 0;
    let totalCommission = 0;

    const appointmentBreakdown = appointments.map((app) => {
        const servicePrice = app.service_id ? app.service_id.price : 0;
        const commissionEarned = parseFloat((servicePrice * commissionRate).toFixed(2));
        const salonRetained = parseFloat((servicePrice - commissionEarned).toFixed(2));

        totalServiceRevenue += servicePrice;
        totalCommission += commissionEarned;

        return {
            appointment_id: app._id,
            date: app.appointment_date,
            service_name: app.service_id ? app.service_id.service_name : "Service",
            service_price: servicePrice,
            commission_rate: barber.commission_percentage,
            barber_commission: commissionEarned,
            corporate_retained: salonRetained
        };
    });

    totalCommission = parseFloat(totalCommission.toFixed(2));
    const finalSalary = parseFloat(Number(baseSalary).toFixed(2));
    const totalAmount = parseFloat((finalSalary + totalCommission).toFixed(2));
    const corporateRetainedTotal = parseFloat((totalServiceRevenue - totalCommission).toFixed(2));

    return {
        barber: {
            id: barber._id,
            name: barber.user_id ? barber.user_id.name : "Stylist",
            specialization: barber.specialization,
            commission_percentage: barber.commission_percentage
        },
        month,
        salary: finalSalary,
        commission: totalCommission,
        total_amount: totalAmount,
        completed_appointments_count: appointments.length,
        total_service_revenue_generated: totalServiceRevenue,
        corporate_retained_share: corporateRetainedTotal,
        breakdown: appointmentBreakdown
    };
};

/**
 * POST /api/wages - Finalizes monthly balance tables and logs financial payout distributions.
 */
exports.finalizeMonthlyWage = async (data) => {
    const { barber_id, month, salary = 0, payment_status = "Pending" } = data;

    const calculation = await exports.calculateMonthlyWage(barber_id, month, salary);

    // Check if wage record already exists for this month
    const existing = await wageRepository.findByBarberAndMonth(barber_id, month);

    const payload = {
        barber_id,
        month,
        salary: calculation.salary,
        commission: calculation.commission,
        total_amount: calculation.total_amount,
        completed_appointments_count: calculation.completed_appointments_count,
        payment_status
    };

    if (existing) {
        const updated = await wageRepository.update(existing._id, payload);
        return {
            message: `Wage record for ${month} updated and finalized`,
            data: updated,
            calculation_summary: calculation
        };
    } else {
        const created = await wageRepository.create(payload);
        const fullRecord = await wageRepository.findById(created._id);
        return {
            message: `Wage record for ${month} finalized and recorded`,
            data: fullRecord,
            calculation_summary: calculation
        };
    }
};

/**
 * GET /api/wages - Calculates payroll variables and returns summarized statements for selected staff members.
 */
exports.getAll = async (query = {}, currentUser = null) => {
    const filter = {};

    // If barber logged in, restrict to their personal wages
    if (currentUser && currentUser.role === "Barber") {
        if (!currentUser.barber_id) {
            return [];
        }
        filter.barber_id = currentUser.barber_id;
    } else if (query.barber_id) {
        filter.barber_id = query.barber_id;
    }

    if (query.month) {
        filter.month = query.month;
    }

    if (query.payment_status) {
        filter.payment_status = query.payment_status;
    }

    return wageRepository.findAll(filter);
};

exports.getById = async (id, currentUser = null) => {
    const wage = await wageRepository.findById(id);
    if (!wage) {
        const error = new Error("Wage record not found");
        error.statusCode = 404;
        throw error;
    }

    if (currentUser && currentUser.role === "Barber") {
        if (wage.barber_id._id.toString() !== currentUser.barber_id) {
            const error = new Error("Access denied: You can only view your own wage records");
            error.statusCode = 403;
            throw error;
        }
    }

    return wage;
};

exports.update = async (id, data) => {
    if (data.salary !== undefined || data.commission !== undefined) {
        const existing = await wageRepository.findById(id);
        if (!existing) {
            const error = new Error("Wage record not found");
            error.statusCode = 404;
            throw error;
        }
        const s = data.salary !== undefined ? Number(data.salary) : existing.salary;
        const c = data.commission !== undefined ? Number(data.commission) : existing.commission;
        data.total_amount = parseFloat((s + c).toFixed(2));
    }

    const wage = await wageRepository.update(id, data);
    if (!wage) {
        const error = new Error("Wage record not found");
        error.statusCode = 404;
        throw error;
    }
    return wage;
};

exports.delete = async (id) => {
    const wage = await wageRepository.remove(id);
    if (!wage) {
        const error = new Error("Wage record not found");
        error.statusCode = 404;
        throw error;
    }
    return wage;
};