import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth-options";
import {
  createOrder,
  getAllOrders,
  getOrdersByUserId,
  getOrdersByEmail,
  updateOrderStatus,
  findOrderByPaymentReference,
} from "../../lib/db/orders";
import { isDemoPaystackMode } from "../../lib/paystack-config";
import { isAdminEmail } from "../../lib/admin";
import { validateAndPriceCart } from "../../lib/cart";
import { ensureDbIndexes } from "../../lib/db/init";
import { sendOrderEmails } from "../../lib/email";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const admin = isAdminEmail(session.user.email);
      let orders;

      if (admin) {
        orders = await getAllOrders();
      } else if (session.user.id) {
        orders = await getOrdersByUserId(session.user.id);
      } else {
        orders = await getOrdersByEmail(session.user.email);
      }

      return res.status(200).json({ orders });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Failed to load orders." });
    }
  }

  if (req.method === "POST") {
    const { reference, items, address, city, phone } = req.body;

    if (!reference || !items || !address || !city || !phone) {
      return res.status(400).json({ error: "Missing order data" });
    }

    const isDemo =
      isDemoPaystackMode() &&
      typeof reference === "string" &&
      reference.startsWith("UPTORA-DEMO-");

    if (!isDemo) {
      return res.status(400).json({
        error: "Live orders are created automatically after Paystack payment.",
      });
    }

    try {
      await ensureDbIndexes();
      const existing = await findOrderByPaymentReference(reference);
      if (existing) {
        return res.status(200).json({ order: existing });
      }

      const { validatedItems, totalAmount } = validateAndPriceCart(items);

      const order = await createOrder({
        userId: session.user.id,
        customerName: session.user.name || "Unknown",
        customerEmail: session.user.email,
        items: validatedItems,
        totalAmount,
        paymentReference: reference,
        status: "Paid",
        deliveryStatus: "Pending",
        address,
        city,
        phone,
      });

      await sendOrderEmails({
        order,
        customerEmail: session.user.email,
        customerName: session.user.name || "Customer",
      });

      return res.status(201).json({ order });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Could not create order." });
    }
  }

  if (req.method === "PATCH") {
    if (!isAdminEmail(session.user.email)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: "Missing order id or status" });
    }

    try {
      const order = await updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      return res.status(200).json({ order });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Failed to update order." });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
