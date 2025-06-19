import express from "express";
import { Product } from "../models/product.js";

const router = express.Router();

// All products
// All products with pagination
router.get("/products", async (req, res) => {
  try {
    const perPage = 10;
    const page = parseInt(req.query.page) || 1;

    const totalProducts = await Product.countDocuments();
    const products = await Product.find()
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.render("products", {
      title: "All Products",
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / perPage),
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
