import jwt from "jsonwebtoken";
import {createError} from "../utils/error.js";
import User from "../models/user.model.js";

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
    // If no token in header, check for refresh token in cookies
    else if (req.cookies && req.cookies.refreshToken) {
      // Use refresh token to generate a new access token
      try {
        const decoded = jwt.verify(
          req.cookies.refreshToken,
          process.env.JWT_REFRESH_SECRET
        );
        const user = await User.findByPk(decoded.id);
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
          };
          return next();
        }
      } catch (error) {
        // If refresh token verification fails, continue to error
      }
    }

    // If no token found
    if (!token) {
      return next(createError(401, "Access denied. No token provided"));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Set user in request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(createError(401, "Token expired"));
    }
    if (error.name === "JsonWebTokenError") {
      return next(createError(401, "Invalid token"));
    }
    next(error);
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(401, "Not authenticated"));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError(403, "Not authorized to access this resource"));
    }

    next();
  };
};
