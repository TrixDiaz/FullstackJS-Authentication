import express from "express";
import {body} from "express-validator";
import {
  getCurrentUser,
  updateProfile,
  changePassword,
  updateProfileImage,
  deleteAccount,
} from "../controllers/user.controller.js";
import {authenticate} from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get("/me", getCurrentUser);

// Update profile with validation
router.patch(
  "/me",
  [
    body("firstName")
      .optional()
      .notEmpty()
      .withMessage("First name cannot be empty"),
    body("lastName")
      .optional()
      .notEmpty()
      .withMessage("Last name cannot be empty"),
  ],
  updateProfile
);

// Change password with validation
router.patch(
  "/me/password",
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({min: 6})
      .withMessage("Password must be at least 6 characters long")
      .matches(/\d/)
      .withMessage("Password must contain a number"),
  ],
  changePassword
);

// Update profile image
router.patch(
  "/me/profile-image",
  [
    body("profileImage")
      .notEmpty()
      .withMessage("Profile image URL is required"),
  ],
  updateProfileImage
);

// Delete account
router.delete("/me", deleteAccount);

export default router;
