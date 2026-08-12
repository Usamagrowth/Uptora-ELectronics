import { getFeaturedProducts } from "../../../lib/db/products";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end("Method Not Allowed");
    }

    const { limit = 200 } = req.query;
    const products = await getFeaturedProducts(parseInt(limit));
    return res.status(200).json({ products });
  } catch (error) {
    console.error("API Error in /api/products/featured:", error);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      error: "Internal server error", 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
