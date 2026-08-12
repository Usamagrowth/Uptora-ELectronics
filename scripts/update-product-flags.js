import { MongoClient } from "mongodb";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, "../.env") });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "uptora-electronics";

if (!uri) {
  console.error("❌ MONGODB_URI is not set in .env file");
  process.exit(1);
}

async function updateProductFlags() {
  console.log("🚀 Starting product flags update...\n");
  
  let client;
  
  try {
    // Connect to database
    console.log("📡 Connecting to MongoDB...");
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    console.log("✅ Connected to MongoDB\n");
    
    const productsCollection = db.collection("products");
    
    // Get all products
    const allProducts = await productsCollection.find({}).toArray();
    console.log(`📦 Found ${allProducts.length} products in database\n`);
    
    // Strategy: Set flags based on product characteristics
    let updateCount = 0;
    
    for (const product of allProducts) {
      const updates = {};
      
      // Set featured for high-rated products (rating >= 4.5)
      if (product.rating >= 4.5) {
        updates.featured = true;
      }
      
      // Set bestSeller for popular categories and high-rated products
      const popularCategories = [
        "Inverter & Battery",
        "Solar Panel", 
        "Phones & Tablets",
        "Power Stations"
      ];
      
      if (popularCategories.includes(product.category) && product.rating >= 4.3) {
        updates.bestSeller = true;
      }
      
      // Set newArrival for products with higher IDs (newer products)
      // Assume products with IDs in the top 30% are "new arrivals"
      const maxId = Math.max(...allProducts.map(p => p.id));
      if (product.id >= maxId * 0.7) {
        updates.newArrival = true;
      }
      
      // Set sale flag for some products randomly (20% chance)
      if (Math.random() < 0.2) {
        updates.sale = true;
        // Add discount price (10-30% off)
        if (!updates.discountPrice) {
          const discountPercent = 0.1 + Math.random() * 0.2; // 10-30%
          updates.discountPrice = Math.round(product.price * (1 - discountPercent));
        }
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await productsCollection.updateOne(
          { _id: product._id },
          { $set: updates }
        );
        updateCount++;
        console.log(`✅ Updated product ${product.id}: ${product.name}`);
        console.log(`   Flags: ${JSON.stringify(updates)}`);
      }
    }
    
    console.log(`\n✅ Successfully updated ${updateCount} products`);
    
    // Verify the updates
    console.log("\n🔍 Verifying updates...");
    const featuredCount = await productsCollection.countDocuments({ featured: true });
    const bestSellerCount = await productsCollection.countDocuments({ bestSeller: true });
    const newArrivalCount = await productsCollection.countDocuments({ newArrival: true });
    const saleCount = await productsCollection.countDocuments({ sale: true });
    
    console.log(`✅ Featured products: ${featuredCount}`);
    console.log(`✅ Best seller products: ${bestSellerCount}`);
    console.log(`✅ New arrival products: ${newArrivalCount}`);
    console.log(`✅ Sale products: ${saleCount}`);
    
    console.log("\n🎉 Product flags update completed successfully!\n");
    
  } catch (error) {
    console.error("❌ Update failed:", error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log("📡 Database connection closed");
    }
  }
}

// Run the update
updateProductFlags().catch(console.error);
