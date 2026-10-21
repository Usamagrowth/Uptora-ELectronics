import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth-options";
import { isAdminEmail } from "../../../lib/admin";
import { verifyDeliveryOTP, markOrderDelivered } from "../../../lib/db/orders";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Only admins/delivery agents can verify OTPs
    if (!isAdminEmail(session.user.email)) {
      return res.status(403).json({ error: "Forbidden - delivery agent access required" });
    }

    const { orderId, otp } = req.body;

    if (!orderId || !otp) {
      return res.status(400).json({ error: "Order ID and OTP are required" });
    }

    // Verify the OTP
    const verification = await verifyDeliveryOTP(orderId, otp);

    if (!verification.success) {
      return res.status(400).json(verification);
    }

    // OTP is valid - mark as delivered
    const deliveredOrder = await markOrderDelivered(orderId, session.user.email);

    return res.status(200).json({
      success: true,
      order: deliveredOrder,
      message: "Order marked as delivered successfully",
    });
  } catch (error) {
    console.error("[api/delivery/verify-otp]", error);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
}
