import { getCanonicalUrl } from "../lib/site";

export async function getServerSideProps({ res }) {
  // Use Vercel URL environment variable or your canonical domain
  const base = process.env.NEXT_PUBLIC_SITE_URL || getCanonicalUrl() || "https://uptoraelectronics.com";
  const staticPages = ["/", "/about"];
  let productUrls = [];

  try {
    // Fetch directly from your production domain using an absolute URL
    const productRes = await fetch(`${base}/api/products?limit=500`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SitemapGenerator/1.0)",
      },
    });

    if (productRes.ok) {
      const data = await productRes.json();
      // Safely check for products array
      const products = data.products || data;
      if (Array.isArray(products)) {
        productUrls = products.map((p) => `/product/${p.id || p._id}`);
      }
    }
  } catch (err) {
    console.error("Sitemap generation error:", err);
  }

  const allUrls = [...staticPages, ...productUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `  <url>
    <loc>${base}${url}</loc>
    <changefreq>${url === "/" ? "daily" : "weekly"}</changefreq>
    <priority>${url === "/" ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}