const express = require("express");
const controller = require("../controllers/barberController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticate, controller.getAll);

router.get("/:id", authenticate, controller.getById);

router.post("/", authenticate, controller.create);

router.put("/:id", authenticate, controller.update);

router.delete("/:id", authenticate, controller.delete);

module.exports = router;