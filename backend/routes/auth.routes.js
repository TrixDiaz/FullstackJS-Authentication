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
  resendVerification,
  authStatus,
} from "../controllers/auth.controller.js";
import {authenticate} from "../middleware/auth.middleware.js";

const router = express.Router();

// Auth status route (protected)
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

// Verify email route
router.get("/verify-email/:token", verifyEmail);

// Login route with validation
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

// Logout route
router.post("/logout", logout);

// Refresh token route
router.post("/refresh-token", refreshToken);

// Forgot password route with validation
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Please provide a valid email")],
  forgotPassword
);

// Reset password route with validation
router.post(
  "/reset-password/:token",
  [
    body("password")
      .isLength({min: 6})
      .withMessage("Password must be at least 6 characters long")
      .matches(/\d/)
      .withMessage("Password must contain a number"),
  ],
  resetPassword
);

// Resend verification email route
router.post(
  "/resend-verification",
  [body("email").isEmail().withMessage("Please provide a valid email")],
  resendVerification
);

export default router;
