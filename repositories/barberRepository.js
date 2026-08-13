const Barber = require("../models/Barber");

exports.findAll = () =>
    Barber.find().populate("user_id", "-password");

exports.findById = (id) =>
    Barber.findById(id).populate("user_id", "-password");

exports.create = (data) =>
    Barber.create(data);

exports.update = (id, data) =>
    Barber.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    ).populate("user_id", "-password");

exports.remove = (id) =>
    Barber.findByIdAndDelete(id);