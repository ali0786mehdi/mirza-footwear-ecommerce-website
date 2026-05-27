import mongoose, { Document, Schema } from "mongoose";

// Each shoe size has its own stock count
export interface ISizeStock {
  size: number;   // e.g. 6, 7, 8, 9, 10, 11
  stock: number;  // how many pairs available in this size
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  discountPrice?: number;
  category: mongoose.Types.ObjectId;
  brand: string;
  images: string[];        // array of Cloudinary URLs
  sizes: ISizeStock[];
  color: string;
  material?: string;
  gender: "men" | "women" | "unisex" | "kids";
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  totalStock: number;      // auto-calculated from sizes
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const SizeStockSchema = new Schema<ISizeStock>(
  {
    size: {
      type: Number,
      required: true,
      min: [3, "Size cannot be less than 3"],
      max: [15, "Size cannot exceed 15"],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
  },
  { _id: false } // no separate _id for each size entry
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [120, "Product name cannot exceed 120 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
      validate: {
        validator: function (this: IProduct, val: number) {
          return val < this.price; // discount must be less than original price
        },
        message: "Discount price must be less than original price",
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    brand: {
      type: String,
      required: true,
      trim: true,
      default: "Mirza Footwear",
    },
    images: {
      type: [String],
      required: [true, "At least one image is required"],
      validate: {
        validator: (arr: string[]) => arr.length >= 1,
        message: "Product must have at least one image",
      },
    },
    sizes: {
      type: [SizeStockSchema],
      required: [true, "Size and stock info is required"],
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      trim: true,
    },
    material: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["men", "women", "unisex", "kids"],
      required: [true, "Gender category is required"],
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    totalStock: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Auto-calculate totalStock before every save ──────────────────
// So you never have to calculate it manually in services
ProductSchema.pre("save", function () {
  this.totalStock = this.sizes.reduce((sum, s) => sum + s.stock, 0);
});

// ─── Index for fast search and filter queries ─────────────────────
ProductSchema.index({ name: "text", description: "text", tags: "text" });
ProductSchema.index({ category: 1, gender: 1, isActive: 1 });
ProductSchema.index({ price: 1 });

export default mongoose.model<IProduct>("Product", ProductSchema);