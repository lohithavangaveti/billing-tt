import { Router } from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

// GET /api/bills
router.get("/", (req, res) => {
  try {
    const bills = db.prepare("SELECT * FROM bills WHERE user_id = ? ORDER BY id DESC").all(req.userId);

    // Attach cart items to each bill
    const getItems = db.prepare("SELECT id, name, price, qty FROM bill_items WHERE bill_id = ?");
    const result = bills.map(b => ({
      ...b,
      cart: getItems.all(b.id)
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/bills
router.post("/", (req, res) => {
  try {
    const { businessId, businessName, customerName, customerPhone, date, cart, total } = req.body;

    if (!businessId || !cart || cart.length === 0) {
      return res.status(400).json({ error: "Business and cart items are required" });
    }

    const insertBill = db.prepare(`
      INSERT INTO bills (business_id, business_name, customer_name, customer_phone, date, total, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = db.prepare("INSERT INTO bill_items (bill_id, name, price, qty) VALUES (?, ?, ?, ?)");

    // Also upsert products into the business
    const findProduct = db.prepare("SELECT id FROM products WHERE business_id = ? AND LOWER(name) = LOWER(?)");
    const updateProduct = db.prepare("UPDATE products SET price = ? WHERE id = ?");
    const insertProduct = db.prepare("INSERT INTO products (name, price, business_id) VALUES (?, ?, ?)");

    // Auto-sync customer
    const findCustomer = db.prepare("SELECT id FROM customers WHERE LOWER(name) = LOWER(?) AND phone = ? AND user_id = ?");
    const insertCustomer = db.prepare("INSERT INTO customers (name, phone, user_id) VALUES (?, ?, ?)");

    const saveBill = db.transaction(() => {
      const result = insertBill.run(businessId, businessName || "", customerName || "", customerPhone || "", date, total || 0, req.userId);
      const billId = result.lastInsertRowid;

      for (const item of cart) {
        insertItem.run(billId, item.name, Number(item.price), Number(item.qty) || 1);

        // Upsert product in business
        const existing = findProduct.get(businessId, item.name);
        if (existing) {
          updateProduct.run(Number(item.price), existing.id);
        } else {
          insertProduct.run(item.name, Number(item.price), businessId);
        }
      }

      // Auto-sync customer from bill
      if (customerName) {
        const existingCustomer = findCustomer.get(customerName, customerPhone || "", req.userId);
        if (!existingCustomer) {
          insertCustomer.run(customerName, customerPhone || "", req.userId);
        }
      }

      return billId;
    });

    const billId = saveBill();

    res.status(201).json({
      id: billId,
      businessId,
      businessName: businessName || "",
      customerName: customerName || "",
      customerPhone: customerPhone || "",
      date,
      cart,
      total: total || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/bills/:id
router.put("/:id", (req, res) => {
  try {
    const { businessId, businessName, customerName, customerPhone, date, cart, total } = req.body;
    const billId = req.params.id;

    const updateBill = db.prepare(`
      UPDATE bills SET business_id = ?, business_name = ?, customer_name = ?, customer_phone = ?, date = ?, total = ?
      WHERE id = ? AND user_id = ?
    `);

    const deleteItems = db.prepare("DELETE FROM bill_items WHERE bill_id = ?");
    const insertItem = db.prepare("INSERT INTO bill_items (bill_id, name, price, qty) VALUES (?, ?, ?, ?)");

    const findProduct = db.prepare("SELECT id FROM products WHERE business_id = ? AND LOWER(name) = LOWER(?)");
    const updateProduct = db.prepare("UPDATE products SET price = ? WHERE id = ?");
    const insertProduct = db.prepare("INSERT INTO products (name, price, business_id) VALUES (?, ?, ?)");

    const editBill = db.transaction(() => {
      updateBill.run(businessId, businessName || "", customerName || "", customerPhone || "", date, total || 0, billId, req.userId);
      deleteItems.run(billId);

      for (const item of cart) {
        insertItem.run(billId, item.name, Number(item.price), Number(item.qty) || 1);

        const existing = findProduct.get(businessId, item.name);
        if (existing) {
          updateProduct.run(Number(item.price), existing.id);
        } else {
          insertProduct.run(item.name, Number(item.price), businessId);
        }
      }
    });

    editBill();

    res.json({
      id: Number(billId),
      businessId,
      businessName: businessName || "",
      customerName: customerName || "",
      customerPhone: customerPhone || "",
      date,
      cart,
      total: total || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/bills/:id
router.delete("/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM bills WHERE id = ? AND user_id = ?").run(req.params.id, req.userId);
    res.json({ message: "Bill deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
