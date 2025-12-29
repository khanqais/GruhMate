import axios from "axios";
import NodeCache from "node-cache";

// Cache for 24 hours
const cache = new NodeCache({ stdTTL: 86400 });

/**
 * Get nutrition data from Open Food Facts API (FREE)
 */
export async function getNutritionFromOpenFoodFacts(productName) {
  try {
    const cacheKey = `off_${productName}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl`;
    const response = await axios.get(searchUrl, {
      params: {
        search_terms: productName,
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: 1
      }
    });

    if (response.data.products && response.data.products.length > 0) {
      const product = response.data.products[0];
      const nutriments = product.nutriments || {};
      
      const nutritionData = {
        productName: product.product_name || productName,
        calories: nutriments['energy-kcal_100g'] || 0,
        protein: nutriments.proteins_100g || 0,
        carbs: nutriments.carbohydrates_100g || 0,
        fat: nutriments.fat_100g || 0,
        fiber: nutriments.fiber_100g || 0,
        sugar: nutriments.sugars_100g || 0,
        sodium: nutriments.sodium_100g || 0,
        
        // Vitamins (convert to % daily value)
        vitaminA: nutriments['vitamin-a_100g'] || 0,
        vitaminC: nutriments['vitamin-c_100g'] || 0,
        vitaminD: nutriments['vitamin-d_100g'] || 0,
        
        // Minerals
        calcium: nutriments.calcium_100g || 0,
        iron: nutriments.iron_100g || 0,
        potassium: nutriments.potassium_100g || 0,
        
        category: categorizeFood(product.categories_tags || []),
        isProcessed: isProcessedFood(product.nova_group),
        healthScore: product.nutriscore_score || 50
      };

      cache.set(cacheKey, nutritionData);
      return nutritionData;
    }
    
    return null;
  } catch (err) {
    console.error("OpenFoodFacts API error:", err.message);
    return null;
  }
}

/**
 * Get nutrition data from CalorieNinjas API (FREE tier: 100 requests/month)
 */
