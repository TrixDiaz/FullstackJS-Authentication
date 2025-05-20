import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create nodemailer transporter with Mailtrap configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER || "your_mailtrap_username", // Add your Mailtrap username here
    pass: process.env.EMAIL_PASS || "your_mailtrap_password", // Add your Mailtrap password here
  },
});

// Send email function
export const sendEmail = async ({to, subject, text, html}) => {
  try {
    if (process.env.NODE_ENV === "test") {
      // Don't send emails in test environment
      console.log("Email would be sent to:", to);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@yourdomain.com",
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    console.error("Error details:", error.message);
    return false;
  }
};
