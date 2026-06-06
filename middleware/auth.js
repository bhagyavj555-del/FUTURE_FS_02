const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    // Get header
    const authHeader = req.header("Authorization");

    // ❌ No header
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Format: Bearer TOKEN
    const token = authHeader.split(" ")[1];

    // ❌ No token after Bearer
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = decoded;

    next();

  } catch (err) {
    console.log("Auth error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};