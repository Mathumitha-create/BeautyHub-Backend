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
const allowedOrigins = [
  allowedOrigin,
  "http://localhost:5173",
  "https://beauty-hub-frontend.vercel.app",
];
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin like mobile apps or curl
      if (!origin) return callback(null, true);
      const ok = allowedOrigins.includes(origin);
      return callback(ok ? null : new Error("Not allowed by CORS"), ok);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

// Note: CORS and JSON body parser are already applied above
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
