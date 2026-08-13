const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const repository = require("../repositories/userRepository");

exports.getAllUsers = () => {
    return repository.findAll();
};

exports.getUserById = async (id) => {
    const user = await repository.findById(id);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

exports.createUser = async (data) => {

    const existing = await repository.findByEmail(data.email);

    if (existing) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return repository.create({
        ...data,
        password: hashedPassword
    });
};

exports.updateUser = async (id, data) => {

    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }

    const user = await repository.update(id, data);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

exports.deleteUser = async (id) => {

    const user = await repository.remove(id);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

exports.login = async (email, password) => {

    const user = await repository.findByEmail(email);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const validPassword = await bcrypt.compare(
        password,
        user.password
    );

    if (!validPassword) {
        throw new Error("Invalid email or password");
    }

    if (user.status === "Inactive") {
        throw new Error("User account is inactive");
    }

    const token = jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    return {
        token,
        user
    };
};