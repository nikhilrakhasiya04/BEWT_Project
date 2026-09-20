const express = require("express");
const controller = require("../controllers/customerController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const { validateCustomer, validateUpdateCustomer } = require("../validations/validation");

const router = express.Router();

router.use(authenticate);

// View Only permitted for Receptionist & Administrator
router.get("/", authorize("Administrator", "Receptionist"), controller.getAll);
router.get("/:id", authorize("Administrator", "Receptionist"), controller.getById);

// Modification restricted strictly to Administrator (per Section 4 RBAC matrix)
router.post("/", authorize("Administrator"), validateCustomer, controller.create);
router.put("/:id", authorize("Administrator"), validateUpdateCustomer, controller.update);
router.delete("/:id", authorize("Administrator"), controller.delete);

module.exports = router;