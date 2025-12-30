import express from "express";
import { checkExpiringItems } from "../services/expiryChecker.js";

const router = express.Router();

// Secret key for security
const CRON_SECRET = process.env.CRON_SECRET || "gruhmate-secret-2025";

router.get("/daily-expiry", async (req, res) => {
  try {
    
    const authHeader = req.headers.authorization;
    
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      console.log(" Unauthorized cron attempt");
      return res.status(403).json({ 
        error: "Unauthorized",
        message: "Invalid or missing authorization token"
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log("⏰ DAILY EXPIRY CHECK - Triggered by Cron");
    console.log("🕐 Time:", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
    console.log("=".repeat(60) + "\n");

    // Run the expiry check
    await checkExpiringItems();

    console.log("\n✅ Daily expiry check completed successfully\n");

    res.json({
      success: true,
      message: "Daily expiry check completed",
      timestamp: new Date().toISOString(),
      triggeredBy: "cron-job.org"
    });

  } catch (err) {
    console.error("❌ Daily expiry check failed:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

export default router;