export async function getNutritionFromCalorieNinjas(itemName) {
  try {
    const cacheKey = `cn_${itemName}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const apiKey = process.env.CALORIE_NINJAS_API_KEY;
    if (!apiKey) {
      console.log("⚠️ CalorieNinjas API key not found, using fallback");
      return null;
    }

    const response = await axios.get('https://api.calorieninjas.com/v1/nutrition', {
      params: { query: itemName },
      headers: { 'X-Api-Key': apiKey }
    });

    if (response.data.items && response.data.items.length > 0) {
      const item = response.data.items[0];
      
      const nutritionData = {
        productName: item.name,
        calories: item.calories || 0,
        protein: item.protein_g || 0,
        carbs: item.carbohydrates_total_g || 0,
        fat: item.fat_total_g || 0,
        fiber: item.fiber_g || 0,
        sugar: item.sugar_g || 0,
        sodium: item.sodium_mg || 0,
        
        category: categorizeFood([item.name]),
        isProcessed: item.fat_saturated_g > 5 || item.sugar_g > 10,
        healthScore: calculateHealthScore(item)
      };

      cache.set(cacheKey, nutritionData);
      return nutritionData;
    }
    
    return null;
  } catch (err) {
    console.error("CalorieNinjas API error:", err.message);
    return null;
  }
}

/**
 * Fallback: Use local database for common Indian foods
 */
export function getNutritionFromLocalDB(itemName) {
  const indianFoods = {
    // Vegetables
    'tomato': { category: 'vegetables', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, vitaminC: 40, isProcessed: false, healthScore: 85 },
    'onion': { category: 'vegetables', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, vitaminC: 7.4, isProcessed: false, healthScore: 80 },
    'potato': { category: 'vegetables', calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, vitaminC: 20, isProcessed: false, healthScore: 70 },
    'carrot': { category: 'vegetables', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, vitaminA: 180, isProcessed: false, healthScore: 90 },
    
    // Grains
    'rice': { category: 'grains', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, iron: 0.2, isProcessed: false, healthScore: 60 },
    'wheat': { category: 'grains', calories: 340, protein: 13, carbs: 72, fat: 2.5, fiber: 11, iron: 3.6, isProcessed: false, healthScore: 75 },
    'dal': { category: 'protein', calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, iron: 3.3, isProcessed: false, healthScore: 95 },
    
    // Dairy
    'milk': { category: 'dairy', calories: 42, protein: 3.4, carbs: 5, fat: 1, calcium: 120, vitaminD: 1.3, isProcessed: false, healthScore: 80 },
    'yogurt': { category: 'dairy', calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3, calcium: 110, isProcessed: false, healthScore: 85 },
    
    // Processed
    'chips': { category: 'snacks', calories: 536, protein: 6.6, carbs: 53, fat: 34, sodium: 800, sugar: 0.8, isProcessed: true, healthScore: 20 },
    'biscuit': { category: 'snacks', calories: 502, protein: 6.5, carbs: 63, fat: 25, sugar: 27, sodium: 450, isProcessed: true, healthScore: 25 },
    'bread': { category: 'grains', calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sodium: 491, isProcessed: true, healthScore: 50 }
  };

  const normalized = itemName.toLowerCase().trim();
  
  // Exact match
  if (indianFoods[normalized]) {
    return { productName: itemName, ...indianFoods[normalized] };
  }
  
  // Partial match
  for (const [key, value] of Object.entries(indianFoods)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { productName: itemName, ...value };
    }
  }
  
  return null;
}

/**
 * Categorize food based on keywords
 */
function categorizeFood(tags) {
  const tagString = tags.join(' ').toLowerCase();
  
  if (tagString.includes('vegetable') || tagString.includes('greens')) return 'vegetables';
  if (tagString.includes('fruit')) return 'fruits';
  if (tagString.includes('grain') || tagString.includes('cereal') || tagString.includes('rice') || tagString.includes('wheat')) return 'grains';
  if (tagString.includes('meat') || tagString.includes('protein') || tagString.includes('dal') || tagString.includes('lentil')) return 'protein';
  if (tagString.includes('milk') || tagString.includes('dairy') || tagString.includes('cheese') || tagString.includes('yogurt')) return 'dairy';
  if (tagString.includes('snack') || tagString.includes('chips') || tagString.includes('biscuit')) return 'snacks';
  if (tagString.includes('beverage') || tagString.includes('drink') || tagString.includes('juice')) return 'beverages';
  if (tagString.includes('processed')) return 'processed';
  
  return 'other';
}

/**
 * Check if food is processed (NOVA classification)
 */
function isProcessedFood(novaGroup) {
  return novaGroup >= 3; // NOVA groups 3-4 are processed/ultra-processed
}

/**
 * Calculate health score based on nutrients
 */
function calculateHealthScore(nutrients) {
  let score = 50;
  
  // Positive factors
  if (nutrients.protein_g > 5) score += 10;
  if (nutrients.fiber_g > 3) score += 10;
  if (nutrients.carbohydrates_total_g < 50) score += 5;
  
  // Negative factors
  if (nutrients.sugar_g > 10) score -= 15;
  if (nutrients.fat_saturated_g > 5) score -= 10;
  if (nutrients.sodium_mg > 500) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Master function: Try all sources
 */
export async function getNutritionData(itemName) {
  console.log(`🔍 Fetching nutrition data for: ${itemName}`);
  
  // Try API sources first
  let data = await getNutritionFromOpenFoodFacts(itemName);
  if (data) {
    console.log(`✅ Found in OpenFoodFacts`);
    return data;
  }
  
  data = await getNutritionFromCalorieNinjas(itemName);
  if (data) {
    console.log(`✅ Found in CalorieNinjas`);
    return data;
  }
  
  // Fallback to local DB
  data = getNutritionFromLocalDB(itemName);
  if (data) {
    console.log(`✅ Found in local database`);
    return data;
  }
  
  console.log(`⚠️ No nutrition data found for ${itemName}`);
  return null;
}
