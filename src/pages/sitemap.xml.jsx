import { getCanonicalUrl } from "../lib/site";

export async function getServerSideProps({ res }) {
  const base = getCanonicalUrl() || "https://uptoraelectronics.com";
  const staticPages = ["/", "/about"];
  let productUrls = [];

  try {
    // Fetch products safely
    const productRes = await fetch(`${base}/api/products?limit=500`);
    if (productRes.ok) {
      const data = await productRes.json();
      if (Array.isArray(data.products)) {
        productUrls = data.products.map((p) => `/product/${p.id}`);
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