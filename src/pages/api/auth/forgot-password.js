import { getDb } from "../../../lib/mongodb";
import crypto from "crypto";

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

      // TODO: Send email with reset link
      // For now, just log the token (in production, this should be sent via email)
      console.log(`[Password Reset] Reset token for ${email}: ${resetToken}`);
    }

    return res.status(200).json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("[api/auth/forgot-password]", error);
    return res.status(500).json({ error: "Failed to process request" });
  }
}