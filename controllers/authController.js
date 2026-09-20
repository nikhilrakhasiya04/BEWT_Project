const userService = require("../services/userService");

exports.register = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await userService.login(email, password);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: result.token,
            user: result.user
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        const token = req.token;
        const userId = req.user ? req.user.id : null;

        const result = await userService.logout(token, userId);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { current_password, new_password } = req.body;

        const result = await userService.changePassword(userId, current_password, new_password);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};
