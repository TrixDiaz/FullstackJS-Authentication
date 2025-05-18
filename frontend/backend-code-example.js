// Add this to your auth.routes.js
router.post(
  "/resend-verification",
  [body("email").isEmail().withMessage("Please provide a valid email")],
  resendVerificationEmail
);

// Add this to your auth.controller.js
export const resendVerificationEmail = async (req, res, next) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {email} = req.body;

    // Find user
    const user = await User.findOne({where: {email}});

    // For security reasons, don't reveal if the email exists or not
    if (!user) {
      return res.status(200).json({
        message:
          "If your email exists in our system, you will receive a verification link",
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        message: "This email is already verified. Please sign in.",
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
        <p>You requested a new verification link. Please verify your email by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>If the button doesn't work, please copy and paste this URL into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    res.status(200).json({
      message: "Verification email sent successfully. Please check your inbox.",
    });
  } catch (error) {
    next(error);
  }
};
