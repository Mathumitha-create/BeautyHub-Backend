const Cart = require("../models/Cart");
const Order = require("../models/Order");

// POST /orders - create an order from the user's cart
exports.createOrder = async (req, res) => {
  try {
    const userId = req.userdata?.id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Load cart with product details
    const cart = await Cart.findOne({ userId }).populate("items.product");
    if (!cart || (cart.items || []).length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Build order items snapshot
    const orderItems = cart.items
      .map((ci) => {
        if (!ci.product) return null;
        return {
          product: ci.product._id,
          name: ci.product.Name,
          image: ci.product.image,
          price: ci.product.SellingPrice,
          quantity: ci.quantity,
        };
      })
      .filter(Boolean);

    const subtotal = orderItems.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0
    );
    const tax = Number((subtotal * 0.1).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    const order = await Order.create({
      userId,
      items: orderItems,
      subtotal,
      tax,
      total,
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: {
        id: order._id.toString(),
        createdAt: order.createdAt,
        status: order.status,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        items: order.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res
      .status(500)
      .json({ message: "Error creating order", error: error.message });
  }
};

// GET /orders - list user's orders
exports.getOrders = async (req, res) => {
  try {
    const userId = req.userdata?.id || req.user?.id;
    const role = req.userdata?.role || "user";
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const query = role === "admin" ? {} : { userId };
    const orders = await Order.find(query).sort({ createdAt: -1 });
    const shaped = orders.map((o) => ({
      id: o._id.toString(),
      date: o.createdAt,
      status: o.status,
      subtotal: o.subtotal,
      tax: o.tax,
      total: o.total,
      items: o.items.map((i) => i.name),
    }));
    res.json(shaped);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};
