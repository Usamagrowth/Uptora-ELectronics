export async function getServerSideProps({ res }) {
  // Fetch all products from the API
  const base = "https://uptora-electronics.vercel.app";
  const staticPages = ["/", "/about"];
  
  // Build product URLs
  const productRes = await fetch(`${base}/api/products?limit=500`);
  const { products } = await productRes.json();
  const productUrls = products.map(p => `/product/${p.id}`);
  
  const allUrls = [...staticPages, ...productUrls];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${allUrls.map(url => `
      <url>
        <loc>${base}${url}</loc>
        <changefreq>${url === "/" ? "daily" : "weekly"}</changefreq>
        <priority>${url === "/" ? "1.0" : "0.8"}</priority>
      </url>
    `).join("")}
  </urlset>`;
  
  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();
  return { props: {} };
}

export default function Sitemap() { return null; }
