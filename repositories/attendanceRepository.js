const Attendance = require("../models/Attendance");

exports.findAll = () =>
    Attendance.find().populate("barber_id");

exports.findById = (id) =>
    Attendance.findById(id).populate("barber_id");

exports.create = (data) =>
    Attendance.create(data);

exports.update = (id, data) =>
    Attendance.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    ).populate("barber_id");

exports.remove = (id) =>
    Attendance.findByIdAndDelete(id);