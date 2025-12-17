const express = require("express");
const router = express.Router();
// Fix incorrect path and filename casing to controllers/userController
const userController = require("../controllers/userController");

router.post("/register", userController.registerStudent);
router.post("/login", userController.loginStudent);

module.exports = router;
