const express = require("express");
const controller = require("../controllers/serviceController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticate, controller.getAll);

router.get("/:id", authenticate, controller.getById);

router.post(
    "/",
    authenticate,
    authorize("Administrator"),
    controller.create
);

router.put(
    "/:id",
    authenticate,
    authorize("Administrator"),
    controller.update
);

router.delete(
    "/:id",
    authenticate,
    authorize("Administrator"),
    controller.delete
);

module.exports = router;