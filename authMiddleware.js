const jwt = require("jsonwebtoken");
const JWT_SECRET = "hvdvay6ert72839289()aiyg8t87qt723932csc9797whjhcsc9(45900)93883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Extract token from Authorization header

  if (!token) { 
    return res.status(401).json({ message: "No Token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }
    req.user = {
      uid: decodedToken.uid,
      role: decodedToken.role,
    };

    next();
  });
};

// Middleware to authorize roles
const authorizeRole = (...requiredRoles) => {
  return (req, res, next) => {
    if (!req.user || !requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ status: "403", message: "Access denied" });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };
