import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { Vehicle } from "../models/vehicle.js";

const router = express.Router();

function ensureLoggedIn(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

function ensureAdmin(req, res, next) {
  if (!req.session.user?.isAdmin) return res.redirect("/");
  next();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const vehicleImgPath = path.join(__dirname, "../public/images/vehicles");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, vehicleImgPath),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get("/admin/vehicles", ensureLoggedIn, ensureAdmin, async (_req, res) => {
  const vehicles = await Vehicle.find().sort({ name: 1 });
  res.render("admin-vehicles", { title: "Manage Vehicles", vehicles });
});

router.get("/admin/vehicles/add", ensureLoggedIn, ensureAdmin, (_req, res) => {
  res.render("admin-vehicle-form", { title: "Add Vehicle", vehicle: {} });
});

router.post(
  "/admin/vehicles/add",
  ensureLoggedIn,
  ensureAdmin,
  upload.single("image"),
  async (req, res) => {
    const { name, brand, price, type, imageUrl } = req.body;
    const img = req.file ? `/images/vehicles/${req.file.filename}` : imageUrl;
    await Vehicle.create({ name, brand, price, type, image: img });
    res.redirect("/admin/vehicles");
  }
);

router.get("/admin/vehicles/:id/edit", ensureLoggedIn, ensureAdmin, async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) return res.redirect("/admin/vehicles");
  res.render("admin-vehicle-form", { title: "Edit Vehicle", vehicle });
});

router.post(
  "/admin/vehicles/:id/edit",
  ensureLoggedIn,
  ensureAdmin,
  upload.single("image"),
  async (req, res) => {
    const { name, brand, price, type, imageUrl } = req.body;
    const update = { name, brand, price, type };

    if (req.file) {
      update.image = `/images/vehicles/${req.file.filename}`;
    } else if (imageUrl) {
      update.image = imageUrl;
    }

    await Vehicle.findByIdAndUpdate(req.params.id, update);
    res.redirect("/admin/vehicles");
  }
);

router.post("/admin/vehicles/:id/delete", ensureLoggedIn, ensureAdmin, async (req, res) => {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.redirect("/admin/vehicles");
});

router.get("/vehicles", async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ name: 1 });
    res.render("vehicles", { title: "All Vehicles", vehicles });
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    res.status(500).send("Server error");
  }
});


export default router;
