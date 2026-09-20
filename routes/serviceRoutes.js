const express = require("express");
const controller = require("../controllers/serviceController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const { validateService, validateUpdateService } = require("../validations/validation");

const router = express.Router();

router.use(authenticate);

// Menu Catalog discovery
router.get("/", controller.getAll);
router.get("/:id", controller.getById);

// Service Catalog Adjustments (Administrator Only)
router.post(
    "/",
    authorize("Administrator"),
    validateService,
    controller.create
);

router.put(
    "/:id",
    authorize("Administrator"),
    validateUpdateService,
    controller.update
);

router.delete(
    "/:id",
    authorize("Administrator"),
    controller.delete
);

module.exports = router;