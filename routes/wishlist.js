const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const auth = require("../middlewares/authMiddleware");

// All wishlist routes require authentication
router.use(auth);

// GET wishlist
router.get("/", wishlistController.getWishlist);

// POST add product to wishlist
router.post("/", wishlistController.addToWishlist);

// DELETE remove item/product from wishlist
router.delete("/:id", wishlistController.deleteWishlistItem);

module.exports = router;
