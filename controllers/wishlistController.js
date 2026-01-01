const mongoose = require("mongoose");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Products");

// Get Wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.userdata?.id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const wishlist = await Wishlist.findOne({ userId }).populate(
      "items.product"
    );
    if (!wishlist) {
      return res.status(200).json({ items: [] });
    }

    const items = (wishlist.items || [])
      .map((item) => {
        if (!item.product) return null;
        return {
          wishlistItemId: item._id.toString(),
          productId: item.product._id.toString(),
          name: item.product.Name,
          category: item.product.Category,
          image: item.product.image,
          price: item.product.SellingPrice,
          addedAt: item.addedAt,
        };
      })
      .filter(Boolean);

    res.status(200).json({ items });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching wishlist", error: error.message });
  }
};

// Add to Wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.userdata?.id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId,
        items: [{ product: product._id }],
      });
    } else {
      const exists = (wishlist.items || []).some(
        (p) => p.product && p.product.toString() === product._id.toString()
      );
      if (exists) {
        const populated = await Wishlist.findById(wishlist._id).populate(
          "items.product"
        );
        const items = (populated.items || [])
          .map((item) => {
            if (!item.product) return null;
            return {
              wishlistItemId: item._id.toString(),
              productId: item.product._id.toString(),
              name: item.product.Name,
              category: item.product.Category,
              image: item.product.image,
              price: item.product.SellingPrice,
              addedAt: item.addedAt,
            };
          })
          .filter(Boolean);
        return res.status(200).json({ message: "Already in wishlist", items });
      }
      wishlist.items.push({ product: product._id });
      await wishlist.save();
    }

    const populated = await Wishlist.findById(wishlist._id).populate(
      "items.product"
    );
    const items = (populated.items || [])
      .map((item) => {
        if (!item.product) return null;
        return {
          wishlistItemId: item._id.toString(),
          productId: item.product._id.toString(),
          name: item.product.Name,
          category: item.product.Category,
          image: item.product.image,
          price: item.product.SellingPrice,
          addedAt: item.addedAt,
        };
      })
      .filter(Boolean);
    res.status(200).json({ message: "Product added to wishlist", items });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res
      .status(500)
      .json({ message: "Error adding to wishlist", error: error.message });
  }
};

// Remove from Wishlist (DELETE)
exports.deleteWishlistItem = async (req, res) => {
  try {
    const targetId = req.params.id;
    const userId = req.userdata?.id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    let itemIndex = -1;

    // Strategy A: direct wishlist item id
    if (mongoose.isValidObjectId(targetId)) {
      itemIndex = wishlist.items.findIndex(
        (p) => p._id.toString() === targetId
      );
    }

    // Strategy B: product id
    if (itemIndex === -1) {
      let product = null;
      if (mongoose.isValidObjectId(targetId)) {
        product = await Product.findById(targetId);
      }
      if (!product && !isNaN(targetId)) {
        // numeric custom id support if ever used
        product = await Product.findOne({ id: parseInt(targetId) });
      }
      if (product) {
        itemIndex = wishlist.items.findIndex(
          (p) => p.product.toString() === product._id.toString()
        );
      }
    }

    if (itemIndex > -1) {
      wishlist.items.splice(itemIndex, 1);
      await wishlist.save();

      const populated = await Wishlist.findById(wishlist._id).populate(
        "items.product"
      );
      const items = (populated.items || [])
        .map((item) => {
          if (!item.product) return null;
          return {
            wishlistItemId: item._id.toString(),
            productId: item.product._id.toString(),
            name: item.product.Name,
            category: item.product.Category,
            image: item.product.image,
            price: item.product.SellingPrice,
            addedAt: item.addedAt,
          };
        })
        .filter(Boolean);

      res.status(200).json({ message: "Product removed from wishlist", items });
    } else {
      res.status(404).json({ message: "Product/Item not found in wishlist" });
    }
  } catch (error) {
    console.error("Delete wishlist item error:", error);
    res.status(500).json({
      message: "Error removing product from wishlist",
      error: error.message,
    });
  }
};
