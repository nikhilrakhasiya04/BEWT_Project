const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Barber = require("../models/Barber");
const TokenBlacklist = require("../models/TokenBlacklist");

exports.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token required in Bearer format"
            });
        }

        const token = authHeader.split(" ")[1];

        // Check if token is blacklisted
        const isBlacklisted = await TokenBlacklist.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                message: "Token has been invalidated (logged out). Please log in again."
            });
        }

        // Verify token signature & expiry
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch current user from DB to verify active status
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account associated with this token no longer exists"
            });
        }

        if (user.status !== "Active") {
            return res.status(403).json({
                success: false,
                message: "User account has been deactivated"
            });
        }

        req.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
        };
        req.token = token;

        // If user is Barber, attach their barber profile ID for quick self-identification
        if (user.role === "Barber") {
            const barber = await Barber.findOne({ user_id: user._id });
            if (barber) {
                req.user.barber_id = barber._id.toString();
            }
        }

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Authorization token expired"
            });
        }
        return res.status(401).json({
            success: false,
            message: "Invalid or malformed authorization token"
        });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access forbidden: Required role(s): [${roles.join(", ")}]. Your role: ${req.user ? req.user.role : "None"}`
            });
        }
        next();
    };
};