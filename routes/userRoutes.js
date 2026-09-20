const express = require("express");
const controller = require("../controllers/userController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const { validateUser, validateUpdateUser } = require("../validations/validation");

const router = express.Router();

router.use(authenticate, authorize("Administrator"));

router.get("/", controller.getAllUsers);
router.get("/:id", controller.getUserById);
router.post("/", validateUser, controller.createUser);
router.put("/:id", validateUpdateUser, controller.updateUser);
router.delete("/:id", controller.deleteUser);

module.exports = router;