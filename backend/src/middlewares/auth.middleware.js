const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  console.log("RAW AUTH HEADER:", req.headers.authorization);
  console.log("TOKEN START:", token?.slice(0, 20));
  console.log("ACCESS SECRET START:", process.env.ACCESS_TOKEN_SECRET?.slice(0, 10));

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("DECODED TOKEN:", decoded);

    const userId = decoded.id || decoded.userId || decoded._id || decoded.sub;
    console.log("USER ID FROM TOKEN:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload: missing user id" });
    }

    req.user = { id: userId, _id: userId };
    return next();
  } catch (err) {
    console.error("JWT VERIFY FAILED:", err.name, err.message);
    return res.status(401).json({ message: `JWT verify failed: ${err.message}` });
  }
};

module.exports = authMiddleware;