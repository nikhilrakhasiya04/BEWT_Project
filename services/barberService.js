const repository = require("../repositories/barberRepository");

exports.getAll = () => repository.findAll();

exports.getById = async (id) => {

    const barber = await repository.findById(id);

    if (!barber) {
        throw new Error("Barber not found");
    }

    return barber;
};

exports.create = (data) => repository.create(data);

exports.update = async (id, data) => {

    const barber = await repository.update(id, data);

    if (!barber) {
        throw new Error("Barber not found");
    }

    return barber;
};

exports.delete = async (id) => {

    const barber = await repository.remove(id);

    if (!barber) {
        throw new Error("Barber not found");
    }

    return barber;
};