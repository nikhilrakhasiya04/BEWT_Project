const customerRepository = require("../repositories/customerRepository");
const appointmentRepository = require("../repositories/appointmentRepository");

exports.getAll = (queryParams) => {
    return customerRepository.findAll(queryParams);
};

exports.getById = async (id) => {
    const customer = await customerRepository.findById(id);
    if (!customer) {
        const error = new Error("Customer not found");
        error.statusCode = 404;
        throw error;
    }

    // Historical visit logs (appointments)
    const visitLogs = await appointmentRepository.findByCustomer(id);

    return {
        customer,
        total_visits: visitLogs.length,
        completed_visits: visitLogs.filter((v) => v.status === "Completed").length,
        visit_history: visitLogs
    };
};

exports.create = async (data) => {
    return customerRepository.create(data);
};

exports.update = async (id, data) => {
    const customer = await customerRepository.update(id, data);
    if (!customer) {
        const error = new Error("Customer not found");
        error.statusCode = 404;
        throw error;
    }
    return customer;
};

exports.delete = async (id) => {
    const customer = await customerRepository.remove(id);
    if (!customer) {
        const error = new Error("Customer not found");
        error.statusCode = 404;
        throw error;
    }
    return customer;
};