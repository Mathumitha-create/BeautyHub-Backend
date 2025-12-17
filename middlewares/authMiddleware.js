const jwt = require("jsonwebtoken");
const User = require("../models/Users");

const auth = async (req, res, next) => {
  const token = req.headers.authorization || req.query.Authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    // Lookup role to support admin vs user behavior
    let userDoc = null;
    try {
      userDoc = await User.findById(decoded.userId).select("email role");
    } catch (e) {
      // ignore lookup errors; proceed with decoded info
    }

    req.userdata = {
      id: decoded.userId,
      email: userDoc?.email || decoded.email,
      role: userDoc?.role || "user",
    };
    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: err.message });
  }
};

module.exports = auth;
