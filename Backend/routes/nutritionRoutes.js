import express from "express";
import Stock from "../models/Stock.js";
import NutritionLog from "../models/NutritionLog.js";
import VitalityScore from "../models/VitalityScore.js";
import { getNutritionData } from "../services/nutritionAPI.js";
import { calculateVitalityScore } from "../services/vitalityCalculator.js";
import { generateRecommendations } from "../services/recommendationEngine.js";
import { notifyTeam } from "../services/teamNotifier.js";

const router = express.Router();

/**
 * 📊 GET Vitality Score for a team
 */
router.get("/vitality/:teamId", async (req, res) => {
  try {
    const { teamId } = req.params;
    
    let vitalityScore = await VitalityScore.findOne({ teamId });
    
    if (!vitalityScore) {
      // Calculate for the first time
      vitalityScore = await calculateVitalityScore(teamId);
    }
    
    res.json(vitalityScore);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🔄 POST Recalculate Vitality Score
 */
router.post("/vitality/:teamId/calculate", async (req, res) => {
  try {
    const { teamId } = req.params;
    const vitalityScore = await calculateVitalityScore(teamId);
    res.json(vitalityScore);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 💡 GET Smart Recommendations
 */
router.get("/recommendations/:teamId", async (req, res) => {
  try {
    const { teamId } = req.params;
    const recommendations = await generateRecommendations(teamId);
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📈 GET Nutrition Analytics (last 30 days)
 */
router.get("/analytics/:teamId", async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const logs = await NutritionLog.find({
      teamId,
      dateAdded: { $gte: thirtyDaysAgo }
    }).sort({ dateAdded: -1 });
    
    // Calculate totals
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };
    
    logs.forEach(log => {
      totals.calories += log.nutritionData.calories || 0;
      totals.protein += log.nutritionData.protein || 0;
      totals.carbs += log.nutritionData.carbs || 0;
      totals.fat += log.nutritionData.fat || 0;
      totals.fiber += log.nutritionData.fiber || 0;
    });
    
    res.json({
      totalItems: logs.length,
      totals,
      logs: logs.slice(0, 20) // Last 20 items
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🔍 POST Analyze nutrition for a specific item
 */
router.post("/analyze", async (req, res) => {
  try {
    const { itemName } = req.body;
    
    if (!itemName) {
      return res.status(400).json({ error: "Item name required" });
    }
    
    const nutritionData = await getNutritionData(itemName);
    
    if (!nutritionData) {
      return res.status(404).json({ 
        error: "Nutrition data not found",
        message: "Try adding brand name for better results"
      });
    }
    
    res.json(nutritionData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📧 POST Send weekly nutrition report
 */
router.post("/report/:teamId/send", async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const vitalityScore = await VitalityScore.findOne({ teamId });
    const recommendations = await generateRecommendations(teamId);
    
    if (!vitalityScore) {
      return res.status(404).json({ error: "No data available" });
    }
    
    // Create report message
    const report = `
🏥 WEEKLY NUTRITION REPORT

📊 Household Vitality Score: ${vitalityScore.currentScore}/100
📈 Trend: ${vitalityScore.trend.toUpperCase()}

🥗 Category Breakdown:
${Object.entries(vitalityScore.categoryDistribution)
  .filter(([_, value]) => value > 0)
  .map(([cat, value]) => `  ${cat}: ${value}%`)
  .join('\n')}

${recommendations.recommendations.length > 0 ? `
⚠️ TOP RECOMMENDATIONS:
${recommendations.recommendations.slice(0, 3).map((rec, i) => 
  `${i + 1}. ${rec.title}\n   ${rec.message}`
).join('\n\n')}
` : '✅ Great job! No issues found.'}

Keep tracking for better health! 💪
    `.trim();
    
    await notifyTeam(teamId, report);
    
    res.json({ success: true, message: "Report sent to all team members" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
