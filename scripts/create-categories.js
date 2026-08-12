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

// Categories with display order
const categories = [
  {
    name: "Inverter & Battery",
    slug: "inverter-battery",
    displayOrder: 1,
    image: "/banners/solar11.png"
  },
  {
    name: "Solar Panel",
    slug: "solar-panel",
    displayOrder: 2,
    image: "/banners/solar11.png"
  },
  {
    name: "Power Stations",
    slug: "power-stations",
    displayOrder: 3,
    image: "/banners/solar11.png"
  },
  {
    name: "Phones & Tablets",
    slug: "phones-tablets",
    displayOrder: 4,
    image: "/banners/phone11.png"
  },
  {
    name: "Computing",
    slug: "computing",
    displayOrder: 5,
    image: "/banners/laptop11.png"
  },
  {
    name: "Televisions",
    slug: "televisions",
    displayOrder: 6,
    image: "/banners/tv.png"
  },
  {
    name: "Air Conditioners",
    slug: "air-conditioners",
    displayOrder: 7,
    image: "/banners/ac11.png"
  },
  {
    name: "Refrigerators",
    slug: "refrigerators",
    displayOrder: 8,
    image: "/banners/refrigerator11.png"
  },
  {
    name: "Freezers",
    slug: "freezers",
    displayOrder: 9,
    image: "/banners/freezer11.png"
  },
  {
    name: "Washing Machines",
    slug: "washing-machines",
    displayOrder: 10,
    image: "/banners/washing-machine11.png"
  },
  {
    name: "Generators",
    slug: "generators",
    displayOrder: 11,
    image: "/banners/generator.png"
  },
  {
    name: "Kitchen Appliances",
    slug: "kitchen-appliances",
    displayOrder: 12,
    image: "/banners/kitchen11.png"
  },
  {
    name: "Gaming",
    slug: "gaming",
    displayOrder: 13,
    image: "/banners/gaming11.png"
  },
  {
    name: "Electronics",
    slug: "electronics",
    displayOrder: 14,
    image: "/banners/electronics.png"
  },
  {
    name: "Appliances",
    slug: "appliances",
    displayOrder: 15,
    image: "/banners/home-appliances.png"
  },
  {
    name: "Audio & Accessories",
    slug: "audio-accessories",
    displayOrder: 16,
    image: "/banners/audio11.png"
  }
];

async function createCategories() {
  console.log("🔧 Creating categories collection...\n");
  
  let client;
  
  try {
    console.log("📡 Connecting to MongoDB...");
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    console.log("✅ Connected to MongoDB\n");
    
    const categoriesCollection = db.collection("categories");
    
    // Clear existing categories
    const existingCount = await categoriesCollection.countDocuments();
    if (existingCount > 0) {
      console.log(`🗑️  Clearing ${existingCount} existing categories...`);
      await categoriesCollection.deleteMany({});
      console.log("✅ Cleared existing categories\n");
    }
    
    // Insert new categories
    console.log("💾 Inserting categories with display order...");
    await categoriesCollection.insertMany(categories);
    console.log(`✅ Inserted ${categories.length} categories\n`);
    
    // Verify insertion
    const insertedCategories = await categoriesCollection.find({}).sort({ displayOrder: 1 }).toArray();
    console.log("📋 Categories in display order:");
    insertedCategories.forEach(cat => {
      console.log(`   ${cat.displayOrder}. ${cat.name} (${cat.slug})`);
    });
    
    console.log("\n🎉 Categories collection created successfully!\n");
    
  } catch (error) {
    console.error("❌ Failed to create categories:", error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log("📡 Database connection closed");
    }
  }
}

// Run the script
createCategories().catch(console.error);
