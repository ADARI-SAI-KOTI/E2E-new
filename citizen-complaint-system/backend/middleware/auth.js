const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const authHeaderToken = req.headers.authorization?.split(" ")[1];

  // Support auth token via HTTP-only cookie (for security)
  const cookieToken = (() => {
    const cookie = req.headers.cookie;
    if (!cookie) return null;
    const match = cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("token="));
    return match ? match.split("=")[1] : null;
  })();

  const token = authHeaderToken || cookieToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};

module.exports = { protect, authorize };