const Appointment = require("../models/Appointment");
const Barber = require("../models/Barber");
const Customer = require("../models/Customer");
const Attendance = require("../models/Attendance");

const pad = (n) => String(n).padStart(2, '0');

/**
 * 1. GET /api/reports/daily-revenue
 * Computes summarized operational income metrics for the current business date.
 */
exports.getDailyRevenue = async (dateParam) => {
    const today = dateParam ? new Date(dateParam) : new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    const appointments = await Appointment.find({
        appointment_date: { $gte: startOfDay, $lte: endOfDay }
    })
    .populate("service_id")
    .populate("barber_id");

    const totalBookings = appointments.length;
    const completedAppointments = appointments.filter((a) => a.status === "Completed");

    let grossRevenue = 0;
    let totalBarberCommission = 0;

    completedAppointments.forEach((app) => {
        const price = app.service_id ? app.service_id.price : 0;
        const rate = app.barber_id && app.barber_id.commission_percentage ? app.barber_id.commission_percentage / 100 : 0.4;
        const commission = price * rate;

        grossRevenue += price;
        totalBarberCommission += commission;
    });

    const corporateRetained = grossRevenue - totalBarberCommission;

    return {
        date: dateStr,
        total_appointments_booked: totalBookings,
        completed_appointments: completedAppointments.length,
        cancelled_appointments: appointments.filter((a) => a.status === "Cancelled").length,
        pending_appointments: appointments.filter((a) => ["Pending", "Confirmed", "In Progress"].includes(a.status)).length,
        financial_summary: {
            gross_revenue: parseFloat(grossRevenue.toFixed(2)),
            barber_commission_payout: parseFloat(totalBarberCommission.toFixed(2)),
            corporate_retained_net: parseFloat(corporateRetained.toFixed(2)),
            average_ticket_value: completedAppointments.length > 0 ? parseFloat((grossRevenue / completedAppointments.length).toFixed(2)) : 0.00
        }
    };
};

/**
 * 2. GET /api/reports/monthly-revenue
 * Computes income performance distributions across active fiscal terms.
 */
exports.getMonthlyRevenue = async (yearParam) => {
    const year = parseInt(yearParam || new Date().getFullYear(), 10);
    const startOfYear = new Date(year, 0, 1, 0, 0, 0);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const appointments = await Appointment.find({
        appointment_date: { $gte: startOfYear, $lte: endOfYear },
        status: "Completed"
    })
    .populate("service_id")
    .populate("barber_id");

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const monthlyData = monthNames.map((name, index) => {
        const monthKey = `${year}-${pad(index + 1)}`;
        return {
            month: monthKey,
            month_name: name,
            completed_count: 0,
            gross_revenue: 0,
            barber_commissions: 0,
            net_salon_revenue: 0
        };
    });

    appointments.forEach((app) => {
        const d = new Date(app.appointment_date);
        const m = d.getMonth();
        const price = app.service_id ? app.service_id.price : 0;
        const rate = app.barber_id && app.barber_id.commission_percentage ? app.barber_id.commission_percentage / 100 : 0.4;
        const commission = price * rate;

        monthlyData[m].completed_count += 1;
        monthlyData[m].gross_revenue += price;
        monthlyData[m].barber_commissions += commission;
        monthlyData[m].net_salon_revenue += (price - commission);
    });

    // Format numbers
    let annualGross = 0;
    let annualNet = 0;
    let annualCommissions = 0;

    const formattedMonths = monthlyData.map((m) => {
        annualGross += m.gross_revenue;
        annualNet += m.net_salon_revenue;
        annualCommissions += m.barber_commissions;

        return {
            ...m,
            gross_revenue: parseFloat(m.gross_revenue.toFixed(2)),
            barber_commissions: parseFloat(m.barber_commissions.toFixed(2)),
            net_salon_revenue: parseFloat(m.net_salon_revenue.toFixed(2))
        };
    });

    return {
        fiscal_year: year,
        annual_gross_revenue: parseFloat(annualGross.toFixed(2)),
        annual_barber_commissions: parseFloat(annualCommissions.toFixed(2)),
        annual_net_retained: parseFloat(annualNet.toFixed(2)),
        monthly_distribution: formattedMonths
    };
};

/**
 * 3. GET /api/reports/top-services
 * Rank-orders standard menu options by total purchase volume to pinpoint high-margin items.
 */
exports.getTopServices = async (limitParam = 10) => {
    const limit = parseInt(limitParam, 10) || 10;

    const appointments = await Appointment.find({ status: "Completed" }).populate("service_id");

    const serviceStats = {};

    appointments.forEach((app) => {
        if (!app.service_id) return;
        const sId = app.service_id._id.toString();
        if (!serviceStats[sId]) {
            serviceStats[sId] = {
                service_id: sId,
                service_name: app.service_id.service_name,
                unit_price: app.service_id.price,
                duration_minutes: app.service_id.duration,
                booking_count: 0,
                total_revenue_generated: 0
            };
        }
        serviceStats[sId].booking_count += 1;
        serviceStats[sId].total_revenue_generated += app.service_id.price;
    });

    const sorted = Object.values(serviceStats)
        .sort((a, b) => b.booking_count - a.booking_count || b.total_revenue_generated - a.total_revenue_generated)
        .slice(0, limit)
        .map((s, index) => ({
            rank: index + 1,
            ...s,
            total_revenue_generated: parseFloat(s.total_revenue_generated.toFixed(2))
        }));

    return {
        total_services_analyzed: Object.keys(serviceStats).length,
        rankings: sorted
    };
};

