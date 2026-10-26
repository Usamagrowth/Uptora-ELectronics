export async function getServerSideProps({ res }) {
  // Always enforce your main domain for production sitemaps
  const base = "https://uptoraelectronics.com";
  const staticPages = ["/", "/about"];
  let productUrls = [];

  try {
    // Fetch products directly using the absolute domain
    const productRes = await fetch(`${base}/api/products?limit=500`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SitemapGenerator/1.0)",
      },
    });

    if (productRes.ok) {
      const data = await productRes.json();
      const products = data.products || data;
      if (Array.isArray(products)) {
        productUrls = products.map((p) => `/product/${p.id || p._id}`);
      }
    } else {
      console.error("Failed to fetch products for sitemap:", productRes.status);
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