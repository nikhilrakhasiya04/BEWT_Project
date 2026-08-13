const repository = require("../repositories/appointmentRepository");

exports.getAll = () => repository.findAll();

exports.getById = async (id) => {

    const appointment = await repository.findById(id);

    if (!appointment) {
        throw new Error("Appointment not found");
    }

    return appointment;
};

exports.create = (data) => repository.create(data);

exports.update = async (id, data) => {

    const appointment = await repository.update(id, data);

    if (!appointment) {
        throw new Error("Appointment not found");
    }

    return appointment;
};

exports.delete = async (id) => {

    const appointment = await repository.remove(id);

    if (!appointment) {
        throw new Error("Appointment not found");
    }

    return appointment;
};