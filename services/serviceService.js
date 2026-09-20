const repository = require("../repositories/serviceRepository");

exports.getAll = () => repository.findAll();

exports.getById = async (id) => {
    const data = await repository.findById(id);
    if (!data) {
        const error = new Error("Service not found");
        error.statusCode = 404;
        throw error;
    }
    return data;
};

exports.create = async (data) => {
    const existing = await repository.findByName(data.service_name);
    if (existing) {
        const error = new Error(`Service '${data.service_name}' already exists in catalog`);
        error.statusCode = 409;
        throw error;
    }
    return repository.create(data);
};

exports.update = async (id, data) => {
    if (data.service_name) {
        const existing = await repository.findByName(data.service_name);
        if (existing && existing._id.toString() !== id) {
            const error = new Error(`Service '${data.service_name}' already exists in catalog`);
            error.statusCode = 409;
            throw error;
        }
    }

    const result = await repository.update(id, data);
    if (!result) {
        const error = new Error("Service not found");
        error.statusCode = 404;
        throw error;
    }
    return result;
};

exports.delete = async (id) => {
    const result = await repository.remove(id);
    if (!result) {
        const error = new Error("Service not found");
        error.statusCode = 404;
        throw error;
    }
    return result;
};