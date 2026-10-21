import { ObjectId } from "mongodb";
import { getDb } from "../mongodb";
import { generateOTP, hashOTP, verifyOTP, isOTPExpired, getOTPExpiry } from "../otp";

const COLLECTION = "orders";

function formatOrder(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    customerName: doc.customerName,
    customerEmail: doc.customerEmail,
    date: doc.createdAt ? doc.createdAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    total: doc.totalAmount,
    totalAmount: doc.totalAmount,
    paymentRef: doc.paymentReference,
    paymentReference: doc.paymentReference,
    status: doc.status,
    deliveryStatus: doc.deliveryStatus || doc.status,
    items: doc.items,
    address: doc.address,
    city: doc.city,
    phone: doc.phone,
    createdAt: doc.createdAt,
    // OTP fields (exposed to admin but not to customer)
    hasOTP: Boolean(doc.deliveryOTPHash),
    otpExpiry: doc.otpExpiry,
    otpAttempts: doc.otpAttempts || 0,
  };
}

export async function createOrder(order) {
  const db = await getDb();
  const doc = {
    userId: order.userId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    items: order.items,
    totalAmount: order.totalAmount,
    paymentReference: order.paymentReference,
    status: order.status || "Paid",
    deliveryStatus: order.deliveryStatus || "Pending",
    address: order.address || "",
    city: order.city || "",
    phone: order.phone || "",
    createdAt: new Date(),
  };

  const result = await db.collection(COLLECTION).insertOne(doc);
  return formatOrder({ _id: result.insertedId, ...doc });
}

export async function findOrderByPaymentReference(paymentReference) {
  const db = await getDb();
  const doc = await db.collection(COLLECTION).findOne({ paymentReference });
  return formatOrder(doc);
}

export async function getOrdersByUserId(userId) {
  const db = await getDb();
  const docs = await db
    .collection(COLLECTION)
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(formatOrder);
}

export async function getOrdersByEmail(email) {
  const db = await getDb();
  const docs = await db
    .collection(COLLECTION)
    .find({ customerEmail: email })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(formatOrder);
}

export async function getAllOrders() {
  const db = await getDb();
  const docs = await db.collection(COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
  return docs.map(formatOrder);
}

export async function updateOrderStatus(orderId, status) {
  const db = await getDb();
  const deliveryStatus =
    status === "Shipped" ? "Shipped" : status === "Delivered" ? "Delivered" : status;

  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(orderId) },
    { $set: { status, deliveryStatus, updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  return formatOrder(result);
}

/**
 * Generate and store delivery OTP for an order
 */
export async function generateDeliveryOTP(orderId) {
  const db = await getDb();
  const otpCode = generateOTP();
  const otpHash = await hashOTP(otpCode);
  const otpExpiry = getOTPExpiry(24); // 24 hours

  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(orderId) },
    {
      $set: {
        deliveryOTPHash: otpHash,
        otpExpiry,
        otpAttempts: 0,
        otpGeneratedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  return { otp: otpCode, order: formatOrder(result) };
}

/**
 * Verify delivery OTP for an order
 */
export async function verifyDeliveryOTP(orderId, otp) {
  const db = await getDb();
  const order = await db.collection(COLLECTION).findOne({ _id: new ObjectId(orderId) });

  if (!order) {
    return { success: false, error: "Order not found" };
  }

  if (!order.deliveryOTPHash) {
    return { success: false, error: "No OTP generated for this order" };
  }

  if (isOTPExpired(order.otpExpiry)) {
    return { success: false, error: "OTP has expired" };
  }

  if (order.otpAttempts >= 3) {
    return { success: false, error: "Too many failed attempts. Please contact support." };
  }

  const isValid = await verifyOTP(otp, order.deliveryOTPHash);

  if (!isValid) {
    // Increment attempt counter
    await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(orderId) },
      { $inc: { otpAttempts: 1 } }
    );
    return { success: false, error: "Invalid OTP" };
  }

  // OTP is valid - return success but don't mark delivered yet
  return { success: true, order: formatOrder(order) };
}

/**
 * Mark order as delivered after OTP verification
 */
export async function markOrderDelivered(orderId, deliveryAgentEmail) {
  const db = await getDb();

  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(orderId) },
    {
      $set: {
        status: "Delivered",
        deliveryStatus: "Delivered",
        deliveredAt: new Date(),
        deliveryAgentEmail,
        // Clear OTP after successful delivery
        deliveryOTPHash: null,
        otpExpiry: null,
        otpAttempts: 0,
      },
    },
    { returnDocument: "after" }
  );

  return formatOrder(result);
}

/**
 * Regenerate OTP for an order (admin only)
 */
export async function regenerateDeliveryOTP(orderId) {
  const db = await getDb();
  const otpCode = generateOTP();
  const otpHash = await hashOTP(otpCode);
  const otpExpiry = getOTPExpiry(24);

  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(orderId) },
    {
      $set: {
        deliveryOTPHash: otpHash,
        otpExpiry,
        otpAttempts: 0,
        otpGeneratedAt: new Date(),
        otpRegeneratedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  return { otp: otpCode, order: formatOrder(result) };
}
