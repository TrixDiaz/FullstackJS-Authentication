import {sendEmail} from "./utils/email.js";
import dotenv from "dotenv";

dotenv.config();

// Test sending an email with Mailtrap
async function testEmail() {
  console.log("Testing email configuration...");

  try {
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test Email from Authentication System",
      text: "This is a test email to verify Mailtrap configuration.",
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify Mailtrap configuration.</p>
        <p>If you see this email in your Mailtrap inbox, your email configuration is working correctly!</p>
      `,
    });

    if (result) {
      console.log("✅ Email sent successfully! Check your Mailtrap inbox.");
    } else {
      console.error("❌ Failed to send email.");
    }
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

// Run the test
testEmail();
