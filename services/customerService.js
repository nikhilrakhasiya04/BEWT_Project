const repository = require("../repositories/customerRepository");

exports.getAll = () => repository.findAll();

exports.getById = async (id) => {

    const customer = await repository.findById(id);

    if (!customer) {
        throw new Error("Customer not found");
    }

    return customer;
};

exports.create = (data) => repository.create(data);

exports.update = async (id, data) => {

    const customer = await repository.update(id, data);

    if (!customer) {
        throw new Error("Customer not found");
    }

    return customer;
};

exports.delete = async (id) => {

    const customer = await repository.remove(id);

    if (!customer) {
        throw new Error("Customer not found");
    }

    return customer;
};