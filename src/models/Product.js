import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    // Preserve existing numeric ID for backward compatibility
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    
    // URL-friendly slug for SEO
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    
    // Basic product info
    name: {
      type: String,
      required: true,
      trim: true,
    },
    
    brand: {
      type: String,
      trim: true,
    },
    
    category: {
      type: String,
      required: true,
      trim: true,
    },
    
    subcategory: {
      type: String,
      trim: true,
    },
    
    // Pricing
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    
    discountPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    
    // Images
    image: {
      type: String,
      required: true,
    },
    
    images: {
      type: [String],
      default: [],
    },
    
    // Product details
    description: {
      type: String,
      required: true,
    },
    
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    
    // Inventory
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Legacy field - mapped to stock > 0
    inStock: {
      type: Boolean,
      default: true,
    },
    
    // Product options/variants
    options: {
      type: [
        {
          name: String,
          price: Number,
        }
      ],
      default: [],
    },
    
    // Ratings
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    
    // Feature flags
    featured: {
      type: Boolean,
      default: false,
    },
    
    bestSeller: {
      type: Boolean,
      default: false,
    },
    
    newArrival: {
      type: Boolean,
      default: false,
    },
    
    sale: {
      type: Boolean,
      default: false,
    },
    
    // Tags for filtering
    tags: {
      type: [String],
      default: [],
    },
    
    // Warranty info
    warranty: {
      type: String,
      trim: true,
    },
    
    // Delivery information
    deliveryInformation: {
      type: String,
      trim: true,
    },
    
    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
ProductSchema.index({ id: 1 }, { unique: true });
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ bestSeller: 1 });
ProductSchema.index({ newArrival: 1 });
ProductSchema.index({ sale: 1 });
ProductSchema.index({ inStock: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ name: "text", description: "text", category: "text" });

// Update timestamp before save
ProductSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for checking if product is in stock based on stock quantity
ProductSchema.virtual("isInStock").get(function () {
  return this.stock > 0;
});

// Ensure virtuals are included in JSON
ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

// Prevent model recompilation in development
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
