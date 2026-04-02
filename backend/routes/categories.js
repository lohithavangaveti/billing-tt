import { Router } from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

// GET /api/categories
router.get("/", (req, res) => {
  try {
    const cats = db.prepare("SELECT * FROM categories WHERE user_id = ? ORDER BY id").all(req.userId);
    res.json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/categories
router.post("/", (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Category name is required" });

    const existing = db.prepare("SELECT id FROM categories WHERE name = ? AND user_id = ?").get(name, req.userId);
    if (existing) return res.status(409).json({ error: "Category already exists" });

    const result = db.prepare("INSERT INTO categories (name, user_id) VALUES (?, ?)").run(name, req.userId);
    res.status(201).json({ id: result.lastInsertRowid, name, user_id: req.userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/categories/:id
router.delete("/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM categories WHERE id = ? AND user_id = ?").run(req.params.id, req.userId);
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
