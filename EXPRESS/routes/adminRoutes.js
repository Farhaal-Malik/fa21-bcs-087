import express from "express";
import { Order } from "../models/order.js";
import { ensureLoggedIn } from "../middleware/auth.js"; // or define here

const router = express.Router();

// Admin only middleware
function ensureAdmin(req, res, next) {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.redirect("/login");
  }
  next();
}

// Admin dashboard
router.get("/admin/dashboard", ensureLoggedIn, ensureAdmin, async (req, res) => {
  const orders = await Order.find().populate("items.product").sort({ createdAt: -1 });
  res.render("admin-orders", { title: "Admin Dashboard", orders });
});

export default router;
