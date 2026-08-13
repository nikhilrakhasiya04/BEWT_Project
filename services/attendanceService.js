const repository = require("../repositories/attendanceRepository");

exports.getAll = () => repository.findAll();

exports.getById = async (id) => {

    const attendance = await repository.findById(id);

    if (!attendance) {
        throw new Error("Attendance not found");
    }

    return attendance;
};

exports.create = (data) => repository.create(data);

exports.update = async (id, data) => {

    const attendance = await repository.update(id, data);

    if (!attendance) {
        throw new Error("Attendance not found");
    }

    return attendance;
};

exports.delete = async (id) => {

    const attendance = await repository.remove(id);

    if (!attendance) {
        throw new Error("Attendance not found");
    }

    return attendance;
};