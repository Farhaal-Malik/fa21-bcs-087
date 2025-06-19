import express from "express";
import { Order } from "../models/order.js";
import { User  } from "../models/user.js";
import { ensureLoggedIn } from "../middleware/auth.js";

const router = express.Router();

/* ───────── Admin guard ───────── */
function ensureAdmin(req, res, next) {
  if (!req.session.user?.isAdmin) return res.redirect("/login");
  next();
}

/* 1. Dashboard (all orders) */
router.get("/admin/dashboard", ensureLoggedIn, ensureAdmin, async (_req, res) => {
  const orders = await Order.find()
    .populate("items.product")
    .sort({ createdAt: -1 });

  // Remove items with null product references
  orders.forEach(order => {
    order.items = order.items.filter(i => i.product);
  });

  res.render("admin-orders", { title: "Admin Dashboard", orders });
});


/* 1a. Update order status */
router.post("/admin/orders/:id/status", ensureLoggedIn, ensureAdmin, async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.redirect("/admin/dashboard");
});

/* 2. List users */
router.get("/admin/users", ensureLoggedIn, ensureAdmin, async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.render("admin-users", { title: "Manage Users", users });
});

/* 3. ⬅️  USER-SPECIFIC ORDERS  (must be above :id/edit!) */
router.get("/admin/users/:id/orders", ensureLoggedIn, ensureAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.redirect("/admin/users");

  const orders = await Order.find({ userEmail: user.email })
    .populate("items.product")
    .sort({ createdAt: -1 });

  // Filter out missing product references
  orders.forEach(order => {
    order.items = order.items.filter(i => i.product);
  });

  res.render("admin-user-orders", { title: `Orders – ${user.name}`, orders });
});


/* 4. Role-edit form */
router.get("/admin/users/:id/edit", ensureLoggedIn, ensureAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.redirect("/admin/users");
  res.render("admin-user-form", { title: "Edit User Role", user });
});

/* 4a. Role-edit handler (toggle isAdmin only) */
router.post("/admin/users/:id/edit", ensureLoggedIn, ensureAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isAdmin: req.body.isAdmin === "on" });
  res.redirect("/admin/users");
});

/* 5. Delete user */
router.post("/admin/users/:id/delete", ensureLoggedIn, ensureAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/admin/users");
});

export default router;
