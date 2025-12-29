import NutritionLog from "../models/NutritionLog.js";
import VitalityScore from "../models/VitalityScore.js";
import { subDays, format } from "date-fns";

/**
 * Calculate Household Vitality Score (0-100)
 */
export async function calculateVitalityScore(teamId) {
  try {
    console.log(`\n🧮 Calculating Vitality Score for team: ${teamId}`);
    
    // Get last 30 days of nutrition data
    const thirtyDaysAgo = subDays(new Date(), 30);
    const nutritionLogs = await NutritionLog.find({
      teamId,
      dateAdded: { $gte: thirtyDaysAgo }
    });

    console.log(`📊 Found ${nutritionLogs.length} nutrition logs in last 30 days`);

    if (nutritionLogs.length === 0) {
      console.log("⚠️ No nutrition data found");
      
      // ✅ Reset to default when no data
      const defaultData = {
        teamId,
        currentScore: 50,
        previousScore: 50,
        trend: 'stable',
        breakdown: {
          freshFoodScore: 12.5,
          nutritionBalanceScore: 12.5,
          varietyScore: 12.5,
          micronutrientScore: 12.5
        },
        categoryDistribution: {},
        deficiencies: [],
        lastCalculated: new Date()
      };
      
      await VitalityScore.findOneAndUpdate(
        { teamId },
        defaultData,
        { upsert: true, new: true }
      );
      
      return defaultData;
    }

    // 1️⃣ FRESH FOOD SCORE (0-25 points)
    const freshFoodScore = calculateFreshFoodScore(nutritionLogs);
    
    // 2️⃣ NUTRITION BALANCE SCORE (0-25 points)
    const nutritionBalanceScore = calculateNutritionBalance(nutritionLogs);
    
    // 3️⃣ VARIETY SCORE (0-25 points)
    const varietyScore = calculateVarietyScore(nutritionLogs);
    
    // 4️⃣ MICRONUTRIENT SCORE (0-25 points)
    const micronutrientScore = calculateMicronutrientScore(nutritionLogs);
    
    // Total Score
    const currentScore = Math.round(
      freshFoodScore + nutritionBalanceScore + varietyScore + micronutrientScore
    );

    // Category distribution
    const categoryDistribution = calculateCategoryDistribution(nutritionLogs);
    
    // Detect deficiencies
    const deficiencies = detectDeficiencies(nutritionLogs);

    // Get previous score for trend analysis
    const existingScore = await VitalityScore.findOne({ teamId });
    const previousScore = existingScore?.currentScore || 50;
    const trend = currentScore > previousScore + 5 ? 'improving' :
                  currentScore < previousScore - 5 ? 'declining' : 'stable';

    // ✅ Update or create vitality score
    const vitalityData = {
      teamId,
      currentScore,
      previousScore,
      trend,
      breakdown: {
        freshFoodScore,
        nutritionBalanceScore,
        varietyScore,
        micronutrientScore
      },
      categoryDistribution,
      deficiencies,
      lastCalculated: new Date()
    };

    const updatedScore = await VitalityScore.findOneAndUpdate(
      { teamId },
      vitalityData,
      { upsert: true, new: true }
    );

    console.log(`✅ Vitality Score: ${currentScore}/100 (${trend})`);
    console.log(`   Fresh Food: ${freshFoodScore}/25`);
    console.log(`   Balance: ${nutritionBalanceScore}/25`);
    console.log(`   Variety: ${varietyScore}/25`);
    console.log(`   Micronutrients: ${micronutrientScore}/25\n`);

    return updatedScore;
  } catch (err) {
    console.error("❌ Vitality calculation error:", err);
    throw err;
  }
}


/**
 * 1. Fresh Food Score (25 points max)
 * Penalize processed foods, reward fresh produce
 */
function calculateFreshFoodScore(logs) {
  const totalItems = logs.length;
  const processedCount = logs.filter(log => log.isProcessed).length;
  const freshCount = totalItems - processedCount;
  
  const freshPercentage = (freshCount / totalItems) * 100;
  
  // Score mapping
  if (freshPercentage >= 80) return 25;
  if (freshPercentage >= 60) return 20;
  if (freshPercentage >= 40) return 15;
  if (freshPercentage >= 20) return 10;
  return 5;
}

