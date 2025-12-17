const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/ordersController");
const auth = require("../middlewares/authMiddleware");

// All order routes require authentication
router.use(auth);

// Create order from cart
router.post("/", ordersController.createOrder);

// Get user's orders
router.get("/", ordersController.getOrders);

module.exports = router;
