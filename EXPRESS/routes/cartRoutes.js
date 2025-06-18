import express from "express";
import { Product } from "../models/product.js";
import { Order } from "../models/order.js";

const router = express.Router();

// ✅ Middleware to require login
function ensureLoggedIn(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// 1) Add to cart
router.post("/add-to-cart", (req, res) => {
  const { productId } = req.body;
  const cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : {};
  cart[productId] = (cart[productId] || 0) + 1;
  res.cookie("cart", JSON.stringify(cart), { httpOnly: true });
  res.status(200).json({ message: "Product added to cart" });
});

// 2) View cart
router.get("/cart", async (req, res) => {
  const cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : {};
  const ids = Object.keys(cart);
  const products = await Product.find({ _id: { $in: ids } });

  const cartItems = products.map(p => ({
    product: p,
    quantity: cart[p._id]
  }));

  res.render("cart", { title: "Your Cart", cartItems });
});

// ✅ 3) Update quantity or remove via AJAX
router.post("/cart/update", (req, res) => {
  const { quantities, remove } = req.body;
  let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : {};

  if (remove) {
    delete cart[remove];
  } else if (quantities) {
    for (const id in quantities) {
      const qty = parseInt(quantities[id]);
      if (!isNaN(qty)) {
        if (qty <= 0) delete cart[id];
        else cart[id] = qty;
      }
    }
  }

  res.cookie("cart", JSON.stringify(cart), { httpOnly: true });
  res.status(200).json({ message: "Cart updated" });
});

// ✅ 4) Checkout form (protected)
router.get("/checkout", ensureLoggedIn, async (req, res) => {
  const cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : {};
  const ids = Object.keys(cart);
  const products = await Product.find({ _id: { $in: ids } });

  const cartItems = products.map(p => ({
    product: p,
    quantity: cart[p._id]
  }));

  res.render("checkout", { title: "Checkout", cartItems });
});

// ✅ 5) Place order (protected)
router.post("/checkout", ensureLoggedIn, async (req, res) => {
  const cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : {};
  const ids = Object.keys(cart);
  if (!ids.length) return res.redirect("/cart");

  const items = ids.map(id => ({
    product: id,
    quantity: cart[id],
  }));

  const order = new Order({
    userEmail: req.session.user.email,
    items,
    deliveryAddress: {
      name: req.body.name,
      addressLine: req.body.addressLine,
      city: req.body.city,
      postalCode: req.body.postalCode,
      country: req.body.country,
    },
  });

  await order.save();
  res.clearCookie("cart");
  res.render("checkout-success", { title: "Order Placed" });
});

export default router;

// ✅ 6) View user's past orders
router.get("/my-orders", ensureLoggedIn, async (req, res) => {
  try {
    const orders = await Order.find({ userEmail: req.session.user.email })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.render("my-orders", {
      title: "My Orders",
      orders,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).send("❌ Could not load orders.");
  }
});
