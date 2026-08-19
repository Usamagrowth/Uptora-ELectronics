import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../../../lib/db/categories";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth-options";

export default async function handler(req, res) {
  try {
    // GET requests don't require authentication (public access for navbar)
    if (req.method === "GET") {
      const categories = await getAllCategories();
      return res.status(200).json({ categories });
    }

    // Write operations require admin authentication
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.query;

    switch (req.method) {
      case "POST":
        // Create new category (admin only)
        const categoryData = req.body;
        const newCategory = await createCategory(categoryData);
        return res.status(201).json(newCategory);

      case "PUT":
        // Update category (admin only)
        if (!id) {
          return res.status(400).json({ error: "Category ID required" });
        }
        const updatedCategory = await updateCategory(id, req.body);
        return res.status(200).json(updatedCategory);

      case "DELETE":
        // Delete category (admin only)
        if (!id) {
          return res.status(400).json({ error: "Category ID required" });
        }
        await deleteCategory(id);
        return res.status(200).json({ success: true });

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
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
