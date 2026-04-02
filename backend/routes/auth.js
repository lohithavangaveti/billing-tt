import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";
import { JWT_SECRET } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/register
router.post("/register", (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user exists
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(409).json({ error: "User already exists. Please login." });
    }

    // Hash password and insert
    const hashed = bcrypt.hashSync(password, 10);
    const result = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(name, email, hashed);

    // Seed default categories for new user
    const insertCat = db.prepare("INSERT INTO categories (name, user_id) VALUES (?, ?)");
    const seedCategories = db.transaction((userId) => {
      insertCat.run("Supermarket", userId);
      insertCat.run("Hardware Store", userId);
      insertCat.run("Medical Store", userId);
    });
    seedCategories(result.lastInsertRowid);

    const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "Registered successfully",
      token,
      user: { id: result.lastInsertRowid, name, email }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      return res.status(401).json({ error: "User not found. Please register." });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
