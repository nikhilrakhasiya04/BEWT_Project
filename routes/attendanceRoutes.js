const express = require("express");
const controller = require("../controllers/attendanceController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const { validateCheckIn, validateCheckOut } = require("../validations/validation");

const router = express.Router();

router.use(authenticate);

// Historical matrix view & individual entry (Admin Full, Barber Personal)
router.get("/", authorize("Administrator", "Barber"), controller.getAll);
router.get("/:id", authorize("Administrator", "Barber"), controller.getById);

// Time punch actions (Barber Mark Personal / Administrator)
router.post("/checkin", authorize("Administrator", "Barber"), validateCheckIn, controller.checkIn);
router.post("/checkout", authorize("Administrator", "Barber"), validateCheckOut, controller.checkOut);

// Admin-only management routes
router.post("/", authorize("Administrator"), validateCheckIn, controller.create);
router.put("/:id", authorize("Administrator"), controller.update);
router.delete("/:id", authorize("Administrator"), controller.delete);

module.exports = router;