/**
 * 4. GET /api/reports/barber-performance
 * Summarizes appointment tracking metrics, total hours worked, and accumulated sales commissions for each stylist.
 */
exports.getBarberPerformance = async (monthParam) => {
    const barbers = await Barber.find().populate("user_id", "name email phone");

    let appointmentQuery = { status: "Completed" };
    let attendanceFilter = {};

    if (monthParam) {
        const [yearStr, monthStr] = monthParam.split("-");
        const year = parseInt(yearStr, 10);
        const m = parseInt(monthStr, 10) - 1;
        const startOfMonth = new Date(year, m, 1, 0, 0, 0);
        const endOfMonth = new Date(year, m + 1, 0, 23, 59, 59);

        appointmentQuery.appointment_date = { $gte: startOfMonth, $lte: endOfMonth };
        attendanceFilter.date = { $regex: new RegExp(`^${monthParam}`) };
    }

    const [appointments, attendances] = await Promise.all([
        Appointment.find(appointmentQuery).populate("service_id"),
        Attendance.find(attendanceFilter)
    ]);

    const performanceRecords = barbers.map((barber) => {
        const bId = barber._id.toString();

        const barberApps = appointments.filter((a) => a.barber_id.toString() === bId);
        const barberAtt = attendances.filter((att) => att.barber_id.toString() === bId);

        let totalRevenue = 0;
        let totalCommission = 0;
        const rate = (barber.commission_percentage || 0) / 100;

        barberApps.forEach((app) => {
            const price = app.service_id ? app.service_id.price : 0;
            totalRevenue += price;
            totalCommission += price * rate;
        });

        const totalHours = barberAtt.reduce((sum, att) => sum + (att.total_hours || 0), 0);

        return {
            barber_id: barber._id,
            name: barber.user_id ? barber.user_id.name : "Stylist",
            specialization: barber.specialization,
            commission_percentage: barber.commission_percentage,
            status: barber.status,
            completed_appointments: barberApps.length,
            total_hours_worked: parseFloat(totalHours.toFixed(2)),
            gross_revenue_generated: parseFloat(totalRevenue.toFixed(2)),
            accumulated_commissions: parseFloat(totalCommission.toFixed(2)),
            corporate_retained: parseFloat((totalRevenue - totalCommission).toFixed(2))
        };
    });

    return {
        month: monthParam || "All-Time",
        total_stylists: barbers.length,
        performance: performanceRecords.sort((a, b) => b.completed_appointments - a.completed_appointments)
    };
};

/**
 * 5. GET /api/reports/customer-visits
 * Analyzes customer return rates and tracks client retention frequencies across different branches.
 */
exports.getCustomerVisits = async () => {
    const [customers, appointments] = await Promise.all([
        Customer.find(),
        Appointment.find().populate("service_id")
    ]);

    const customerVisitMap = {};

    customers.forEach((c) => {
        customerVisitMap[c._id.toString()] = {
            customer_id: c._id,
            name: c.name,
            phone: c.phone,
            email: c.email,
            gender: c.gender,
            total_visits: 0,
            completed_visits: 0,
            cancelled_visits: 0,
            lifetime_spend: 0,
            first_visit: null,
            last_visit: null
        };
    });

    appointments.forEach((app) => {
        if (!app.customer_id) return;
        const cId = app.customer_id.toString();
        if (!customerVisitMap[cId]) return;

        const entry = customerVisitMap[cId];
        entry.total_visits += 1;

        if (app.status === "Completed") {
            entry.completed_visits += 1;
            if (app.service_id) {
                entry.lifetime_spend += app.service_id.price;
            }
        } else if (app.status === "Cancelled") {
            entry.cancelled_visits += 1;
        }

        const appDate = new Date(app.appointment_date);
        if (!entry.first_visit || appDate < new Date(entry.first_visit)) {
            entry.first_visit = appDate.toISOString();
        }
        if (!entry.last_visit || appDate > new Date(entry.last_visit)) {
            entry.last_visit = appDate.toISOString();
        }
    });

    const records = Object.values(customerVisitMap);
    const totalCustomers = records.length;
    const repeatCustomers = records.filter((r) => r.completed_visits > 1).length;
    const oneTimeCustomers = records.filter((r) => r.completed_visits === 1).length;
    const zeroVisits = records.filter((r) => r.completed_visits === 0).length;

    const retentionRate = totalCustomers > 0 ? parseFloat(((repeatCustomers / totalCustomers) * 100).toFixed(2)) : 0;

    return {
        total_registered_customers: totalCustomers,
        repeat_clients: repeatCustomers,
        single_visit_clients: oneTimeCustomers,
        inactive_clients: zeroVisits,
        retention_rate_percentage: `${retentionRate}%`,
        customer_profiles: records.sort((a, b) => b.completed_visits - a.completed_visits)
    };
};
