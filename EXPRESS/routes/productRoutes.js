import express from "express";
import { Product } from "../models/product.js";

const router = express.Router();

// All products
router.get("/products", async (req, res) => {
  try {
    const allProducts = await Product.find();
    res.render("products", {
      title: "All Products",
      products: allProducts,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Server error");
  }
});

// ✅ Product detail route
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");

    res.render("product-detail", {
      title: product.name,
      product: product,
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).send("Server error");
  }
});

export default router;
