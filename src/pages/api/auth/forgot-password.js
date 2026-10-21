import { getDb } from "../../../lib/mongodb";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../../../lib/email";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const db = await getDb();
    const user = await db.collection("users").findOne({ email });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour

      await db.collection("users").updateOne(
        { email },
        {
          $set: {
            resetToken,
            resetTokenExpiry,
          },
        }
      );

      // Send email with reset link
      const emailResult = await sendPasswordResetEmail({ to: email, resetToken });

      if (emailResult.skipped) {
        console.warn(`[Password Reset] Email skipped (${emailResult.reason}) for ${email}`);
        console.warn("[Password Reset] RESEND_API_KEY not configured - cannot send reset emails");
      } else if (!emailResult.success) {
        console.error(`[Password Reset] Email sending failed to ${email}:`, emailResult.error);
        // Still return success to prevent email enumeration, but log the failure
        // In production, you might want to alert admins about this
      } else {
        console.log(`[Password Reset] Password reset email sent successfully to ${email}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("[api/auth/forgot-password]", error);
    // Log more details for debugging
    console.error("[api/auth/forgot-password] Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    // Still return a generic error to prevent enumeration
    // But differentiate between system errors and invalid requests
    if (error.message.includes("MongoDB connection failed")) {
      return res.status(503).json({ error: "Service temporarily unavailable. Please try again later." });
    }

    return res.status(500).json({ error: "Failed to process request" });
  }
}