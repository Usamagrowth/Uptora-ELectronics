import { getSettings } from "../../../lib/db/settings";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const settings = await getSettings();

    // Return default slides if no custom settings exist
    const defaultSlides = [
      { image: "/hero-banner.png", href: "/?section=featured" },
      { image: "/banners/flash-sale.png", href: "/?section=best-sellers" },
      { image: "/banners/gaming.png", href: "/?category=Gaming" },
      { image: "/hero-banner3.png", href: "/?category=Phones%20%26%20Tablets" },
    ];

    return res.status(200).json({
      slides: settings?.slides || defaultSlides,
    });
  } catch (error) {
    console.error("[api/settings/hero-banner]", error);
    return res.status(500).json({ error: "Failed to fetch hero banner settings" });
  }
}
