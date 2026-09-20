const Attendance = require("../models/Attendance");

exports.findAll = (filter = {}) =>
    Attendance.find(filter)
        .populate({
            path: "barber_id",
            populate: { path: "user_id", select: "name email phone" }
        })
        .sort({ date: -1, check_in: -1 });

exports.findById = (id) =>
    Attendance.findById(id)
        .populate({
            path: "barber_id",
            populate: { path: "user_id", select: "name email phone" }
        });

exports.findActiveCheckIn = (barberId, date) =>
    Attendance.findOne({
        barber_id: barberId,
        date: date,
        check_out: null
    });

exports.findByBarberAndDate = (barberId, date) =>
    Attendance.find({
        barber_id: barberId,
        date: date
    });

exports.create = (data) =>
    Attendance.create(data);

exports.update = (id, data) =>
    Attendance.findByIdAndUpdate(
        id,
        data,
        {
            returnDocument: "after",
            runValidators: true
        }
    ).populate({
        path: "barber_id",
        populate: { path: "user_id", select: "name email phone" }
    });

exports.remove = (id) =>
    Attendance.findByIdAndDelete(id);