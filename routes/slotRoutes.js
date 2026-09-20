const express = require("express");
const controller = require("../controllers/slotController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const { validateSlotException } = require("../validations/validation");

const router = express.Router();

router.use(authenticate, authorize("Administrator", "Receptionist"));

// GET /api/slots - Checks active barber calendars to list open time windows.
router.get("/", controller.getAvailableSlots);

// POST /api/slots - Configuration routes to block custom operational windows or set custom operational hours / holidays.
router.post("/", validateSlotException, controller.createSlotException);

// Exception management
router.get("/exceptions", controller.getAllSlotExceptions);
router.delete("/exceptions/:id", controller.deleteSlotException);

module.exports = router;
