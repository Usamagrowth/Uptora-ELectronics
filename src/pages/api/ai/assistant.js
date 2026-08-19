import { getAllProducts, searchProducts, getProductsByFilters } from "../../../lib/db/products";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end("Method Not Allowed");
    }

    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const lowerMessage = message.toLowerCase();
    let response = "";
    let products = [];

    // AI Intent Detection
    const intents = {
      priceQuery: /under|below|less than|cheaper than|budget|maximum|max/i,
      categoryQuery: /show me|find|looking for|need|want|search for/i,
      comparison: /compare|difference|between|vs|versus/i,
      recommendation: /recommend|suggest|best|good|top/i,
      brandQuery: /samsung|lg|hisense|sony|apple|iphone|samsung|itel|felicity|deye|sako/i,
      featureQuery: /camera|battery|screen|display|storage|ram|processor|smart|4k|hdr/i,
    };

    // Extract price range
    const priceMatch = lowerMessage.match(/₦?\s*(\d+(?:,\d+)*(?:\.\d+)?)/g);
    let maxPrice = null;
    if (priceMatch) {
      const prices = priceMatch.map(p => parseFloat(p.replace(/[₦,\s]/g, '')));
      maxPrice = Math.max(...prices);
    }

    // Extract brand
    const brands = ["samsung", "lg", "hisense", "sony", "apple", "iphone", "itel", "felicity", "deye", "sako"];
    const detectedBrand = brands.find(brand => lowerMessage.includes(brand));

    // Extract category from message
    const categories = [
      "phones", "tablets", "televisions", "tv", "inverters", "batteries", 
      "solar", "air conditioners", "ac", "audio", "headphones", "speakers",
      "kitchen", "blenders", "cookers", "washing machines", "freezers",
      "refrigerators", "cameras", "laptops", "generators"
    ];
    const detectedCategory = categories.find(cat => lowerMessage.includes(cat));

    // Build search query
    let searchQuery = "";
    if (detectedCategory) {
      searchQuery = detectedCategory;
    } else if (detectedBrand) {
      searchQuery = detectedBrand;
    } else {
      // Extract key terms from message
      const keywords = message.split(/\s+/).filter(word => 
        word.length > 3 && 
        !intents.priceQuery.test(word) &&
        !intents.categoryQuery.test(word) &&
        !["show", "me", "find", "looking", "for", "need", "want", "search", "under", "below", "less", "than", "maximum", "budget"].includes(word.toLowerCase())
      );
      searchQuery = keywords.slice(0, 3).join(" ");
    }

    // Search products based on intent
    if (intents.priceQuery.test(lowerMessage) && maxPrice) {
      // Price-based search
      const filters = { maxPrice };
      if (detectedCategory) filters.category = detectedCategory.replace(/s$/, ''); // Simple plural handling
      if (detectedBrand) filters.brand = detectedBrand;
      
      products = await getProductsByFilters(filters, 5, "price-asc");
      
      if (products.length > 0) {
        response = `I found ${products.length} product${products.length > 1 ? 's' : ''} under ₦${maxPrice.toLocaleString()}. Here are the best options:`;
      } else {
        response = `I couldn't find any products under ₦${maxPrice.toLocaleString()}. Would you like to see products in a higher price range?`;
      }
    } else if (intents.recommendation.test(lowerMessage)) {
      // Recommendation search
      if (detectedCategory) {
        products = await searchProducts(detectedCategory, 5);
        response = `Here are my top recommendations for ${detectedCategory}:`;
      } else if (detectedBrand) {
        products = await searchProducts(detectedBrand, 5);
        response = `Here are my top ${detectedBrand} recommendations:`;
      } else {
        products = await getAllProducts({ featured: true }, { limit: 5 });
        response = "Here are our featured products I recommend:";
      }
    } else if (searchQuery) {
      // General search
      products = await searchProducts(searchQuery, 5);
      response = `I found ${products.length} product${products.length > 1 ? 's' : ''} matching "${searchQuery}":`;
    } else {
      // Fallback to featured products
      products = await getAllProducts({ featured: true }, { limit: 5 });
      response = "Here are some of our popular products you might like:";
    }

    // Format product results
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      brand: product.brand,
      image: product.image,
      inStock: product.inStock,
      slug: product.slug,
    }));

    return res.status(200).json({
      response,
      products: formattedProducts,
      query: searchQuery,
      intent: {
        priceQuery: intents.priceQuery.test(lowerMessage),
        hasPriceFilter: !!maxPrice,
        maxPrice,
        detectedBrand,
        detectedCategory,
      },
    });
  } catch (error) {
    console.error("API Error in /api/ai/assistant:", error);
    return res.status(500).json({ 
      error: "Internal server error", 
      message: error.message 
    });
  }
}