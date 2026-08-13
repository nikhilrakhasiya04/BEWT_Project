const repository = require("../repositories/wageRepository");

exports.getAll = () => repository.findAll();

exports.getById = async (id) => {

    const wage = await repository.findById(id);

    if (!wage) {
        throw new Error("Wage record not found");
    }

    return wage;
};

exports.create = async (data) => {

    data.total_amount =
        Number(data.salary || 0) +
        Number(data.commission || 0);

    return repository.create(data);
};

exports.update = async (id, data) => {

    if (data.salary !== undefined ||
        data.commission !== undefined) {

        data.total_amount =
            Number(data.salary || 0) +
            Number(data.commission || 0);
    }

    const wage = await repository.update(id, data);

    if (!wage) {
        throw new Error("Wage record not found");
    }

    return wage;
};

exports.delete = async (id) => {

    const wage = await repository.remove(id);

    if (!wage) {
        throw new Error("Wage record not found");
    }

    return wage;
};