import { Router } from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

// GET /api/customers
router.get("/", (req, res) => {
  try {
    const customers = db.prepare("SELECT * FROM customers WHERE user_id = ? ORDER BY id").all(req.userId);
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/customers
router.post("/", (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name) return res.status(400).json({ error: "Customer name is required" });

    const result = db.prepare("INSERT INTO customers (name, phone, user_id) VALUES (?, ?, ?)").run(name, phone || "", req.userId);
    res.status(201).json({ id: result.lastInsertRowid, name, phone: phone || "" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/customers/:id
router.put("/:id", (req, res) => {
  try {
    const { name, phone } = req.body;
    db.prepare("UPDATE customers SET name = ?, phone = ? WHERE id = ? AND user_id = ?").run(name, phone || "", req.params.id, req.userId);
    res.json({ id: Number(req.params.id), name, phone: phone || "" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/customers/:id
router.delete("/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM customers WHERE id = ? AND user_id = ?").run(req.params.id, req.userId);
    res.json({ message: "Customer deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
