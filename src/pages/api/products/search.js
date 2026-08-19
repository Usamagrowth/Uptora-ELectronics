import { searchProducts, getProductsByFilters } from "../../../lib/db/products";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end("Method Not Allowed");
    }

    const { q, category, minPrice, maxPrice, brand, limit = 20, sort = "relevance" } = req.query;
    
    // Search query
    if (q) {
      const products = await searchProducts(q, parseInt(limit));
      return res.status(200).json({ products, query: q, type: "search" });
    }
    
    // Filter query
    if (category || minPrice || maxPrice || brand) {
      const filters = {};
      if (category) filters.category = category;
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
      if (brand) filters.brand = brand;
      
      const products = await getProductsByFilters(filters, parseInt(limit), sort);
      return res.status(200).json({ products, filters, type: "filter" });
    }
    
    return res.status(400).json({ error: "Search query or filters are required" });
  } catch (error) {
    console.error("API Error in /api/products/search:", error);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      error: "Internal server error", 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
