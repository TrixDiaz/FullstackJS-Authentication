import jwt from "jsonwebtoken";
import {createError} from "../utils/error.js";

// Default secrets if environment variables are not set
const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "your_jwt_access_secret_123";

// Authenticate middleware
export const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(createError(401, "Access denied. No token provided"));
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);

    // Set user in request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(createError(401, "Token expired"));
    }
    next(createError(401, "Invalid token"));
  }
};

// Authorize by role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(401, "Access denied. Not authenticated"));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError(403, "Access denied. Not authorized"));
    }

    next();
  };
};
