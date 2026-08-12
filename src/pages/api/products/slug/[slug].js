import { getProductBySlug } from "../../../../lib/db/products";

export default async function handler(req, res) {
  try {
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ error: "Slug is required" });
    }

    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end("Method Not Allowed");
    }

    const product = await getProductBySlug(slug);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("API Error in /api/products/slug/[slug]:", error);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      error: "Internal server error", 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
