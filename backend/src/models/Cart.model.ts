import mongoose, { Document, Schema } from "mongoose";

export interface ICartItem {
  _id?: mongoose.Types.ObjectId; // subdocument id for cart item
  product: mongoose.Types.ObjectId;
  size: number;
  quantity: number;
  price: number;        // price at time of adding (snapshot)
  name: string;         // product name snapshot
  image: string;        // first image snapshot
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    size: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
  },
  { _id: true }
);

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one cart per user
    },
    items: [CartItemSchema],
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Auto-calculate totalAmount before every save ─────────────────
CartSchema.pre("save", function () {
  this.totalAmount = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
});

export default mongoose.model<ICart>("Cart", CartSchema);