import { searchProducts } from "../../../lib/db/products";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end("Method Not Allowed");
    }

    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const products = await searchProducts(q, parseInt(limit));
    return res.status(200).json({ products });
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
