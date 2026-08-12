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

// Helper function to convert to title case
function toTitleCase(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to convert to sentence case
function toSentenceCase(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s*\w)/g, match => match.toUpperCase());
}

async function standardizeProductCase() {
  console.log("🔧 Standardizing product name and description case...\n");
  
  let client;
  
  try {
    console.log("📡 Connecting to MongoDB...");
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    console.log("✅ Connected to MongoDB\n");
    
    const productsCollection = db.collection("products");
    
    // Get all products
    const allProducts = await productsCollection.find({}).toArray();
    console.log(`📦 Found ${allProducts.length} products\n`);
    
    let updatedCount = 0;
    
    for (const product of allProducts) {
      const updates = {};
      
      // Standardize name to title case
      if (product.name) {
        const standardizedName = toTitleCase(product.name);
        if (standardizedName !== product.name) {
          updates.name = standardizedName;
        }
      }
      
      // Standardize description to sentence case
      if (product.description) {
        const standardizedDescription = toSentenceCase(product.description);
        if (standardizedDescription !== product.description) {
          updates.description = standardizedDescription;
        }
      }
      
      // Update if there are changes
      if (Object.keys(updates).length > 0) {
        await productsCollection.updateOne(
          { _id: product._id },
          { $set: updates }
        );
        console.log(`✅ Updated product ID ${product.id}: ${product.name} → ${updates.name || product.name}`);
        updatedCount++;
      }
    }
    
    console.log(`\n✅ Standardized ${updatedCount} products`);
    console.log("🎉 Case standardization completed!\n");
    
  } catch (error) {
    console.error("❌ Standardization failed:", error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log("📡 Database connection closed");
    }
  }
}

// Run the standardization
standardizeProductCase().catch(console.error);
