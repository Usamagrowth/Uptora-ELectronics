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

async function clearProductsCollection() {
  console.log("🗑️  Clearing products collection...\n");
  
  let client;
  
  try {
    console.log("📡 Connecting to MongoDB...");
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    console.log("✅ Connected to MongoDB\n");
    
    const productsCollection = db.collection("products");
    
    // Get current count
    const currentCount = await productsCollection.countDocuments();
    console.log(`📦 Current products count: ${currentCount}\n`);
    
    if (currentCount === 0) {
      console.log("⚠️  Products collection is already empty");
      return;
    }
    
    // Confirm deletion
    console.log("⚠️  This will delete all products from the collection");
    console.log("Press Ctrl+C to cancel, or wait 3 seconds to continue...");
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Delete all products
    const result = await productsCollection.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} products\n`);
    
    // Verify deletion
    const finalCount = await productsCollection.countDocuments();
    console.log(`📦 Final products count: ${finalCount}`);
    
    if (finalCount === 0) {
      console.log("✅ Products collection cleared successfully\n");
    } else {
      console.log("⚠️  Some products may not have been deleted\n");
    }
    
  } catch (error) {
    console.error("❌ Clear operation failed:", error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log("📡 Database connection closed");
    }
  }
}

// Run the clear operation
clearProductsCollection().catch(console.error);
