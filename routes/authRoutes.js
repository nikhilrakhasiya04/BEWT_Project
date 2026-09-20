const express = require("express");
const controller = require("../controllers/authController");
const { authenticate } = require("../middlewares/authMiddleware");
const {
    validateRegister,
    validateLogin,
    validateChangePassword
} = require("../validations/validation");

const router = express.Router();

// POST /api/auth/register
router.post("/register", validateRegister, controller.register);

// POST /api/auth/login
router.post("/login", validateLogin, controller.login);

// POST /api/auth/logout
router.post("/logout", authenticate, controller.logout);

// PUT /api/auth/change-password
router.put("/change-password", authenticate, validateChangePassword, controller.changePassword);

module.exports = router;