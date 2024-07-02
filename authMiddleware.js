const jwt = require("jsonwebtoken");
const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt723932csc9797whjhcsc9(45900)93883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";

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

const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ status: "403", message: "Access denied" });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };
