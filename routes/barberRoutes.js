const express = require("express");
const controller = require("../controllers/barberController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const { validateBarber, validateUpdateBarber } = require("../validations/validation");

const router = express.Router();

router.use(authenticate);

// Staff list view
router.get("/", controller.getAll);
router.get("/:id", controller.getById);

// Stylist Profiling & Management (Administrator Only)
router.post(
    "/",
    authorize("Administrator"),
    validateBarber,
    controller.create
);

router.put(
    "/:id",
    authorize("Administrator"),
    validateUpdateBarber,
    controller.update
);

router.delete(
    "/:id",
    authorize("Administrator"),
    controller.delete
);

module.exports = router;