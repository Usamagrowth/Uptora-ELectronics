import mongoose from "mongoose";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import { products } from "../src/services/productService.js";
import Product from "../src/models/Product.js";

// Load environment variables from .env file in project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, "../.env") });

// Direct MongoDB connection for migration script
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "uptora-electronics";

if (!uri) {
  console.error("❌ MONGODB_URI is not set in .env file");
  process.exit(1);
}

async function getDb() {
  const client = new MongoClient(uri);
  await client.connect();
  return client.db(dbName);
}

/**
 * Migration Script: Import products from static productService.js to MongoDB
 * 
 * This script:
 * - Reads all products from the static productService.js
 * - Generates URL-friendly slugs from product names
 * - Preserves all existing data fields
 * - Maintains ascending numeric IDs for backward compatibility
 * - Verifies data integrity after migration
 */

// Helper function to generate URL-friendly slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Helper function to extract brand from product name
function extractBrand(name) {
  const brands = [
    'Samsung', 'Apple', 'LG', 'Hisense', 'Sony', 'TCL', 'Nexus', 'Royal',
    'Haier', 'Scanfrost', 'Polystar', 'Midea', 'Century', 'Qasa', 'Binatone',
    'Silver Crest', 'Master Chef', 'Maxi', 'Skyworth', 'Panasonic', 'JBL',
    'Anker', 'Havit', 'Elepaq', 'Tiger', 'Firman', 'Sumec', 'Lutian', 'Mikano',
    'Deye', 'Felicity', 'SAKO', 'itel', 'Jinko', 'LONGi', 'HP', 'Dell'
  ];
  
  const lowerName = name.toLowerCase();
  for (const brand of brands) {
    if (lowerName.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return null;
}

// Helper function to ensure unique slug
function ensureUniqueSlug(slug, existingSlugs) {
  let uniqueSlug = slug;
  let counter = 1;
  
  while (existingSlugs.has(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
}

async function migrateProducts() {
  console.log("🚀 Starting product migration...\n");
  
  let client;
  
  try {
    // Connect to database
    console.log("📡 Connecting to MongoDB...");
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    console.log("✅ Connected to MongoDB\n");
    
    // Check if products collection already has data
    const existingCount = await db.collection("products").countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Products collection already has ${existingCount} documents.`);
      console.log("Clearing collection before migration...\n");
      await db.collection("products").deleteMany({});
      console.log("✅ Collection cleared\n");
    }
    
    console.log(`📦 Found ${products.length} products in static data\n`);
    
    // Get existing slugs to ensure uniqueness
    const existingProducts = await db.collection("products").find({}, { slug: 1 }).toArray();
    const existingSlugs = new Set(existingProducts.map(p => p.slug));
    
    // Prepare products for migration
    const productsToInsert = [];
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      try {
        // Generate slug
        let slug = generateSlug(product.name);
        slug = ensureUniqueSlug(slug, existingSlugs);
        existingSlugs.add(slug);
        
        // Extract brand
        const brand = extractBrand(product.name);
        
        // Prepare product document with intelligent flag assignment
        const productDoc = {
          id: product.id,
          slug,
          name: product.name,
          brand,
          category: product.category,
          price: product.price,
          image: product.image,
          images: product.images || [product.image],
          description: product.description,
          rating: product.rating || 0,
          inStock: product.inStock !== undefined ? product.inStock : true,
          stock: product.inStock !== undefined ? (product.inStock ? 100 : 0) : 100,
          options: product.options || [],
          
          // New fields with intelligent defaults
          subcategory: null,
          discountPrice: null,
          specifications: {},
          
          // Intelligent flag assignment
          featured: (product.rating || 0) >= 4.5,
          bestSeller: (product.rating || 0) >= 4.3 && ["Inverter & Battery", "Solar Panel", "Phones & Tablets", "Power Stations"].includes(product.category),
          newArrival: product.id >= Math.max(...products.map(p => p.id)) * 0.7,
          sale: Math.random() < 0.2, // 20% chance of being on sale
          
          tags: [],
          warranty: null,
          deliveryInformation: null,
          
          // Timestamps
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Add discount price for sale items
        if (productDoc.sale) {
          const discountPercent = 0.1 + Math.random() * 0.2; // 10-30% off
          productDoc.discountPrice = Math.round(product.price * (1 - discountPercent));
        }
        
        productsToInsert.push(productDoc);
        
      } catch (error) {
        console.error(`❌ Error processing product ${product.id}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`✅ Prepared ${productsToInsert.length} products for insertion`);
    console.log(`⚠️  Skipped ${skippedCount} products`);
    console.log(`❌ Errors: ${errorCount}\n`);
    
    // Insert products in batches
    console.log("💾 Inserting products into database...");
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      await db.collection("products").insertMany(batch);
      insertedCount += batch.length;
      console.log(`   Progress: ${insertedCount}/${productsToInsert.length}`);
    }
    
    console.log(`✅ Successfully inserted ${insertedCount} products\n`);
    
    // Verify migration
    console.log("🔍 Verifying migration...");
    const finalCount = await db.collection("products").countDocuments();
    const sampleProducts = await db.collection("products").find({}).limit(3).toArray();
    
    console.log(`✅ Final count: ${finalCount} products`);
    console.log(`✅ Sample products:`);
    sampleProducts.forEach(p => {
      console.log(`   - ID: ${p.id}, Name: ${p.name}, Slug: ${p.slug}`);
    });
    
    // Check for ID gaps or duplicates
    const allIds = await db.collection("products").find({}, { id: 1 }).sort({ id: 1 }).toArray();
    const idSet = new Set(allIds.map(p => p.id));
    const hasDuplicates = idSet.size !== allIds.length;
    
    if (hasDuplicates) {
      console.log("⚠️  Warning: Duplicate IDs detected!");
    } else {
      console.log("✅ No duplicate IDs found");
    }
    
    console.log("\n🎉 Migration completed successfully!\n");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    // Close connection
    if (client) {
      await client.close();
      console.log("📡 Database connection closed");
    }
  }
}

// Run migration
migrateProducts().catch(console.error);
