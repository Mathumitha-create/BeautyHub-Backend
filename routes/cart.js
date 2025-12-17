const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const auth = require("../middlewares/authMiddleware");

// All cart routes require authentication
router.use(auth);

// GET endpoint to fetch all cart items
router.get("/", cartController.getCart);

// POST endpoint to add a product to cart
router.post("/", cartController.addToCart);

// PATCH endpoint to update cart item quantity
router.patch("/:id", cartController.updateCartItem);

// DELETE endpoint to remove a product from cart
router.delete("/:id", cartController.deleteCartItem);

module.exports = router;
