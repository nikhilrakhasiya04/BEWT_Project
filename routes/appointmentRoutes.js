const express = require("express");
const controller = require("../controllers/appointmentController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const { validateAppointment, validateUpdateAppointment } = require("../validations/validation");

const router = express.Router();

router.use(authenticate, authorize("Administrator", "Receptionist"));

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validateAppointment, controller.create);
router.put("/:id", validateUpdateAppointment, controller.update);
router.delete("/:id", controller.delete);

module.exports = router;