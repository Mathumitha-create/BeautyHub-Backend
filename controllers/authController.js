const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers.authorization || req.query.Authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Decoded JWT:", decoded);
    req.userdata = {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.username,
    };

    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: err.message });
    // next();
  }
};

module.exports = auth;
