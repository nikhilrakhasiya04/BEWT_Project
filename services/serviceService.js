const repository = require("../repositories/serviceRepository");

exports.getAll = () => repository.findAll();

exports.getById = async (id) => {

    const data = await repository.findById(id);

    if (!data) {
        throw new Error("Service not found");
    }

    return data;
};

exports.create = (data) => repository.create(data);

exports.update = async (id, data) => {

    const result = await repository.update(id, data);

    if (!result) {
        throw new Error("Service not found");
    }

    return result;
};

exports.delete = async (id) => {

    const result = await repository.remove(id);

    if (!result) {
        throw new Error("Service not found");
    }

    return result;
};