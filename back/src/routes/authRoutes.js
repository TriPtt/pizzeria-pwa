const express = require("express");
const router = express.Router();
const { register, login, deleteAccount, me } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.delete("/delete", authMiddleware, deleteAccount);
router.get("/me", authMiddleware, me);

module.exports = router;
