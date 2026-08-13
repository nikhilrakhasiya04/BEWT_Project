const WageRecord = require("../models/Wage");

exports.findAll = () =>
    WageRecord.find().populate("barber_id");

exports.findById = (id) =>
    WageRecord.findById(id).populate("barber_id");

exports.create = (data) =>
    WageRecord.create(data);

exports.update = (id, data) =>
    WageRecord.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    ).populate("barber_id");

exports.remove = (id) =>
    WageRecord.findByIdAndDelete(id);