import express from "express";
import ejsLayouts from "express-ejs-layouts";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();
app.use(ejsLayouts);


// Session middleware
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
  })
);

// ✅ Share session data to views
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(ejsLayouts);
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.render("homepage", { title: "Homepage" });
});
app.use("/", productRoutes);
app.use("/", authRoutes); // Mount this AFTER productRoutes


// Database
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
