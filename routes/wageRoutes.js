const express = require("express");
const controller = require("../controllers/wageController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const { validateWageCalculation } = require("../validations/validation");

const router = express.Router();

router.use(authenticate);

// View Payroll Statements & Dynamic Calculation (Admin Full, Barber View Personal)
router.get("/", authorize("Administrator", "Barber"), controller.getAll);
router.get("/calculate", authorize("Administrator", "Barber"), controller.calculateStatement);
router.get("/:id", authorize("Administrator", "Barber"), controller.getById);

// Finalize and Log Financial Payout Ledger (Administrator Only)
router.post("/", authorize("Administrator"), validateWageCalculation, controller.create);
router.put("/:id", authorize("Administrator"), controller.update);
router.delete("/:id", authorize("Administrator"), controller.delete);

module.exports = router;