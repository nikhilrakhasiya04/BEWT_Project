const WageRecord = require("../models/Wage");

exports.findAll = (filter = {}) =>
    WageRecord.find(filter)
        .populate({
            path: "barber_id",
            populate: { path: "user_id", select: "name email phone" }
        })
        .sort({ month: -1, created_at: -1 });

exports.findById = (id) =>
    WageRecord.findById(id).populate({
        path: "barber_id",
        populate: { path: "user_id", select: "name email phone" }
    });

exports.findByBarberAndMonth = (barberId, month) =>
    WageRecord.findOne({
        barber_id: barberId,
        month: month
    }).populate({
        path: "barber_id",
        populate: { path: "user_id", select: "name email phone" }
    });

exports.create = (data) =>
    WageRecord.create(data);

exports.update = (id, data) =>
    WageRecord.findByIdAndUpdate(
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
    WageRecord.findByIdAndDelete(id);