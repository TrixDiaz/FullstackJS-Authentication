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
    const existingUser = await User.findOne({where: {email}});
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
      where: {
        verificationToken: token,
        verificationExpires: {$gt: new Date()},
      },
    });

    if (!user) {
      return next(createError(400, "Invalid or expired verification token"));
    }

    // Update user
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationExpires = null;
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
    const user = await User.findOne({where: {email}});
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
      userId: user.id,
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
      const token = await Token.findOne({where: {refreshToken}});
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
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return next(createError(401, "Invalid refresh token"));
    }

    // Check if token exists and is not revoked
    const token = await Token.findOne({
      where: {
        refreshToken,
        isRevoked: false,
        expiresAt: {$gt: new Date()},
      },
    });

    if (!token) {
      return next(
        createError(401, "Refresh token has been revoked or expired")
      );
    }

    // Get user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return next(createError(401, "User not found"));
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.status(200).json({
      accessToken,
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
    const user = await User.findOne({where: {email}});
    if (!user) {
      // For security reasons, don't reveal that email doesn't exist
      return res.status(200).json({
        message:
          "If your email is in our system, you will receive a password reset link",
      });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Update user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: "Reset Your Password",
      text: `You are receiving this because you (or someone else) requested a password reset. Please click on the following link to reset your password: ${resetUrl}`,
      html: `
        <h1>Password Reset</h1>
        <p>Hi ${user.firstName},</p>
        <p>You are receiving this because you (or someone else) requested a password reset. Please click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If the button doesn't work, please copy and paste this URL into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      `,
    });

    res.status(200).json({
      message:
        "If your email is in our system, you will receive a password reset link",
    });
  } catch (error) {
    next(error);
  }
};

// Resend email verification
export const resendVerification = async (req, res, next) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {email} = req.body;

    // Find user
    const user = await User.findOne({where: {email}});

    if (!user) {
      // For security reasons, don't reveal that email doesn't exist
      return res.status(200).json({
        message:
          "If your email is in our system, you will receive a verification link",
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        message: "This email is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new verification token
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
        <p>Thank you for registering. Please verify your email by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>If the button doesn't work, please copy and paste this URL into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    res.status(200).json({
      message: "Verification email sent. Please check your inbox.",
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

    const {token} = req.params;
    const {password} = req.body;

    // Find user with reset token
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {$gt: new Date()},
      },
    });

    if (!user) {
      return next(createError(400, "Invalid or expired reset token"));
    }

    // Update user password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Revoke all refresh tokens for this user
    await Token.update({isRevoked: true}, {where: {userId: user.id}});

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: "Your Password Has Been Changed",
      text: "This is a confirmation that the password for your account has just been changed.",
      html: `
        <h1>Password Changed</h1>
        <p>Hi ${user.firstName},</p>
        <p>This is a confirmation that the password for your account has just been changed.</p>
        <p>If you did not make this change, please contact us immediately.</p>
      `,
    });

    res.status(200).json({
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
const generateAccessToken = (user) => {
  return jwt.sign(
    {id: user.id, email: user.email, role: user.role},
    process.env.JWT_SECRET,
    {expiresIn: process.env.JWT_EXPIRES_IN || "1h"}
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({id: user.id}, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
};

// Check auth status
export const authStatus = async (req, res, next) => {
  try {
    // This route will use the authenticate middleware before this controller
    // If we get here, the user is authenticated
    return res.status(200).json({
      isAuthenticated: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
