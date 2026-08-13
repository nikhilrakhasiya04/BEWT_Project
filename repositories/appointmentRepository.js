const Appointment = require("../models/Appointment");

exports.findAll = () =>
    Appointment.find()
        .populate("customer_id")
        .populate("barber_id")
        .populate("service_id");

exports.findById = (id) =>
    Appointment.findById(id)
        .populate("customer_id")
        .populate("barber_id")
        .populate("service_id");

exports.create = (data) =>
    Appointment.create(data);

exports.update = (id, data) =>
    Appointment.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    )
    .populate("customer_id")
    .populate("barber_id")
    .populate("service_id");

exports.remove = (id) =>
    Appointment.findByIdAndDelete(id);