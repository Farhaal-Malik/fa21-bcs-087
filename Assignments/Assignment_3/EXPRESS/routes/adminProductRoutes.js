import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { Product } from "../models/product.js";

const router = express.Router();

/* ───────── helpers ───────── */
function ensureLoggedIn(req, _res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}
function ensureAdmin(req, res, next) {
  if (!req.session.user?.isAdmin) return res.redirect("/");
  next();
}

/* ───────── Multer config ───────── */
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const productImgPath = path.join(__dirname, "../public/images/products");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, productImgPath),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/* ───────── LIST products ───────── */
router.get("/admin/products", ensureLoggedIn, ensureAdmin, async (_req, res) => {
  const products = await Product.find().sort({ name: 1 });
  res.render("admin-products", { title: "Manage Products", products });
});

/* ───────── ADD form ───────── */
router.get("/admin/products/add", ensureLoggedIn, ensureAdmin, (_req, res) => {
  res.render("admin-product-form", { title: "Add Product", product: {} });
});

/* ───────── ADD handler ───────── */
router.post(
  "/admin/products/add",
  ensureLoggedIn,
  ensureAdmin,
  upload.single("image"),
  async (req, res) => {
    const { name, price, description, imageUrl } = req.body;
    const img = req.file ? `/images/products/${req.file.filename}` : imageUrl;
    await Product.create({ name, price, description, image: img });
    res.redirect("/admin/products");
  }
);

/* ───────── EDIT form ───────── */
router.get(
  "/admin/products/:id/edit",
  ensureLoggedIn,
  ensureAdmin,
  async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.redirect("/admin/products");
    res.render("admin-product-form", { title: "Edit Product", product });
  }
);

/* ───────── EDIT handler ───────── */
router.post(
  "/admin/products/:id/edit",
  ensureLoggedIn,
  ensureAdmin,
  upload.single("image"),
  async (req, res) => {
    const { name, price, description, imageUrl } = req.body;
    const update = { name, price, description };
    if (req.file) update.image = `/images/products/${req.file.filename}`;
    else if (imageUrl) update.image = imageUrl;
    await Product.findByIdAndUpdate(req.params.id, update);
    res.redirect("/admin/products");
  }
);

/* ───────── DELETE handler ───────── */
router.post(
  "/admin/products/:id/delete",
  ensureLoggedIn,
  ensureAdmin,
  async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin/products");
  }
);

export default router;
