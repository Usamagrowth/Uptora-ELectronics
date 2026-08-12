import { getAllCategories, createCategory } from "../../../lib/db/categories";

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case "GET":
        // Get all categories sorted by display order
        const categories = await getAllCategories();
        return res.status(200).json({ categories });

      case "POST":
        // Create new category (admin only)
        const categoryData = req.body;
        const newCategory = await createCategory(categoryData);
        return res.status(201).json(newCategory);

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).end("Method Not Allowed");
    }
  } catch (error) {
    console.error("API Error in /api/categories:", error);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      error: "Internal server error", 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
