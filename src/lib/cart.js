import { getProductById } from "../lib/db/products";

/**
 * Validates cart line items against the server product catalog.
 * Never trusts client-supplied prices.
 */
export async function validateAndPriceCart(cartItems = []) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const validatedItems = [];

  for (const item of cartItems) {
    try {
      const productId = Number(item.id);
      
      if (!productId || isNaN(productId)) {
        throw new Error(`Invalid product ID: ${item.id}`);
      }
      
      const product = await getProductById(productId);

      if (!product) {
        throw new Error(`Product not found: ${item.id}`);
      }

      if (!product.inStock) {
        throw new Error(`${product.name} is out of stock.`);
      }

      const quantity = Math.max(1, Math.min(99, Number(item.quantity) || 1));

      validatedItems.push({
        id: product.id,
        name: product.name,
        category: product.category,
        image: product.image,
        price: product.price,
        quantity,
        lineTotal: product.price * quantity,
      });
    } catch (error) {
      console.error(`Error validating cart item ${item.id}:`, error);
      throw new Error(`Failed to validate product: ${error.message}`);
    }
  }

  const totalAmount = validatedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  if (totalAmount <= 0) {
    throw new Error("Invalid order total.");
  }

  return { validatedItems, totalAmount };
}
