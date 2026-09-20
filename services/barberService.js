const barberRepository = require("../repositories/barberRepository");
const userRepository = require("../repositories/userRepository");

exports.getAll = (filter = {}) => {
    return barberRepository.findAll(filter);
};

exports.getById = async (id) => {
    const barber = await barberRepository.findById(id);
    if (!barber) {
        const error = new Error("Barber not found");
        error.statusCode = 404;
        throw error;
    }
    return barber;
};

exports.getByUserId = async (userId) => {
    return barberRepository.findByUserId(userId);
};

exports.create = async (data) => {
    const user = await userRepository.findById(data.user_id);
    if (!user) {
        const error = new Error("Associated user not found");
        error.statusCode = 404;
        throw error;
    }

    if (user.role !== "Barber") {
        const error = new Error("Associated user must have 'Barber' role");
        error.statusCode = 400;
        throw error;
    }

    const existingBarber = await barberRepository.findByUserId(data.user_id);
    if (existingBarber) {
        const error = new Error("A barber profile is already associated with this user");
        error.statusCode = 409;
        throw error;
    }

    return barberRepository.create(data);
};

exports.update = async (id, data) => {
    const barber = await barberRepository.update(id, data);
    if (!barber) {
        const error = new Error("Barber not found");
        error.statusCode = 404;
        throw error;
    }
    return barber;
};

exports.delete = async (id) => {
    // Soft flag or remove
    const barber = await barberRepository.update(id, { status: "Inactive" });
    if (!barber) {
        const error = new Error("Barber not found");
        error.statusCode = 404;
        throw error;
    }
    return { message: "Barber profile deactivated successfully", barber };
};

exports.hardDelete = async (id) => {
    const barber = await barberRepository.remove(id);
    if (!barber) {
        const error = new Error("Barber not found");
        error.statusCode = 404;
        throw error;
    }
    return barber;
};