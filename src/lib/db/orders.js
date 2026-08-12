import { ObjectId } from "mongodb";
import { getDb } from "../mongodb";

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
