const Barber = require("../models/Barber");

exports.findAll = (filter = {}) =>
    Barber.find(filter)
        .populate("user_id", "name email phone role status")
        .sort({ joining_date: -1 });

exports.findById = (id) =>
    Barber.findById(id)
        .populate("user_id", "name email phone role status");

exports.findByUserId = (userId) =>
    Barber.findOne({ user_id: userId })
        .populate("user_id", "name email phone role status");

exports.create = (data) =>
    Barber.create(data);

exports.update = (id, data) =>
    Barber.findByIdAndUpdate(
        id,
        data,
        {
            returnDocument: "after",
            runValidators: true
        }
    ).populate("user_id", "name email phone role status");

exports.remove = (id) =>
    Barber.findByIdAndDelete(id);