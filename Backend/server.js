import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import authRoutes from "./routes/auth.js";
import teamRoutes from "./routes/team.js";
import userRoutes from "./routes/user.js";
import stockRoutes from "./routes/stock.js";
import scanStockRoute from "./routes/scanStock.js";
import groceryRoutes from "./routes/groceryRoutes.js";
import techRoutes from "./routes/techRoutes.js";
import recipes from "./routes/recipes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import cronRoutes from "./routes/corn.js";

// Models
import NutritionLog from "./models/NutritionLog.js";
import VitalityScore from "./models/VitalityScore.js";

// Services
import { checkExpiringItems } from "./services/expiryChecker.js";
import { calculateVitalityScore } from "./services/vitalityCalculator.js";

dotenv.config();




const app = express();


app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));


let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  try {
    const db = await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@gruhmate.pzn4wqm.mongodb.net/GruhMate?retryWrites=true&w=majority`,
      {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    );
    
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    throw err;
  }
};


connectDB().catch(err => {
  console.error('Failed to connect to database on startup:', err);
});


app.get("/", (req, res) => {
  res.send("hii Mom")
});

app.get("/api/health", async (req, res) => {
  try {
    await connectDB();
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    res.json({
      status: 'ok',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      database: 'Disconnected',
      error: err.message
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/user", userRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api", scanStockRoute);
app.use("/", groceryRoutes);
app.use("/", techRoutes);
app.use("/api/recipes", recipes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/cron", cronRoutes);


app.get("/api/test/check-expiry", async (req, res) => {
  try {
    await connectDB();
    await checkExpiringItems();
    
    res.json({
      success: true,
      message: "✅ Expiry check completed",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ Expiry check failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/test/reset-notifications", async (req, res) => {
  try {
    await connectDB();
    const Stock = (await import("./models/Stock.js")).default;

    const result = await Stock.updateMany(
      {},
      {
        $set: {
          lastExpiryNotification: null,
          lastNotificationDate: null
        }
      }
    );

    res.json({
      success: true,
      message: `Reset ${result.modifiedCount} items`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/test/nutrition-logs/:teamId", async (req, res) => {
  try {
    await connectDB();
    const { teamId } = req.params;
    const logs = await NutritionLog.find({ teamId })
      .sort({ dateAdded: -1 })
      .limit(50);

    res.json({
      total: logs.length,
      logs: logs.map(log => ({
        itemName: log.itemName,
        category: log.category,
        calories: log.nutritionData.calories,
        isProcessed: log.isProcessed,
        dateAdded: log.dateAdded
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/test/reset-nutrition/:teamId", async (req, res) => {
  try {
    await connectDB();
    const { teamId } = req.params;

    const logsDeleted = await NutritionLog.deleteMany({ teamId });
    await VitalityScore.deleteOne({ teamId });

    res.json({
      success: true,
      message: "Nutrition data reset successfully",
      logsDeleted: logsDeleted.deletedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/test/recalculate/:teamId", async (req, res) => {
  try {
    await connectDB();
    const { teamId } = req.params;
    const result = await calculateVitalityScore(teamId);

    res.json({
      success: true,
      vitalityScore: result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.path}`
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  
  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
