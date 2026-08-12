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

console.log("🔍 Database Configuration Check\n");
console.log(`MONGODB_URI: ${uri ? "SET" : "NOT SET"}`);
console.log(`MONGODB_DB_NAME: ${dbName}\n`);

if (!uri) {
  console.error("❌ MONGODB_URI is not set in .env file");
  process.exit(1);
}

async function checkDatabase() {
  let client;
  
  try {
    console.log("📡 Connecting to MongoDB...");
    client = new MongoClient(uri);
    await client.connect();
    console.log("✅ Connected to MongoDB\n");
    
    // Check if the specified database exists
    const admin = client.db().admin();
    const databases = await admin.listDatabases();
    const dbExists = databases.databases.some(db => db.name === dbName);
    
    console.log(`Database "${dbName}" exists: ${dbExists ? "YES" : "NO"}`);
    
    if (!dbExists) {
      console.log(`\n⚠️  Database "${dbName}" does not exist!`);
      console.log("Available databases:");
      databases.databases.forEach(db => console.log(`  - ${db.name}`));
      return;
    }
    
    const db = client.db(dbName);
    
    // Check products collection
    const collections = await db.listCollections().toArray();
    console.log(`\nCollections in "${dbName}":`);
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    const productsCollection = db.collection("products");
    const productCount = await productsCollection.countDocuments();
    console.log(`\n📦 Products count: ${productCount}`);
    
    if (productCount > 0) {
      const sampleProducts = await productsCollection.find({}).limit(5).toArray();
      console.log("\nSample products:");
      sampleProducts.forEach(p => {
        console.log(`  - ID: ${p.id}, Name: ${p.name}, Category: ${p.category}`);
      });
      
      // Check product flags
      const featuredCount = await productsCollection.countDocuments({ featured: true });
      const bestSellerCount = await productsCollection.countDocuments({ bestSeller: true });
      const newArrivalCount = await productsCollection.countDocuments({ newArrival: true });
      
      console.log("\nProduct flags:");
      console.log(`  - Featured: ${featuredCount}`);
      console.log(`  - Best Sellers: ${bestSellerCount}`);
      console.log(`  - New Arrivals: ${newArrivalCount}`);
      
      // Check categories
      const categories = await productsCollection.distinct("category");
      console.log(`\nCategories (${categories.length}):`);
      categories.forEach(cat => console.log(`  - ${cat}`));
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    if (client) {
      await client.close();
      console.log("\n📡 Database connection closed");
    }
  }
}

checkDatabase();
