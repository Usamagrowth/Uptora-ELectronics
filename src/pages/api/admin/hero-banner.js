import { getDb } from "../../../lib/mongodb";
import { isAdminEmail } from "../../../lib/admin";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth-options";
import { updateHeroBannerSettings, getSettings } from "../../../lib/db/settings";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!isAdminEmail(session.user.email)) {
      return res.status(403).json({ error: "Forbidden - admin access required" });
    }

    if (req.method === "GET") {
      const settings = await getSettings();
      return res.status(200).json({
        slides: settings?.slides || [
          { image: "/hero-banner.png", href: "/?section=featured" },
          { image: "/banners/flash-sale.png", href: "/?section=best-sellers" },
          { image: "/banners/gaming.png", href: "/?category=Gaming" },
          { image: "/hero-banner3.png", href: "/?category=Phones%20%26%20Tablets" },
        ],
      });
    }

    if (req.method === "POST") {
      const { slides } = req.body;

      if (!Array.isArray(slides)) {
        return res.status(400).json({ error: "slides must be an array" });
      }

      // Validate each slide
      for (const slide of slides) {
        if (!slide.image || typeof slide.image !== "string") {
          return res.status(400).json({ error: "Each slide must have a valid image URL" });
        }
        if (!slide.href || typeof slide.href !== "string") {
          return res.status(400).json({ error: "Each slide must have a valid href" });
        }
      }

      await updateHeroBannerSettings(slides);
      return res.status(200).json({ success: true, slides });
    }
  } catch (error) {
    console.error("[api/admin/hero-banner]", error);
    return res.status(500).json({ error: "Failed to process request" });
  }
}
