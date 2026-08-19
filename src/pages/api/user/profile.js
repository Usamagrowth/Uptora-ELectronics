import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth-options";
import { getDb } from "../../../lib/mongodb";
import { updateUserPassword } from "../../../lib/db/users";

export default async function handler(req, res) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const db = await getDb();

  if (req.method === "GET") {
    try {
      const user = await db.collection("users").findOne({ email: session.user.email });
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        user: {
          id: user._id?.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          phone: user.phone || "",
          address: user.address || "",
        },
      });
    } catch (error) {
      console.error("[api/user/profile]", error);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const { name, phone, address } = req.body;

      const updateData = {};
      if (name) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;

      const result = await db.collection("users").updateOne(
        { email: session.user.email },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ success: true, message: "Profile updated" });
    } catch (error) {
      console.error("[api/user/profile]", error);
      return res.status(500).json({ error: "Failed to update profile" });
    }
  }

  if (req.method === "POST" && req.body.action === "change-password") {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new passwords are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }

      const user = await db.collection("users").findOne({ email: session.user.email });

      if (!user || !user.password) {
        return res.status(400).json({ error: "Please set a password first" });
      }

      const bcrypt = (await import("bcryptjs")).default;
      const isValid = await bcrypt.compare(currentPassword, user.password);

      if (!isValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      await updateUserPassword(user._id, newPassword);

      return res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("[api/user/profile]", error);
      return res.status(500).json({ error: "Failed to change password" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}