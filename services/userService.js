const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const repository = require("../repositories/userRepository");
const TokenBlacklist = require("../models/TokenBlacklist");

exports.getAllUsers = () => {
    return repository.findAll();
};

exports.getUserById = async (id) => {
    const user = await repository.findById(id);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    return user;
};

exports.createUser = async (data) => {
    const existing = await repository.findByEmail(data.email);
    if (existing) {
        const error = new Error("Email is already registered");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await repository.create({
        ...data,
        password: hashedPassword
    });

    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
};

exports.updateUser = async (id, data) => {
    if (data.email) {
        const existing = await repository.findByEmail(data.email);
        if (existing && existing._id.toString() !== id) {
            const error = new Error("Email is already in use by another account");
            error.statusCode = 409;
            throw error;
        }
    }

    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }

    const user = await repository.update(id, data);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    return user;
};

exports.deleteUser = async (id) => {
    const user = await repository.remove(id);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    return user;
};

exports.login = async (email, password) => {
    const user = await repository.findByEmailWithPassword(email);
    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    if (user.status === "Inactive") {
        const error = new Error("User account is inactive. Please contact administrator.");
        error.statusCode = 403;
        throw error;
    }

    const token = jwt.sign(
        {
            id: user._id.toString(),
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );

    const userObj = user.toObject();
    delete userObj.password;

    return {
        token,
        user: userObj
    };
};

exports.logout = async (token, userId) => {
    try {
        const decoded = jwt.decode(token);
        const expiresAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);

        await TokenBlacklist.create({
            token,
            user_id: userId,
            expires_at: expiresAt
        });

        return { message: "Logout successful and session terminated" };
    } catch (err) {
        if (err.code === 11000) {
            return { message: "Session already terminated" };
        }
        throw err;
    }
};

exports.changePassword = async (userId, currentPassword, newPassword) => {
    const user = await repository.findByIdWithPassword(userId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        const error = new Error("Current password does not match");
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await repository.update(userId, { password: hashedPassword });

    return { message: "Password updated successfully" };
};