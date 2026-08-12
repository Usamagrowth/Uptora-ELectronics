import { getDb } from "../mongodb.js";

const COLLECTION = "categories";

/**
 * Format category document for API response
 */
function formatCategory(doc) {
  if (!doc) return null;
  return {
    id: doc._id?.toString(),
    name: doc.name,
    slug: doc.slug,
    displayOrder: doc.displayOrder,
    image: doc.image,
  };
}

/**
 * Get all categories sorted by display order
 */
export async function getAllCategories() {
  const db = await getDb();
  const docs = await db
    .collection(COLLECTION)
    .find({})
    .sort({ displayOrder: 1 })
    .toArray();
  
  return docs.map(formatCategory);
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug) {
  const db = await getDb();
  const doc = await db.collection(COLLECTION).findOne({ slug });
  return formatCategory(doc);
}

/**
 * Get category by MongoDB _id
 */
export async function getCategoryById(id) {
  const db = await getDb();
  const doc = await db.collection(COLLECTION).findOne({ _id: id });
  return formatCategory(doc);
}

/**
 * Create a new category
 */
export async function createCategory(categoryData) {
  const db = await getDb();
  
  const doc = {
    name: categoryData.name,
    slug: categoryData.slug,
    displayOrder: categoryData.displayOrder || 0,
    image: categoryData.image || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const result = await db.collection(COLLECTION).insertOne(doc);
  return formatCategory({ _id: result.insertedId, ...doc });
}

/**
 * Update a category
 */
export async function updateCategory(id, updateData) {
  const db = await getDb();
  
  const updateDoc = {
    ...updateData,
    updatedAt: new Date(),
  };
  
  const result = await db.collection(COLLECTION).updateOne(
    { _id: id },
    { $set: updateDoc }
  );
  
  if (result.matchedCount === 0) return null;
  
  return getCategoryById(id);
}

/**
 * Delete a category
 */
export async function deleteCategory(id) {
  const db = await getDb();
  const result = await db.collection(COLLECTION).deleteOne({ _id: id });
  return result.deletedCount > 0;
}
