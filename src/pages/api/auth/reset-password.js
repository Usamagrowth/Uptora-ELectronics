import { getDb } from "../../../lib/mongodb";
import { updateUserPassword } from "../../../lib/db/users";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const db = await getDb();
    
    // Find user with valid reset token
    const user = await db.collection("users").findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Update password
    await updateUserPassword(user._id, password);

    // Clear reset token
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $unset: {
          resetToken: "",
          resetTokenExpiry: "",
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("[api/auth/reset-password]", error);
    return res.status(500).json({ error: "Failed to reset password" });
  }
}