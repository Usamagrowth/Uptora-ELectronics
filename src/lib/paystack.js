import { getProductById } from "../lib/db/products";
import {
  getPaystackSecretKey,
  isDemoPaystackMode,
  validatePaystackKeys,
} from "./paystack-config";

export { isDemoPaystackMode, validatePaystackKeys };

export function parseCardExpiry(expiry) {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry.trim());
  if (!match) return null;
  const month = match[1];
  const year = `20${match[2]}`;
  const monthNum = Number(month);
  if (monthNum < 1 || monthNum > 12) return null;
  return { expiry_month: month, expiry_year: year };
}

export async function computeCartTotal(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }
  
  let total = 0;
  
  for (const item of items) {
    try {
      const productId = Number(item.id);
      
      if (!productId || isNaN(productId)) {
        throw new Error(`Invalid product ID: ${item.id}`);
      }
      
      const product = await getProductById(productId);
      
      if (!product) {
        throw new Error(`Product not found: ${item.id}`);
      }
      
      const qty = Math.max(1, Math.min(99, Number(item.quantity) || 1));
      total += product.price * qty;
    } catch (error) {
      console.error(`Error computing cart total for item ${item.id}:`, error);
      throw new Error(`Failed to compute cart total: ${error.message}`);
    }
  }
  
  return total;
}

export async function verifyPaystackTransaction(reference) {
  const { secretKey } = validatePaystackKeys();

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Paystack verification failed");
  }

  return data;
}
