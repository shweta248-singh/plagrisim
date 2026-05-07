const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user.role}) not allowed`
      });
    }

    next();
  };
};

module.exports = authorizeRoles;