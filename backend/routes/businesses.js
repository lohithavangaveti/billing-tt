import { Router } from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

// GET /api/businesses — returns businesses with their products (items)
router.get("/", (req, res) => {
  try {
    const businesses = db.prepare("SELECT * FROM businesses WHERE user_id = ? ORDER BY id").all(req.userId);

    // Attach items (products) to each business
    const getProducts = db.prepare("SELECT id, name, price FROM products WHERE business_id = ?");
    const result = businesses.map(b => ({
      ...b,
      items: getProducts.all(b.id)
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/businesses
router.post("/", (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: "Business name and category are required" });
    }

    const result = db.prepare("INSERT INTO businesses (name, category, user_id) VALUES (?, ?, ?)").run(name, category, req.userId);
    res.status(201).json({ id: result.lastInsertRowid, name, category, items: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/businesses/:id
router.put("/:id", (req, res) => {
  try {
    const { name, category } = req.body;
    db.prepare("UPDATE businesses SET name = ?, category = ? WHERE id = ? AND user_id = ?").run(name, category, req.params.id, req.userId);
    res.json({ id: Number(req.params.id), name, category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/businesses/:id
router.delete("/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM businesses WHERE id = ? AND user_id = ?").run(req.params.id, req.userId);
    res.json({ message: "Business deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- Products (items) within a business ---

// POST /api/businesses/:id/products
router.post("/:id/products", (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name) return res.status(400).json({ error: "Product name is required" });

    // Verify business belongs to user
    const biz = db.prepare("SELECT id FROM businesses WHERE id = ? AND user_id = ?").get(req.params.id, req.userId);
    if (!biz) return res.status(404).json({ error: "Business not found" });

    const result = db.prepare("INSERT INTO products (name, price, business_id) VALUES (?, ?, ?)").run(name, Number(price) || 0, req.params.id);
    res.status(201).json({ id: result.lastInsertRowid, name, price: Number(price) || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/businesses/:bizId/products/:productId
router.put("/:bizId/products/:productId", (req, res) => {
  try {
    const { name, price } = req.body;
    db.prepare("UPDATE products SET name = ?, price = ? WHERE id = ? AND business_id = ?").run(name, Number(price) || 0, req.params.productId, req.params.bizId);
    res.json({ id: Number(req.params.productId), name, price: Number(price) || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/businesses/:bizId/products/:productId
router.delete("/:bizId/products/:productId", (req, res) => {
  try {
    db.prepare("DELETE FROM products WHERE id = ? AND business_id = ?").run(req.params.productId, req.params.bizId);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
