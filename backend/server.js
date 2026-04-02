import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import DB (this initializes tables)
import "./db.js";

// Import routes
import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import businessRoutes from "./routes/businesses.js";
import customerRoutes from "./routes/customers.js";
import billRoutes from "./routes/bills.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/bills", billRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "SmartBiz Backend is running",
    time: new Date().toISOString()
  });
});

// Serve frontend in production
const distPath = path.join(__dirname, "..", "frontend-app", "dist");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`SmartBiz Backend running on http://localhost:${PORT}`);
});
