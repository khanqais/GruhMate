import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";


import authRoutes from "./routes/auth.js";
import teamRoutes from "./routes/team.js";
import userRoutes from "./routes/user.js";
import stockRoutes from "./routes/stock.js";
import scanStockRoute from "./routes/scanStock.js";
import groceryRoutes from "./routes/groceryRoutes.js";
import techRoutes from "./routes/techRoutes.js";
import recipes from "./routes/recipes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";


import { checkExpiringItems } from "./services/expiryChecker.js";
import { calculateVitalityScore } from "./services/vitalityCalculator.js";
import { generateRecommendations } from "./services/recommendationEngine.js";
import { notifyTeam } from "./services/teamNotifier.js";


import { closeBrowser } from "./utils/browserUtils.js";


import Team from "./models/Team.js";
import NutritionLog from "./models/NutritionLog.js";
import VitalityScore from "./models/VitalityScore.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));


const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB Atlas...");
    
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@gruhmate.pzn4wqm.mongodb.net/GruhMate?retryWrites=true&w=majority`,
      {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      }
    );
    
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("\n💡 Troubleshooting:");
    console.error("   1. Check if IP is whitelisted in MongoDB Atlas");
    console.error("   2. Verify DB_USER and DB_PASSWORD in .env");
    console.error("   3. Ensure MongoDB cluster is running\n");
    process.exit(1);
  }
};

await connectDB();

mongoose.connection.on('connected', () => {
  console.log(' Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(' Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log(' Mongoose disconnected from MongoDB');
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


app.get("/", (req, res) => {
  res.send("hii mom")
});



app.get("/api/test/check-expiry", async (req, res) => {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("🧪 MANUAL EXPIRY CHECK");
    console.log("⏰", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
    console.log("=".repeat(60) + "\n");

    await checkExpiringItems();

    console.log("\n✅ Expiry check completed\n");

    res.json({
      success: true,
      message: "✅ Expiry check completed. Check console for details.",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ Expiry check failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


app.post("/api/test/reset-notifications", async (req, res) => {
  try {
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

    console.log(`✅ Reset ${result.modifiedCount} notification flags`);

    res.json({
      success: true,
      message: `Reset ${result.modifiedCount} items`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("❌ Reset failed:", err);
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/test/nutrition-logs/:teamId", async (req, res) => {
  try {
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
    const { teamId } = req.params;

    const logsDeleted = await NutritionLog.deleteMany({ teamId });
    await VitalityScore.deleteOne({ teamId });

    console.log(`🗑️ Deleted ${logsDeleted.deletedCount} nutrition logs for team ${teamId}`);

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
    const { teamId } = req.params;

    console.log(`\n🔄 Recalculating vitality for team: ${teamId}`);
    const result = await calculateVitalityScore(teamId);

    res.json({
      success: true,
      vitalityScore: result
    });
  } catch (err) {
    console.error("❌ Recalculation failed:", err);
    res.status(500).json({ error: err.message });
  }
});


cron.schedule("0 9 * * *", async () => {
  console.log("\n" + "=".repeat(60));
  console.log("⏰ DAILY EXPIRY CHECK - 9:00 AM IST");
  console.log("=".repeat(60) + "\n");

  try {
    await checkExpiringItems();
    console.log(" Daily expiry check completed\n");
  } catch (err) {
    console.error("❌ Daily expiry check failed:", err);
  }
}, {
  timezone: "Asia/Kolkata"
});

cron.schedule("0 10 * * 0", async () => {
  console.log("\n" + "=".repeat(60));
  console.log("📧 WEEKLY NUTRITION REPORTS - Sunday 10:00 AM IST");
  console.log("=".repeat(60) + "\n");

  try {
    const teams = await Team.find({});
    console.log(`📊 Processing ${teams.length} teams...\n`);

    for (const team of teams) {
      try {
        const vitalityScore = await calculateVitalityScore(team._id);
        const recommendations = await generateRecommendations(team._id);

        const categoryEmojis = {
          vegetables: '🥬', fruits: '🍎', grains: '🌾',
          protein: '🥚', dairy: '🥛', processed: '📦',
          snacks: '🍿', beverages: '🥤'
        };

        const report = `
🏥 WEEKLY NUTRITION REPORT

📊 Household Vitality Score: ${vitalityScore.currentScore}/100
📈 Trend: ${vitalityScore.trend.toUpperCase()}

🥗 Food Category Breakdown:
${Object.entries(vitalityScore.categoryDistribution)
  .filter(([_, value]) => value > 0)
  .map(([cat, value]) => `  ${categoryEmojis[cat] || '🍽️'} ${cat}: ${value}%`)
  .join('\n')}

${recommendations.recommendations?.length > 0 ? `
⚠️ TOP RECOMMENDATIONS:
${recommendations.recommendations.slice(0, 3).map((rec, i) => 
  `${i + 1}. ${rec.icon} ${rec.title}\n   ${rec.message}`
).join('\n\n')}
` : '✅ Great job! Your nutrition is well-balanced.'}

Keep tracking for better health! 💪
        `.trim();

        await notifyTeam(team._id, report);
        console.log(`✅ Report sent to: ${team.teamName}`);

      } catch (teamErr) {
        console.error(`❌ Failed for team ${team.teamName}:`, teamErr.message);
      }
    }

    console.log("\n✅ Weekly reports completed\n");

  } catch (err) {
    console.error("❌ Weekly report error:", err);
  }
}, {
  timezone: "Asia/Kolkata"
});

cron.schedule("0 23 * * *", async () => {
  console.log("\n" + "=".repeat(60));
  console.log("🔄 DAILY NUTRITION RECALCULATION - 11:00 PM IST");
  console.log("=".repeat(60) + "\n");

  try {
    const teams = await Team.find({});
    let successCount = 0;

    for (const team of teams) {
      try {
        await calculateVitalityScore(team._id);
        successCount++;
      } catch (err) {
        console.error(`❌ Failed for ${team.teamName}:`, err.message);
      }
    }

    console.log(`✅ Recalculated ${successCount}/${teams.length} teams\n`);

  } catch (err) {
    console.error("❌ Recalculation error:", err);
  }
}, {
  timezone: "Asia/Kolkata"
});


app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.path}`,
    availableRoutes: [
      "GET  /",
      "POST /api/auth/login",
      "POST /api/auth/signup",
      "GET  /api/stock/team/:teamId",
      "GET  /api/nutrition/vitality/:teamId",
      "GET  /api/test/check-expiry"
    ]
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");

  try {
    await closeBrowser();
    console.log("✅ Browser closed");

    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");

    console.log("✅ Shutdown completed. Exiting...\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, shutting down...");
  await mongoose.connection.close();
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 GruhMate Server Started");
  console.log("=".repeat(60));
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log(`✅ MongoDB: Connected`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  
  console.log(`\n📅 Scheduled Tasks:`);
  console.log(`   ⏰ Daily Expiry Check: 9:00 AM IST`);
  console.log(`   📧 Weekly Nutrition Report: Sunday 10:00 AM IST`);
  console.log(`   🔄 Daily Nutrition Recalc: 11:00 PM IST`);
  
  console.log(`\n🧪 Test Endpoints:`);
  console.log(`   GET    http://localhost:${PORT}/api/test/check-expiry`);
  console.log(`   POST   http://localhost:${PORT}/api/test/reset-notifications`);
  
  
  
});

export default app;
