import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["Sedan", "SUV", "Truck", "Van", "Coupe", "Hatchback", "Convertible"],
    required: true,
  },
  image: {
    type: String, // File path for uploaded image
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export const Vehicle = mongoose.model("Vehicle", vehicleSchema);
