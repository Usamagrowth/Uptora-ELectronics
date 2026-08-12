import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";
import { isAdminEmail } from "./admin";

/**
 * Middleware to check if the current user is an admin
 * Throws an error if not authenticated or not an admin
 */
export async function requireAdmin(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized. Please sign in." });
    }
    
    if (!isAdminEmail(session.user.email)) {
      return res.status(403).json({ error: "Forbidden. Admin access required." });
    }
    
    // User is authenticated and is an admin
    return null;
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Authentication error" });
  }
}
