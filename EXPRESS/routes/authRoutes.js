import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.js";


const router = express.Router();

// GET: Signup form
router.get("/signup", (req, res) => {
  res.render("signup", { title: "Create Account" });
});

// POST: Handle signup
router.post("/signup", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.send("❌ Passwords do not match.");
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send("❌ User already exists. Try logging in.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.send("✅ User registered successfully!");
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("❌ Something went wrong.");
  }
});

// GET: Login form
router.get("/login", (req, res) => {
  res.render("login", { title: "Login", error: null });
});


// POST: Login logic placeholder
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("login", { title: "Login", error: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("login", { title: "Login", error: "Invalid Credentials" });
    }

    // ✅ Save session and redirect
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    res.redirect("/"); // ✅ redirect to homepage
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).render("login", { title: "Login", error: "❌ Something went wrong. Try again." });
  }
});

export default router;
