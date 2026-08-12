import { getDb } from "../mongodb";

let indexesReady = false;

export async function ensureDbIndexes() {
  if (indexesReady) return;

  const db = await getDb();

  // Orders indexes
  await db.collection("orders").createIndexes([
    { key: { paymentReference: 1 }, unique: true, name: "paymentReference_unique" },
    { key: { userId: 1, createdAt: -1 }, name: "userId_createdAt" },
    { key: { customerEmail: 1, createdAt: -1 }, name: "customerEmail_createdAt" },
  ]);

  // Products indexes
  await db.collection("products").createIndexes([
    { key: { id: 1 }, unique: true, name: "id_unique" },
    { key: { slug: 1 }, unique: true, name: "slug_unique" },
    { key: { category: 1 }, name: "category" },
    { key: { brand: 1 }, name: "brand" },
    { key: { featured: 1 }, name: "featured" },
    { key: { bestSeller: 1 }, name: "bestSeller" },
    { key: { newArrival: 1 }, name: "newArrival" },
    { key: { sale: 1 }, name: "sale" },
    { key: { inStock: 1 }, name: "inStock" },
    { key: { price: 1 }, name: "price" },
    { key: { createdAt: -1 }, name: "createdAt" },
    { key: { name: "text", description: "text", category: "text" }, name: "text_search" },
  ]);

  indexesReady = true;
}
