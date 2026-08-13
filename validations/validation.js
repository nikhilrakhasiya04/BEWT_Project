const validateUser = (req, res, next) => {

    const {
        name,
        email,
        password,
        role
    } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({
            success: false,
            message: "Name, email, password and role are required"
        });
    }

    if (!["Administrator", "Receptionist", "Barber"].includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user role"
        });
    }

    next();
};

module.exports = {
    validateUser
};