import { getProductById, updateProduct, deleteProduct, getRelatedProducts } from "../../../lib/db/products";
import { requireAdmin } from "../../../lib/auth-middleware";

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    switch (req.method) {
      case "GET":
        const product = await getProductById(id);
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
        return res.status(200).json(product);

      case "PUT":
        // Update product (admin only)
        const putAuthError = await requireAdmin(req, res);
        if (putAuthError) return putAuthError;
        
        const updateData = req.body;
        const updatedProduct = await updateProduct(id, updateData);
        if (!updatedProduct) {
          return res.status(404).json({ error: "Product not found" });
        }
        return res.status(200).json(updatedProduct);

      case "DELETE":
        // Delete product (admin only)
        const deleteAuthError = await requireAdmin(req, res);
        if (deleteAuthError) return deleteAuthError;
        
        const deleted = await deleteProduct(id);
        if (!deleted) {
          return res.status(404).json({ error: "Product not found" });
        }
        return res.status(204).end();

      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).end("Method Not Allowed");
    }
  } catch (error) {
    console.error("API Error in /api/products/[id]:", error);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      error: "Internal server error", 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
