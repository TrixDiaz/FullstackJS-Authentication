import express from "express";
import {body} from "express-validator";
import {
  register,
  verifyEmail,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  authStatus,
} from "../controllers/auth.controller.js";
import {authenticate} from "../middleware/auth.js";

const router = express.Router();

// Authentication status route
router.get("/status", authenticate, authStatus);

// Register route with validation
router.post(
  "/register",
  [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({min: 6})
      .withMessage("Password must be at least 6 characters long")
      .matches(/\d/)
      .withMessage("Password must contain a number"),
  ],
  register
);

// ... existing code ...