/**
 * 2. Nutrition Balance Score (25 points max)
 * Check macronutrient ratios (Carbs: 45-65%, Protein: 10-35%, Fat: 20-35%)
 */
function calculateNutritionBalance(logs) {
  let totalCarbs = 0, totalProtein = 0, totalFat = 0;
  
  logs.forEach(log => {
    totalCarbs += log.nutritionData.carbs || 0;
    totalProtein += log.nutritionData.protein || 0;
    totalFat += log.nutritionData.fat || 0;
  });
  
  const totalMacros = totalCarbs + totalProtein + totalFat;
  if (totalMacros === 0) return 10;
  
  const carbsPercent = (totalCarbs / totalMacros) * 100;
  const proteinPercent = (totalProtein / totalMacros) * 100;
  const fatPercent = (totalFat / totalMacros) * 100;
  
  let score = 25;
  
  // Check if within healthy ranges
  if (carbsPercent < 45 || carbsPercent > 65) score -= 8;
  if (proteinPercent < 10 || proteinPercent > 35) score -= 8;
  if (fatPercent < 20 || fatPercent > 35) score -= 8;
  
  return Math.max(0, score);
}

/**
 * 3. Variety Score (25 points max)
 * Reward diverse food categories
 */
function calculateVarietyScore(logs) {
  const categories = new Set(logs.map(log => log.category));
  const uniqueItems = new Set(logs.map(log => log.itemName.toLowerCase()));
  
  // Points for category diversity
  const categoryScore = Math.min(15, categories.size * 2);
  
  // Points for item variety
  const varietyScore = Math.min(10, uniqueItems.size);
  
  return categoryScore + varietyScore;
}

/**
 * 4. Micronutrient Score (25 points max)
 * Check vitamin and mineral intake
 */
function calculateMicronutrientScore(logs) {
  let vitaminC = 0, vitaminA = 0, calcium = 0, iron = 0;
  
  logs.forEach(log => {
    vitaminC += log.nutritionData.vitaminC || 0;
    vitaminA += log.nutritionData.vitaminA || 0;
    calcium += log.nutritionData.calcium || 0;
    iron += log.nutritionData.iron || 0;
  });
  
  let score = 0;
  if (vitaminC > 50) score += 7;
  if (vitaminA > 50) score += 6;
  if (calcium > 500) score += 6;
  if (iron > 10) score += 6;
  
  return score;
}

/**
 * Calculate category distribution percentage
 */
function calculateCategoryDistribution(logs) {
  const distribution = {};
  const total = logs.length;
  
  logs.forEach(log => {
    distribution[log.category] = (distribution[log.category] || 0) + 1;
  });
  
  Object.keys(distribution).forEach(key => {
    distribution[key] = Math.round((distribution[key] / total) * 100);
  });
  
  return distribution;
}

/**
 * Detect nutritional deficiencies
 */
function detectDeficiencies(logs) {
  const sevenDaysAgo = subDays(new Date(), 7);
  const recentLogs = logs.filter(log => new Date(log.dateAdded) >= sevenDaysAgo);
  
  const deficiencies = [];
  
  // Check vitamin C (from fruits/vegetables)
  const vitaminCItems = recentLogs.filter(log => 
    log.category === 'fruits' || log.category === 'vegetables'
  );
  if (vitaminCItems.length < 3) {
    deficiencies.push({
      nutrient: 'Vitamin C',
      severity: 'moderate',
      daysLow: 7,
      recommendation: 'Add citrus fruits (oranges, lemons) or vegetables (tomatoes, bell peppers) to your cart'
    });
  }
  
  // Check protein
  const proteinItems = recentLogs.filter(log => log.category === 'protein');
  if (proteinItems.length < 2) {
    deficiencies.push({
      nutrient: 'Protein',
      severity: 'low',
      daysLow: 7,
      recommendation: 'Add dal, eggs, or paneer to improve protein intake'
    });
  }
  
  // Check processed food excess
  const processedCount = recentLogs.filter(log => log.isProcessed).length;
  if (processedCount / recentLogs.length > 0.5) {
    deficiencies.push({
      nutrient: 'Fresh Foods',
      severity: 'high',
      daysLow: 7,
      recommendation: 'Replace processed snacks with fresh fruits and vegetables'
    });
  }
  
  return deficiencies;
}
