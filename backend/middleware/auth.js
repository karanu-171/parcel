const jwt = require("jsonwebtoken");
const {pool} = require("../config/db");

const protect = async (req, res, next) => {
  const testToken = req.headers.authorization;
  let token;

  if (testToken && testToken.startsWith("Bearer")) {
    try {
      // Get token from header
      token = testToken.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if the user exists in the database
      const [rows] = await pool.query(
        "SELECT * FROM user WHERE id = ?",
        [decoded.id]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: "User not found" });
      }

      // Attach the user information to the request object
      req.user = { id: decoded.id };

      next();
    } catch (error) {
      // If the token is invalid or expired, return an unauthorized response
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  if (!token) {
    // If there's no token in the header, return an unauthorized response
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};


const restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return res
        .status(403)
        .json("You do not have permission to perform this action");
    }
    next();
  };
};

module.exports = { protect, restrict };
