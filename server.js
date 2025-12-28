import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cron from "node-cron";

// Routes
import authRoutes from "./routes/auth.js";
import teamRoutes from "./routes/team.js";
import userRoutes from "./routes/user.js";
import stockRoutes from "./routes/stock.js";
import scanStockRoute from "./routes/scanStock.js";
import groceryRoutes from "./routes/groceryRoutes.js";
import techRoutes from "./routes/techRoutes.js";
import recipes from "./routes/recipes.js";
import nutritionRoutes from "./routes/nutrition.js";
import { checkExpiringItems } from "./services/expiryChecker.js";

// Utils
import { closeBrowser } from "./utils/browserUtils.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@gruhmate.pzn4wqm.mongodb.net/GruhMate?retryWrites=true&w=majority`
  )
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/user", userRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api", scanStockRoute);
app.use("/", groceryRoutes);
app.use("/", techRoutes);
app.use("/api/recipes", recipes);
app.use("/api/nutrition", nutritionRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "GruhMate API is running",
    status: "✅ Active",
    timestamp: new Date().toISOString()
  });
});

// ✅ TEST ENDPOINT - Manual trigger
app.get("/api/test/check-expiry", async (req, res) => {
  try {
    console.log("\n" + "=".repeat(50));
    console.log("🧪 MANUAL EXPIRY CHECK TRIGGERED");
    console.log("⏰", new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    console.log("=".repeat(50) + "\n");
    
    await checkExpiringItems();
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ TEST COMPLETED");
    console.log("=".repeat(50) + "\n");
    
    res.json({ 
      success: true, 
      message: "✅ Expiry check completed! Check console for notifications.",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ Test failed:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// ✅ PRODUCTION CRON: Every day at 9:00 AM IST
cron.schedule('0 9 * * *', async () => {
  console.log("\n" + "=".repeat(50));
  console.log("⏰ SCHEDULED CRON - Running at 9:00 AM IST");
  console.log("=".repeat(50) + "\n");
  await checkExpiringItems();
}, {
  timezone: "Asia/Kolkata"
});

// ✅ TESTING: Run on server start (COMMENT OUT IN PRODUCTION)
setTimeout(async () => {
  console.log("\n" + "=".repeat(50));
  console.log("🧪 AUTO-TEST - Running 5 seconds after startup");
  console.log("⏰", new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
  console.log("=".repeat(50) + "\n");
  
  await checkExpiringItems();
  
  console.log("\n" + "=".repeat(50));
  console.log("✅ AUTO-TEST COMPLETED");
  console.log("💡 TIP: Visit http://localhost:5000/api/test/check-expiry to test again");
  console.log("=".repeat(50) + "\n");
}, 5000);

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
  console.log("\n" + "=".repeat(50));
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"}`);
  console.log(`⏰ Cron scheduled: Daily at 9:00 AM IST`);
  console.log(`🧪 Test URL: http://localhost:${PORT}/api/test/check-expiry`);
  console.log("=".repeat(50) + "\n");
});
