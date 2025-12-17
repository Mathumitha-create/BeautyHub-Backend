require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cartRoutes = require("./routes/cart");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const connectDB = require("./config/db");
const authMiddleware = require("./middlewares/authMiddleware");
const User = require("./models/Users");

connectDB();

const app = express();

const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json());

// Custom middleware to log request method, URL, and timestamp
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} at ${new Date().toISOString()}`);
  next();
});

// Root route
app.get("/", (req, res) => {
  res.end("Server is running on port 3000");
});

// Use routes
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/auth", authRoutes);

app.get("/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userdata.id).select("-password");
  res.status(200).json({ message: "Profile", userData: user });
});

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000");
});
