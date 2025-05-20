import {validationResult} from "express-validator";
import jwt from "jsonwebtoken";
import {v4 as uuidv4} from "uuid";

import User from "../models/user.model.js";
import Token from "../models/token.model.js";
import {sendEmail} from "../utils/email.js";
import {createError} from "../utils/error.js";

// Register a new user
export const register = async (req, res, next) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {firstName, lastName, email, password} = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({email});
    if (existingUser) {
      return next(createError(400, "User with this email already exists"));
    }

    // Create verification token
    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      verificationToken,
      verificationExpires,
    });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      text: `Please verify your email by clicking on the following link: ${verificationUrl}`,
      html: `
        <h1>Email Verification</h1>
        <p>Hi ${firstName},</p>
        <p>Thank you for registering. Please verify your email by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>If the button doesn't work, please copy and paste this URL into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    res.status(201).json({
      message:
        "User registered successfully. Please check your email for verification.",
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// Verify email
export const verifyEmail = async (req, res, next) => {
  try {
    const {token} = req.params;

    // Find user with verification token
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: {$gt: new Date()},
    });

    if (!user) {
      return next(createError(400, "Invalid or expired verification token"));
    }

    // Update user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({message: "Email verified successfully. You can now log in."});
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {email, password} = req.body;

    // Find user
    const user = await User.findOne({email});
    if (!user) {
      return next(createError(401, "Invalid email or password"));
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(createError(401, "Invalid email or password"));
    }

    // Check if email is verified
    if (!user.isVerified) {
      return next(
        createError(401, "Please verify your email before logging in")
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to database
    await Token.create({
      userId: user._id,
      refreshToken,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      user: user.toJSON(),
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Find and revoke token
      const token = await Token.findOne({refreshToken});
      if (token) {
        token.isRevoked = true;
        await token.save();
      }

      // Clear refresh token cookie
      res.clearCookie("refreshToken");
    }

    res.status(200).json({message: "Logout successful"});
  } catch (error) {
    next(error);
  }
};

// Refresh token
export const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return next(createError(401, "Refresh token not found"));
    }

    // Verify refresh token
    let decoded;
    try {
      const JWT_REFRESH_SECRET =
        process.env.JWT_REFRESH_SECRET || "your_jwt_refresh_secret_456";
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (error) {
      return next(createError(401, "Invalid refresh token"));
    }

    // Check if token is in database and not revoked
    const token = await Token.findOne({
      refreshToken,
      isRevoked: false,
      expiresAt: {$gt: new Date()},
    });

    if (!token) {
      return next(createError(401, "Invalid refresh token"));
    }

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(createError(401, "User not found"));
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.status(200).json({
      accessToken,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
export const forgotPassword = async (req, res, next) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {email} = req.body;

    // Find user
    const user = await User.findOne({email});
    if (!user) {
      // Don't reveal that email doesn't exist for security reasons
      return res.status(200).json({
        message:
          "If your email is registered, you will receive a password reset link.",
      });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: "Reset Your Password",
      text: `You requested a password reset. Please click on the following link to reset your password: ${resetUrl}`,
      html: `
        <h1>Password Reset</h1>
        <p>Hi ${user.firstName},</p>
        <p>You requested a password reset. Please click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If the button doesn't work, please copy and paste this URL into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      `,
    });

    res.status(200).json({
      message:
        "If your email is registered, you will receive a password reset link.",
    });
  } catch (error) {
    next(error);
  }
};

// Resend verification email
export const resendVerification = async (req, res, next) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {email} = req.body;

    // Find user
    const user = await User.findOne({email});
    if (!user) {
      // Don't reveal that email doesn't exist for security reasons
      return res.status(200).json({
        message:
          "If your email is registered and not verified, you will receive a verification email.",
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified. Please login.",
      });
    }

    // Generate new verification token
    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user
    user.verificationToken = verificationToken;
    user.verificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      text: `Please verify your email by clicking on the following link: ${verificationUrl}`,
      html: `
        <h1>Email Verification</h1>
        <p>Hi ${user.firstName},</p>
        <p>Please verify your email by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>If the button doesn't work, please copy and paste this URL into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    res.status(200).json({
      message:
        "If your email is registered and not verified, you will receive a verification email.",
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const token = req.params.token;
    const {password} = req.body;

    // Find user with reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: {$gt: new Date()},
    });

    if (!user) {
      return next(createError(400, "Invalid or expired reset token"));
    }

    // Update user
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      message:
        "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

// Generate access token
const generateAccessToken = (user) => {
  const JWT_ACCESS_SECRET =
    process.env.JWT_ACCESS_SECRET || "your_jwt_access_secret_123";
  const JWT_ACCESS_EXPIRE = process.env.JWT_ACCESS_EXPIRE || "15m";

  return jwt.sign({id: user._id, role: user.role}, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRE,
  });
};

// Generate refresh token
const generateRefreshToken = (user) => {
  const JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || "your_jwt_refresh_secret_456";
  const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || "7d";

  return jwt.sign({id: user._id}, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
  });
};

// Check authentication status
export const authStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    res.status(200).json({
      isAuthenticated: true,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};
