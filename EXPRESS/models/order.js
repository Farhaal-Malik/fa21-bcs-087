import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userEmail: String,
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: Number,
    },
  ],
  deliveryAddress: {
    name: String,
    addressLine: String,
    city: String,
    postalCode: String,
    country: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Order = mongoose.model("Order", orderSchema);
