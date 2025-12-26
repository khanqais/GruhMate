import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

// Routes
import authRoutes from "./routes/auth.js";
import teamRoutes from "./routes/team.js";
import userRoutes from "./routes/user.js";
import stockRoutes from "./routes/stock.js";
import scanStockRoute from "./routes/scanStock.js";
import groceryRoutes from "./routes/groceryRoutes.js";
import techRoutes from "./routes/techRoutes.js";

// Utils
import { closeBrowser } from "./utils/browserUtils.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// ✅ FIXED: MongoDB Connection (removed deprecated options)
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@gruhmate.pzn4wqm.mongodb.net/GruhMate?retryWrites=true&w=majority`
  )
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// API Routes
app.use("/api/auth", authRoutes);       // Authentication routes
app.use("/api/team", teamRoutes);       // Team management routes
app.use("/api/user", userRoutes);       // User data routes
app.use("/api/stock", stockRoutes);     // Stock management routes
app.use("/api", scanStockRoute);        // Image scanning routes
app.use("/", groceryRoutes);            // Grocery price comparison routes
app.use("/", techRoutes);               // Tech price comparison routes

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "GruhMate API is running",
    status: "✅ Active",
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await closeBrowser();
  await mongoose.connection.close();
  console.log("✅ Cleanup completed. Exiting...");
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"}`);
});
