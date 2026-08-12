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

async function fixDuplicateIds() {
  console.log("🔧 Fixing duplicate IDs...\n");
  
  let client;
  
  try {
    console.log("📡 Connecting to MongoDB...");
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    console.log("✅ Connected to MongoDB\n");
    
    const productsCollection = db.collection("products");
    
    // Get all products sorted by ID
    const allProducts = await productsCollection.find({}).sort({ id: 1 }).toArray();
    console.log(`📦 Found ${allProducts.length} products\n`);
    
    // Check for duplicate IDs
    const idMap = new Map();
    const duplicates = [];
    
    allProducts.forEach(product => {
      if (idMap.has(product.id)) {
        duplicates.push({ id: product.id, existing: idMap.get(product.id), duplicate: product._id });
      } else {
        idMap.set(product.id, product._id);
      }
    });
    
    if (duplicates.length === 0) {
      console.log("✅ No duplicate IDs found\n");
      return;
    }
    
    console.log(`⚠️  Found ${duplicates.length} duplicate IDs`);
    duplicates.forEach(dup => {
      console.log(`   - ID ${dup.id}: duplicate _id ${dup.duplicate}`);
    });
    console.log();
    
    // Fix duplicates by reassigning IDs
    const maxId = Math.max(...allProducts.map(p => p.id));
    let nextId = maxId + 1;
    let fixedCount = 0;
    
    for (const duplicate of duplicates) {
      const newId = nextId++;
      await productsCollection.updateOne(
        { _id: duplicate.duplicate },
        { $set: { id: newId } }
      );
      console.log(`✅ Fixed duplicate ID ${duplicate.id} → ${newId}`);
      fixedCount++;
    }
    
    console.log(`\n✅ Fixed ${fixedCount} duplicate IDs`);
    
    // Verify fix
    const finalProducts = await productsCollection.find({}).sort({ id: 1 }).toArray();
    const finalIdSet = new Set(finalProducts.map(p => p.id));
    const hasDuplicates = finalIdSet.size !== finalProducts.length;
    
    if (hasDuplicates) {
      console.log("⚠️  Warning: Duplicate IDs still exist!");
    } else {
      console.log("✅ No duplicate IDs remaining");
    }
    
    console.log("\n🎉 Duplicate ID fix completed!\n");
    
  } catch (error) {
    console.error("❌ Fix operation failed:", error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log("📡 Database connection closed");
    }
  }
}

// Run the fix
fixDuplicateIds().catch(console.error);
