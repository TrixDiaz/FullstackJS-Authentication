import express from 'express';
import { body } from 'express-validator';
import {
  getCurrentUser,
  updateProfile,
  changePassword,
  updateProfileImage,
  deleteAccount
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/me', getCurrentUser);

// Update profile with validation
router.put(
  '/profile',
  [
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty')
  ],
  updateProfile
);

// Change password with validation
router.put(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/\d/)
      .withMessage('Password must contain a number')
  ],
  changePassword
);

// Update profile image
router.put(
  '/profile-image',
  [
    body('profileImage').notEmpty().withMessage('Profile image URL is required')
  ],
  updateProfileImage
);

// Delete account
router.delete('/account', deleteAccount);

export default router;