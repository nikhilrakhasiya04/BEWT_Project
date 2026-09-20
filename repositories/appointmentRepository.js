const Appointment = require("../models/Appointment");

exports.findAll = (filter = {}) =>
    Appointment.find(filter)
        .populate("customer_id")
        .populate({
            path: "barber_id",
            populate: { path: "user_id", select: "name email phone" }
        })
        .populate("service_id")
        .sort({ appointment_date: -1 });

exports.findById = (id) =>
    Appointment.findById(id)
        .populate("customer_id")
        .populate({
            path: "barber_id",
            populate: { path: "user_id", select: "name email phone" }
        })
        .populate("service_id");

exports.findByCustomer = (customerId) =>
    Appointment.find({ customer_id: customerId })
        .populate("service_id")
        .populate({
            path: "barber_id",
            populate: { path: "user_id", select: "name" }
        })
        .sort({ appointment_date: -1 });

exports.findOverlapping = (barberId, startTime, endTime, excludeId = null) => {
    const query = {
        barber_id: barberId,
        status: { $nin: ["Cancelled"] },
        appointment_date: { $lt: new Date(endTime) },
        end_time: { $gt: new Date(startTime) }
    };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    return Appointment.find(query);
};

exports.findCompletedInMonth = (barberId, startOfMonth, endOfMonth) => {
    return Appointment.find({
        barber_id: barberId,
        status: "Completed",
        appointment_date: {
            $gte: new Date(startOfMonth),
            $lte: new Date(endOfMonth)
        }
    }).populate("service_id");
};

exports.create = (data) =>
    Appointment.create(data);

exports.update = (id, data) =>
    Appointment.findByIdAndUpdate(
        id,
        data,
        {
            returnDocument: "after",
            runValidators: true
        }
    )
    .populate("customer_id")
    .populate({
        path: "barber_id",
        populate: { path: "user_id", select: "name email phone" }
    })
    .populate("service_id");

exports.remove = (id) =>
    Appointment.findByIdAndDelete(id);