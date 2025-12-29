import VitalityScore from "../models/VitalityScore.js";
import NutritionLog from "../models/NutritionLog.js";

/**
 * Generate smart food recommendations based on deficiencies
 */
export async function generateRecommendations(teamId) {
  try {
    const vitalityScore = await VitalityScore.findOne({ teamId });
    
    if (!vitalityScore) {
      return {
        message: "Start adding items to get personalized recommendations",
        recommendations: []
      };
    }

    const recommendations = [];
    
    // 1️⃣ Check deficiencies and recommend specific foods
    if (vitalityScore.deficiencies && vitalityScore.deficiencies.length > 0) {
      vitalityScore.deficiencies.forEach(def => {
        recommendations.push({
          type: 'deficiency',
          priority: def.severity === 'high' ? 'urgent' : 'normal',
          title: `Low ${def.nutrient}`,
          message: def.recommendation,
          suggestedItems: getSuggestedItemsForNutrient(def.nutrient),
          icon: '⚠️'
        });
      });
    }
    
    // 2️⃣ Check processed food percentage
    if (vitalityScore.categoryDistribution.processed > 30) {
      recommendations.push({
        type: 'health_alert',
        priority: 'urgent',
        title: 'Too Many Processed Foods',
        message: `${vitalityScore.categoryDistribution.processed}% of your items are processed. Reduce to <20% for better health.`,
        suggestedItems: ['Fresh vegetables', 'Fruits', 'Whole grains', 'Nuts'],
        icon: '🚨'
      });
    }
    
    // 3️⃣ Check variety
    if (vitalityScore.breakdown.varietyScore < 15) {
      recommendations.push({
        type: 'variety',
        priority: 'normal',
        title: 'Increase Food Variety',
        message: 'Add more diverse foods to improve nutrient intake',
        suggestedItems: ['Spinach', 'Carrots', 'Apples', 'Almonds', 'Yogurt'],
        icon: '🌈'
      });
    }
    
    // 4️⃣ Check missing food groups
    const missingCategories = findMissingCategories(vitalityScore.categoryDistribution);
    if (missingCategories.length > 0) {
      recommendations.push({
        type: 'missing_category',
        priority: 'normal',
        title: `Missing: ${missingCategories.join(', ')}`,
        message: 'Add these food groups for balanced nutrition',
        suggestedItems: getSuggestedItemsForCategories(missingCategories),
        icon: '📋'
      });
    }
    
    // 5️⃣ Positive reinforcement
    if (vitalityScore.currentScore >= 80) {
      recommendations.push({
        type: 'achievement',
        priority: 'info',
        title: '🎉 Excellent Health Score!',
        message: 'Keep up the great work! Your nutrition is well-balanced.',
        icon: '✅'
      });
    }
    
    return {
      vitalityScore: vitalityScore.currentScore,
      trend: vitalityScore.trend,
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder = { urgent: 0, normal: 1, info: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
    };
  } catch (err) {
    console.error("Recommendation engine error:", err);
    throw err;
  }
}

/**
 * Get food suggestions for specific nutrients
 */
function getSuggestedItemsForNutrient(nutrient) {
  const suggestions = {
    'Vitamin C': ['Oranges', 'Lemons', 'Tomatoes', 'Bell Peppers', 'Broccoli'],
    'Vitamin A': ['Carrots', 'Sweet Potatoes', 'Spinach', 'Mangoes'],
    'Protein': ['Dal', 'Eggs', 'Paneer', 'Chicken', 'Fish', 'Chickpeas'],
    'Calcium': ['Milk', 'Yogurt', 'Cheese', 'Spinach', 'Almonds'],
    'Iron': ['Dal', 'Spinach', 'Beetroot', 'Dates', 'Pomegranate'],
    'Fresh Foods': ['Spinach', 'Tomatoes', 'Cucumbers', 'Apples', 'Bananas']
  };
  
  return suggestions[nutrient] || ['Fresh vegetables', 'Fruits'];
}

/**
 * Get suggestions for missing categories
 */
function getSuggestedItemsForCategories(categories) {
  const suggestions = {
    vegetables: ['Spinach', 'Tomatoes', 'Onions', 'Carrots', 'Potatoes'],
    fruits: ['Apples', 'Bananas', 'Oranges', 'Mangoes', 'Grapes'],
    protein: ['Dal', 'Eggs', 'Paneer', 'Chickpeas', 'Tofu'],
    dairy: ['Milk', 'Yogurt', 'Cheese', 'Buttermilk'],
    grains: ['Brown Rice', 'Wheat', 'Oats', 'Quinoa']
  };
  
  const items = [];
  categories.forEach(cat => {
    if (suggestions[cat]) {
      items.push(...suggestions[cat].slice(0, 2));
    }
  });
  
  return items;
}

/**
 * Find categories with <5% representation
 */
function findMissingCategories(distribution) {
  const essential = ['vegetables', 'fruits', 'protein', 'dairy', 'grains'];
  return essential.filter(cat => (distribution[cat] || 0) < 5);
}
