import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../../lib/db/products";
import { requireAdmin } from "../../../lib/auth-middleware";

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case "GET":
        // Get all products with optional filters and pagination
        const {
          category,
          brand,
          featured,
          bestSeller,
          newArrival,
          sale,
          inStock,
          minPrice,
          maxPrice,
          search,
          limit = 200,
          skip = 0,
          sortBy = "createdAt",
          sortOrder = "desc",
        } = req.query;

        const filters = {};
        if (category) filters.category = category;
        if (brand) filters.brand = brand;
        if (featured !== undefined) filters.featured = featured === "true";
        if (bestSeller !== undefined) filters.bestSeller = bestSeller === "true";
        if (newArrival !== undefined) filters.newArrival = newArrival === "true";
        if (sale !== undefined) filters.sale = sale === "true";
        if (inStock !== undefined) filters.inStock = inStock === "true";
        if (minPrice) filters.minPrice = minPrice;
        if (maxPrice) filters.maxPrice = maxPrice;
        if (search) filters.search = search;

        const options = {
          limit: parseInt(limit),
          skip: parseInt(skip),
          sortBy,
          sortOrder,
        };

        const result = await getAllProducts(filters, options);
        return res.status(200).json(result);

      case "POST":
        // Create new product (admin only)
        const authError = await requireAdmin(req, res);
        if (authError) return authError;
        
        const productData = req.body;
        const newProduct = await createProduct(productData);
        return res.status(201).json(newProduct);

      case "PUT":
        // Update product (admin only)
        const putAuthError = await requireAdmin(req, res);
        if (putAuthError) return putAuthError;
        
        const { id } = req.query;
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
        
        const { id: deleteId } = req.query;
        const deleted = await deleteProduct(deleteId);
        if (!deleted) {
          return res.status(404).json({ error: "Product not found" });
        }
        return res.status(204).end();

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).end("Method Not Allowed");
    }
  } catch (error) {
    console.error("API Error in /api/products:", error);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      error: "Internal server error", 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
