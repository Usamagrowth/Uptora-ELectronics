import { ObjectId } from "mongodb";
import { getDb } from "../mongodb.js";

const COLLECTION = "products";

/**
 * Format product document for API response
 * Converts MongoDB _id to string id and ensures consistent structure
 */
function formatProduct(doc) {
  if (!doc) return null;
  return {
    id: doc.id,
    _id: doc._id?.toString(),
    slug: doc.slug,
    name: doc.name,
    brand: doc.brand,
    category: doc.category,
    subcategory: doc.subcategory,
    price: doc.price,
    discountPrice: doc.discountPrice,
    image: doc.image,
    images: doc.images || [doc.image],
    description: doc.description,
    specifications: doc.specifications || {},
    stock: doc.stock,
    inStock: doc.inStock !== undefined ? doc.inStock : (doc.stock > 0),
    options: doc.options || [],
    rating: doc.rating || 0,
    featured: doc.featured || false,
    bestSeller: doc.bestSeller || false,
    newArrival: doc.newArrival || false,
    sale: doc.sale || false,
    tags: doc.tags || [],
    warranty: doc.warranty,
    deliveryInformation: doc.deliveryInformation,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Create a new product
 */
export async function createProduct(productData) {
  const db = await getDb();
  
  // Get the next highest ID
  const lastProduct = await db.collection(COLLECTION).find({}, { id: 1 }).sort({ id: -1 }).limit(1).toArray();
  const nextId = lastProduct.length > 0 ? lastProduct[0].id + 1 : 1;
  
  const doc = {
    id: nextId,
    slug: productData.slug,
    name: productData.name,
    brand: productData.brand || null,
    category: productData.category,
    subcategory: productData.subcategory || null,
    price: Number(productData.price),
    discountPrice: productData.discountPrice ? Number(productData.discountPrice) : null,
    image: productData.image,
    images: productData.images || [productData.image],
    description: productData.description,
    specifications: productData.specifications || {},
    stock: productData.stock || 0,
    inStock: productData.inStock !== undefined ? productData.inStock : true,
    options: productData.options || [],
    rating: productData.rating || 0,
    featured: productData.featured || false,
    bestSeller: productData.bestSeller || false,
    newArrival: productData.newArrival || false,
    sale: productData.sale || false,
    tags: productData.tags || [],
    warranty: productData.warranty || null,
    deliveryInformation: productData.deliveryInformation || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const result = await db.collection(COLLECTION).insertOne(doc);
  return formatProduct({ _id: result.insertedId, ...doc });
}

/**
 * Get product by numeric ID
 */
export async function getProductById(id) {
  const db = await getDb();
  const doc = await db.collection(COLLECTION).findOne({ id: Number(id) });
  return formatProduct(doc);
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug) {
  const db = await getDb();
  const doc = await db.collection(COLLECTION).findOne({ slug });
  return formatProduct(doc);
}

/**
 * Get product by MongoDB _id
 */
export async function getProductByMongoId(_id) {
  const db = await getDb();
  const doc = await db.collection(COLLECTION).findOne({ _id: new ObjectId(_id) });
  return formatProduct(doc);
}

/**
 * Get all products with optional filters and pagination
 */
export async function getAllProducts(filters = {}, options = {}) {
  const db = await getDb();
  
  const {
    category,
    brand,
    featured,
    bestSeller,
    newArrival,
    sale,
    inStock,
    minPrice,
    maxPrice,
    search,
  } = filters;
  
  const {
    limit = 200, // Increased limit to show all products
    skip = 0,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;
  
  // Build query
  const query = {};
  
  if (category) query.category = category;
  if (brand) query.brand = brand;
  if (featured !== undefined) query.featured = featured;
  if (bestSeller !== undefined) query.bestSeller = bestSeller;
  if (newArrival !== undefined) query.newArrival = newArrival;
  if (sale !== undefined) query.sale = sale;
  if (inStock !== undefined) query.inStock = inStock;
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }
  
  // Text search
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }
  
  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  
  const docs = await db
    .collection(COLLECTION)
    .find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .toArray();
  
  const total = await db.collection(COLLECTION).countDocuments(query);
  
  return {
    products: docs.map(formatProduct),
    total,
    limit,
    skip,
    hasMore: skip + docs.length < total,
  };
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit = 8) {
  const db = await getDb();
  const docs = await db
    .collection(COLLECTION)
    .find({ featured: true, inStock: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(formatProduct);
}

/**
 * Get best seller products
 */
export async function getBestSellerProducts(limit = 8) {
  const db = await getDb();
  const docs = await db
    .collection(COLLECTION)
    .find({ bestSeller: true, inStock: true })
    .sort({ price: -1 })
    .limit(limit)
    .toArray();
  return docs.map(formatProduct);
}

/**
 * Get new arrival products
 */
export async function getNewArrivalProducts(limit = 8) {
  const db = await getDb();
  const docs = await db
    .collection(COLLECTION)
    .find({ newArrival: true, inStock: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(formatProduct);
}

/**
 * Get sale products
 */
export async function getSaleProducts(limit = 8) {
  const db = await getDb();
  const docs = await db
    .collection(COLLECTION)
    .find({ sale: true, inStock: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(formatProduct);
}

/**
 * Search products
 */
export async function searchProducts(query, limit = 20) {
  const db = await getDb();
  const docs = await db
    .collection(COLLECTION)
    .find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
      ],
    })
    .limit(limit)
    .toArray();
  return docs.map(formatProduct);
}

/**
 * Get products by filters
 */
export async function getProductsByFilters(filters = {}, limit = 20, sort = "relevance") {
  const db = await getDb();
  
  const { category, minPrice, maxPrice, brand } = filters;
  
  // Build query
  const query = {};
  
  if (category) query.category = category;
  if (brand) query.brand = brand;
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }
  
  // Build sort
  let sortOption = {};
  switch (sort) {
    case "price-asc":
      sortOption = { price: 1 };
      break;
    case "price-desc":
      sortOption = { price: -1 };
      break;
    case "newest":
      sortOption = { createdAt: -1 };
      break;
    case "relevance":
    default:
      sortOption = { createdAt: -1 };
  }
  
  const docs = await db
    .collection(COLLECTION)
    .find(query)
    .sort(sortOption)
    .limit(limit)
    .toArray();
  
  return docs.map(formatProduct);
}

/**
 * Get related products (same category, excluding current product)
 */
export async function getRelatedProducts(productId, category, limit = 4) {
  const db = await getDb();
  const docs = await db
    .collection(COLLECTION)
    .find({
      category,
      id: { $ne: Number(productId) },
      inStock: true,
    })
    .limit(limit)
    .toArray();
  return docs.map(formatProduct);
}

/**
 * Get all categories
 */
export async function getCategories() {
  const db = await getDb();
  const categories = await db.collection(COLLECTION).distinct("category");
  return ["All", ...categories.sort()];
}

/**
 * Get all brands
 */
export async function getBrands() {
  const db = await getDb();
  const brands = await db.collection(COLLECTION).distinct("brand");
  return brands.filter(Boolean).sort();
}

/**
 * Update product by ID
 */
export async function updateProduct(id, updateData) {
  const db = await getDb();
  
  const updates = {
    ...updateData,
    updatedAt: new Date(),
  };
  
  // Remove _id from updates if present
  delete updates._id;
  delete updates.id;
  
  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { id: Number(id) },
    { $set: updates },
    { returnDocument: "after" }
  );
  
  return formatProduct(result);
}

/**
 * Update product by MongoDB _id
 */
export async function updateProductByMongoId(_id, updateData) {
  const db = await getDb();
  
  const updates = {
    ...updateData,
    updatedAt: new Date(),
  };
  
  // Remove _id from updates if present
  delete updates._id;
  
  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(_id) },
    { $set: updates },
    { returnDocument: "after" }
  );
  
  return formatProduct(result);
}

/**
 * Delete product by ID
 */
export async function deleteProduct(id) {
  const db = await getDb();
  const result = await db.collection(COLLECTION).deleteOne({ id: Number(id) });
  return result.deletedCount > 0;
}

/**
 * Delete product by MongoDB _id
 */
export async function deleteProductByMongoId(_id) {
  const db = await getDb();
  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(_id) });
  return result.deletedCount > 0;
}

/**
 * Get product count
 */
export async function getProductCount(filters = {}) {
  const db = await getDb();
  return await db.collection(COLLECTION).countDocuments(filters);
}

/**
 * Bulk update products
 */
export async function bulkUpdateProducts(updates) {
  const db = await getDb();
  const bulkOps = updates.map(({ id, ...data }) => ({
    updateOne: {
      filter: { id: Number(id) },
      update: { $set: { ...data, updatedAt: new Date() } },
    },
  }));
  
  const result = await db.collection(COLLECTION).bulkWrite(bulkOps);
  return result;
}
