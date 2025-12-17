const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Products");

// Get Cart (beginner-friendly: aligns with Cart schema: userId + items[])
exports.getCart = async (req, res) => {
  try {
    const userId = req.userdata?.id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const cart = await Cart.findOne({ userId }).populate("items.product");
    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    const items = (cart.items || [])
      .map((item) => {
        if (!item.product) return null;
        return {
          productId: item.product._id.toString(),
          name: item.product.Name,
          category: item.product.Category,
          image: item.product.image,
          price: item.product.SellingPrice,
          quantity: item.quantity,
        };
      })
      .filter(Boolean);

    res.status(200).json({ items });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
};

// Add to Cart (beginner-friendly: expects productId and quantity) - aligns with Cart schema
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.userdata?.id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const qty = Number(quantity) > 0 ? Number(quantity) : 1;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ product: product._id, quantity: qty }],
      });
    } else {
      const idx = (cart.items || []).findIndex(
        (p) => p.product && p.product.toString() === product._id.toString()
      );
      if (idx !== -1) {
        cart.items[idx].quantity += qty;
      } else {
        cart.items.push({ product: product._id, quantity: qty });
      }
      await cart.save();
    }

    const populated = await Cart.findById(cart._id).populate("items.product");
    const items = (populated.items || [])
      .map((item) => {
        if (!item.product) return null;
        return {
          productId: item.product._id.toString(),
          name: item.product.Name,
          category: item.product.Category,
          image: item.product.image,
          price: item.product.SellingPrice,
          quantity: item.quantity,
        };
      })
      .filter(Boolean);
    res.status(200).json({ message: "Product added to cart", items });
  } catch (error) {
    console.error("Add to cart error:", error);
    res
      .status(500)
      .json({ message: "Error adding to cart", error: error.message });
  }
};

// Update Quantity (PATCH)
// Note: Frontend sends 'id' which is the custom numeric ID usually
// Update Quantity (PATCH)
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const targetId = req.params.id; // Could be numeric productId OR items._id OR product._id

    // Safely extract userId
    const userId = req.userdata?.id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Cleanup invalid items first
    if (cart.items && cart.items.length > 0) {
      cart.items = cart.items.filter((item) => item.product);
    }

    // Logic to find the item to update
    let itemIndex = -1;

    // Strategy A: Check if targetId matches a direct item._id (User Request specific)
    if (mongoose.isValidObjectId(targetId)) {
      itemIndex = cart.items.findIndex((p) => p._id.toString() === targetId);
    }

    // Strategy B: If not found, targetId might be a Product ID (numeric or ObjectId)
    if (itemIndex === -1) {
      let product;
      // Try numeric lookup
      if (!isNaN(targetId)) {
        product = await Product.findOne({ id: parseInt(targetId) });
      }
      // Try valid ObjectId lookup for Product
      if (!product && mongoose.isValidObjectId(targetId)) {
        product = await Product.findById(targetId);
      }

      if (product) {
        // Find item with this product reference
        itemIndex = cart.items.findIndex(
          (p) => p.product.toString() === product._id.toString()
        );
      }
    }

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = Number(quantity);
      await cart.save();

      // Re-fetch to populate for response
      const updatedCart = await Cart.findById(cart._id).populate(
        "items.product"
      );
      const formattedItems = updatedCart.items
        .map((item) => {
          if (!item.product) return null;
          return {
            productId: item.product.id,
            name: item.product.name,
            category: item.product.category,
            image: item.product.image,
            price: item.product.sellingPrice,
            quantity: item.quantity,
          };
        })
        .filter(Boolean);

      res
        .status(200)
        .json({ message: "Cart item updated", cart: formattedItems });
    } else {
      res.status(404).json({ message: "Product/Item not found in cart" });
    }
  } catch (error) {
    console.error("Update cart error:", error);
    res
      .status(500)
      .json({ message: "Error updating cart item", error: error.message });
  }
};

// Remove Item (DELETE)
exports.deleteCartItem = async (req, res) => {
  try {
    const targetId = req.params.id;

    // Safely extract userId
    const userId = req.userdata?.id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Logic to find the item to remove (same robust strategy as updateCartItem)
    let itemIndex = -1;

    // Strategy A: Check if targetId matches a direct item._id
    if (mongoose.isValidObjectId(targetId)) {
      itemIndex = cart.items.findIndex((p) => p._id.toString() === targetId);
    }

    // Strategy B: If not found, targetId might be a Product ID (numeric or ObjectId)
    if (itemIndex === -1) {
      let product;
      // Try numeric lookup
      if (!isNaN(targetId)) {
        product = await Product.findOne({ id: parseInt(targetId) });
      }
      // Try valid ObjectId lookup for Product
      if (!product && mongoose.isValidObjectId(targetId)) {
        product = await Product.findById(targetId);
      }

      if (product) {
        // Find item with this product reference
        itemIndex = cart.items.findIndex(
          (p) => p.product.toString() === product._id.toString()
        );
      }
    }

    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
      await cart.save();

      // Re-fetch to populate for response
      const updatedCart = await Cart.findById(cart._id).populate(
        "items.product"
      );
      const formattedItems = updatedCart.items
        .map((item) => {
          if (!item.product) return null;
          return {
            productId: item.product.id,
            name: item.product.name,
            category: item.product.category,
            image: item.product.image,
            price: item.product.sellingPrice,
            quantity: item.quantity,
          };
        })
        .filter(Boolean);

      res
        .status(200)
        .json({ message: "Product removed from cart", cart: formattedItems });
    } else {
      res.status(404).json({ message: "Product/Item not found in cart" });
    }
  } catch (error) {
    console.error("Delete cart error:", error);
    res.status(500).json({
      message: "Error removing product from cart",
      error: error.message,
    });
  }
};
