import express from "express";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "../models/user.js";

const router = express.Router();

// ✅ Path setup for absolute multer path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imageUploadPath = path.join(__dirname, "../public/images");

// ✅ Middleware to protect routes
function ensureLoggedIn(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// ✅ Multer config to save image in /public/images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imageUploadPath);
  },
  filename: function (req, file, cb) {
    const email = req.session.user.email.replace(/[^a-zA-Z0-9]/g, "_");
    const ext = path.extname(file.originalname);
    cb(null, `${email}${ext}`);
  }
});
const upload = multer({ storage });

// GET: Signup page
router.get("/signup", (req, res) => {
  res.render("signup", { title: "Create Account", error: null });
});

// POST: Signup logic
router.post("/signup", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render("signup", {
      title: "Create Account",
      error: "❌ Passwords do not match.",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("signup", {
        title: "Create Account",
        error: "❌ User already exists. Try logging in.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    res.redirect("/");
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).render("signup", {
      title: "Create Account",
      error: "❌ Something went wrong. Try again.",
    });
  }
});

// GET: Login page
router.get("/login", (req, res) => {
  res.render("login", { title: "Login", error: null });
});

// POST: Login logic
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render("login", {
        title: "Login",
        error: "❌ Invalid credentials.",
      });
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    res.redirect("/");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).render("login", {
      title: "Login",
      error: "❌ Something went wrong. Try again.",
    });
  }
});

// ✅ Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// ✅ GET: Profile page
router.get("/profile", ensureLoggedIn, async (req, res) => {
  const user = await User.findById(req.session.user.id);
  res.render("profile", { title: "My Profile", user });
});

// ✅ POST: Update profile with image upload
router.post("/profile", ensureLoggedIn, upload.single("avatar"), async (req, res) => {
  const { name, address } = req.body;
  const update = { name, address };

  if (req.file) {
    update.profileImage = `/images/${req.file.filename}`;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.session.user.id,
    update,
    { new: true }
  );

  req.session.user.name = updatedUser.name;
  res.redirect("/profile");
});

export default router;
