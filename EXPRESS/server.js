import express from "express";
import ejsLayouts from "express-ejs-layouts";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

const app = express();

// Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(ejsLayouts);

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // ✅ Required for parsing JSON bodies from fetch()
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
  })
);

// Pass session user to views
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Routes
app.get("/", (req, res) => {
  res.render("homepage", { title: "Homepage" });
});
app.use("/", authRoutes);
app.use("/", productRoutes);
app.use("/", cartRoutes);

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/Mulberry", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB (Mulberry)");
    app.listen(4000, () => {
      console.log("🚀 Server started at http://localhost:4000");
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
