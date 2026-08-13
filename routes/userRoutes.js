const express = require("express");
const controller = require("../controllers/userController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const { validateUser } = require("../validations/validation");

const router = express.Router();

router.post("/login", controller.login);

router.get("/", authenticate, controller.getAllUsers);

router.get("/:id", authenticate, controller.getUserById);

router.post(
    "/",
    authenticate,
    authorize("Administrator"),
    validateUser,
    controller.createUser
);

router.put(
    "/:id",
    authenticate,
    authorize("Administrator"),
    controller.updateUser
);

router.delete(
    "/:id",
    authenticate,
    authorize("Administrator"),
    controller.deleteUser
);

module.exports = router;