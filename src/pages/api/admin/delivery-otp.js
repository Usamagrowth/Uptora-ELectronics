import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth-options";
import { isAdminEmail } from "../../../lib/admin";
import {
  generateDeliveryOTP,
  regenerateDeliveryOTP,
  markOrderDelivered,
} from "../../../lib/db/orders";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!isAdminEmail(session.user.email)) {
      return res.status(403).json({ error: "Forbidden - admin access required" });
    }

    const { action, orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    if (action === "generate") {
      const result = await generateDeliveryOTP(orderId);
      return res.status(200).json(result);
    }

    if (action === "regenerate") {
      const result = await regenerateDeliveryOTP(orderId);
      return res.status(200).json(result);
    }

    if (action === "mark-delivered") {
      const result = await markOrderDelivered(orderId, session.user.email);
      return res.status(200).json(result);
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error) {
    console.error("[api/admin/delivery-otp]", error);
    return res.status(500).json({ error: "Failed to process request" });
  }
}
