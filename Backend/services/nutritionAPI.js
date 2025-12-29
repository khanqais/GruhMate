import axios from "axios";
import NodeCache from "node-cache";

// Cache for 7 days (604800 seconds)
const cache = new NodeCache({ stdTTL: 604800 });

/**
 * ⚡ EXPANDED LOCAL DATABASE (Instant lookups - NO API calls)
 */
const NUTRITION_DATABASE = {
  // === VEGETABLES ===
  'tomato': { category: 'vegetables', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, vitaminC: 40, vitaminA: 42, isProcessed: false, healthScore: 85 },
  'onion': { category: 'vegetables', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, vitaminC: 7.4, isProcessed: false, healthScore: 80 },
  'potato': { category: 'vegetables', calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, vitaminC: 20, isProcessed: false, healthScore: 70 },
  'sweet potato': { category: 'vegetables', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, vitaminA: 384, isProcessed: false, healthScore: 90 },
  'carrot': { category: 'vegetables', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, vitaminA: 180, isProcessed: false, healthScore: 90 },
  'spinach': { category: 'vegetables', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, vitaminA: 188, vitaminC: 28, iron: 2.7, isProcessed: false, healthScore: 95 },
  'broccoli': { category: 'vegetables', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, vitaminC: 89, calcium: 47, isProcessed: false, healthScore: 95 },
  'cauliflower': { category: 'vegetables', calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2, vitaminC: 48, isProcessed: false, healthScore: 85 },
  'cabbage': { category: 'vegetables', calories: 25, protein: 1.3, carbs: 6, fat: 0.1, fiber: 2.5, vitaminC: 37, isProcessed: false, healthScore: 80 },
  'cucumber': { category: 'vegetables', calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, vitaminC: 2.8, isProcessed: false, healthScore: 75 },
  'bell pepper': { category: 'vegetables', calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, vitaminC: 128, isProcessed: false, healthScore: 90 },
  'beetroot': { category: 'vegetables', calories: 43, protein: 1.6, carbs: 10, fat: 0.2, fiber: 2.8, iron: 0.8, isProcessed: false, healthScore: 85 },
  'pumpkin': { category: 'vegetables', calories: 26, protein: 1, carbs: 6.5, fat: 0.1, fiber: 0.5, vitaminA: 170, isProcessed: false, healthScore: 80 },
  
  // === FRUITS ===
  'apple': { category: 'fruits', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, vitaminC: 5, isProcessed: false, healthScore: 90 },
  'banana': { category: 'fruits', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, potassium: 358, vitaminC: 9, isProcessed: false, healthScore: 85 },
  'orange': { category: 'fruits', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, vitaminC: 53, isProcessed: false, healthScore: 92 },
  'mango': { category: 'fruits', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, vitaminA: 54, vitaminC: 36, isProcessed: false, healthScore: 88 },
  'grapes': { category: 'fruits', calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9, vitaminC: 3.2, isProcessed: false, healthScore: 75 },
  'watermelon': { category: 'fruits', calories: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4, vitaminC: 8, isProcessed: false, healthScore: 80 },
  'papaya': { category: 'fruits', calories: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7, vitaminC: 61, vitaminA: 47, isProcessed: false, healthScore: 88 },
  'pomegranate': { category: 'fruits', calories: 83, protein: 1.7, carbs: 19, fat: 1.2, fiber: 4, vitaminC: 10, iron: 0.3, isProcessed: false, healthScore: 90 },
  'guava': { category: 'fruits', calories: 68, protein: 2.6, carbs: 14, fat: 1, fiber: 5.4, vitaminC: 228, isProcessed: false, healthScore: 95 },
  'lemon': { category: 'fruits', calories: 29, protein: 1.1, carbs: 9, fat: 0.3, fiber: 2.8, vitaminC: 53, isProcessed: false, healthScore: 85 },
  
  // === GRAINS & CEREALS ===
  'rice': { category: 'grains', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, iron: 0.2, isProcessed: false, healthScore: 60 },
  'brown rice': { category: 'grains', calories: 112, protein: 2.6, carbs: 24, fat: 0.9, fiber: 1.8, iron: 0.4, isProcessed: false, healthScore: 80 },
  'wheat': { category: 'grains', calories: 340, protein: 13, carbs: 72, fat: 2.5, fiber: 11, iron: 3.6, isProcessed: false, healthScore: 75 },
  'wheat flour': { category: 'grains', calories: 364, protein: 10, carbs: 76, fat: 1, fiber: 2.7, iron: 1.2, isProcessed: true, healthScore: 60 },
  'oats': { category: 'grains', calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 11, iron: 4.7, isProcessed: false, healthScore: 90 },
  'quinoa': { category: 'grains', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8, iron: 1.5, isProcessed: false, healthScore: 92 },
  'bread': { category: 'grains', calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sodium: 491, isProcessed: true, healthScore: 50 },
  'roti': { category: 'grains', calories: 297, protein: 11, carbs: 62, fat: 1.4, fiber: 4.5, iron: 3.5, isProcessed: false, healthScore: 70 },
  'poha': { category: 'grains', calories: 158, protein: 1.8, carbs: 35, fat: 0.2, fiber: 2, iron: 0.3, isProcessed: true, healthScore: 55 },
  
  // === PROTEIN SOURCES ===
  'dal': { category: 'protein', calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, iron: 3.3, isProcessed: false, healthScore: 95 },
  'lentils': { category: 'protein', calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, iron: 3.3, isProcessed: false, healthScore: 95 },
  'chickpeas': { category: 'protein', calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6, iron: 2.9, isProcessed: false, healthScore: 92 },
  'kidney beans': { category: 'protein', calories: 127, protein: 8.7, carbs: 23, fat: 0.5, fiber: 6.4, iron: 2.9, isProcessed: false, healthScore: 90 },
  'egg': { category: 'protein', calories: 155, protein: 13, carbs: 1.1, fat: 11, vitaminA: 19, vitaminD: 2, isProcessed: false, healthScore: 88 },
  'chicken': { category: 'protein', calories: 239, protein: 27, carbs: 0, fat: 14, iron: 1, isProcessed: false, healthScore: 82 },
  'fish': { category: 'protein', calories: 206, protein: 22, carbs: 0, fat: 12, vitaminD: 10, isProcessed: false, healthScore: 90 },
  'paneer': { category: 'dairy', calories: 265, protein: 18, carbs: 1.2, fat: 20, calcium: 200, isProcessed: false, healthScore: 70 },
  'tofu': { category: 'protein', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, calcium: 350, iron: 5.4, isProcessed: false, healthScore: 85 },
  
  // === DAIRY ===
  'milk': { category: 'dairy', calories: 42, protein: 3.4, carbs: 5, fat: 1, calcium: 120, vitaminD: 1.3, isProcessed: false, healthScore: 80 },
  'yogurt': { category: 'dairy', calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3, calcium: 110, isProcessed: false, healthScore: 85 },
  'curd': { category: 'dairy', calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3, calcium: 110, isProcessed: false, healthScore: 85 },
  'butter': { category: 'dairy', calories: 717, protein: 0.9, carbs: 0.1, fat: 81, vitaminA: 58, isProcessed: true, healthScore: 30 },
  'ghee': { category: 'dairy', calories: 900, protein: 0, carbs: 0, fat: 100, vitaminA: 60, isProcessed: true, healthScore: 40 },
  'cheese': { category: 'dairy', calories: 402, protein: 25, carbs: 1.3, fat: 33, calcium: 721, isProcessed: true, healthScore: 55 },
  
  // === OILS & FATS ===
  'oil': { category: 'other', calories: 884, protein: 0, carbs: 0, fat: 100, isProcessed: true, healthScore: 30 },
  'olive oil': { category: 'other', calories: 884, protein: 0, carbs: 0, fat: 100, vitaminE: 14, isProcessed: false, healthScore: 60 },
  
  // === PROCESSED/SNACKS ===
  'chips': { category: 'snacks', calories: 536, protein: 6.6, carbs: 53, fat: 34, sodium: 800, sugar: 0.8, isProcessed: true, healthScore: 20 },
  'biscuit': { category: 'snacks', calories: 502, protein: 6.5, carbs: 63, fat: 25, sugar: 27, sodium: 450, isProcessed: true, healthScore: 25 },
  'cookies': { category: 'snacks', calories: 488, protein: 5, carbs: 68, fat: 23, sugar: 28, isProcessed: true, healthScore: 20 },
  'namkeen': { category: 'snacks', calories: 520, protein: 10, carbs: 50, fat: 30, sodium: 1200, isProcessed: true, healthScore: 25 },
  'sugar': { category: 'other', calories: 387, protein: 0, carbs: 100, fat: 0, sugar: 100, isProcessed: true, healthScore: 10 },
  'salt': { category: 'other', calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 38758, isProcessed: true, healthScore: 20 },
  
  // === NUTS & SEEDS ===
  'almonds': { category: 'protein', calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5, calcium: 269, iron: 3.7, isProcessed: false, healthScore: 90 },
  'cashews': { category: 'protein', calories: 553, protein: 18, carbs: 30, fat: 44, magnesium: 292, isProcessed: false, healthScore: 80 },
  'peanuts': { category: 'protein', calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5, isProcessed: false, healthScore: 85 },
  'walnuts': { category: 'protein', calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7, isProcessed: false, healthScore: 88 },
  
  // === BEVERAGES ===
  'tea': { category: 'beverages', calories: 1, protein: 0, carbs: 0.3, fat: 0, isProcessed: false, healthScore: 60 },
  'coffee': { category: 'beverages', calories: 2, protein: 0.3, carbs: 0, fat: 0, isProcessed: false, healthScore: 60 },
  'juice': { category: 'beverages', calories: 45, protein: 0.7, carbs: 11, fat: 0.2, vitaminC: 50, isProcessed: true, healthScore: 50 },
};

/**
 * ⚡ FAST LOOKUP - Check local database first (0ms response)
 */
function getNutritionFromLocalDB(itemName) {
  const normalized = itemName.toLowerCase().trim();
  
  // Direct match
  if (NUTRITION_DATABASE[normalized]) {
    console.log(`✅ Found "${itemName}" in local database (instant)`);
    return { productName: itemName, ...NUTRITION_DATABASE[normalized] };
  }
  
  // Partial match (contains)
  for (const [key, value] of Object.entries(NUTRITION_DATABASE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      console.log(`✅ Found "${itemName}" via partial match: "${key}" (instant)`);
      return { productName: itemName, ...value };
    }
  }
  
  return null;
}

/**
 * Get nutrition from Open Food Facts (with timeout)
 */
async function getNutritionFromOpenFoodFacts(productName) {
  try {
    const cacheKey = `off_${productName}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`✅ Found "${productName}" in cache`);
      return cached;
    }

    console.log(`🌐 Searching OpenFoodFacts for: ${productName}`);

    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl`;
    const response = await axios.get(searchUrl, {
      params: {
        search_terms: productName,
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: 1
      },
      timeout: 3000 // ⚡ 3 second timeout
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
        vitaminA: nutriments['vitamin-a_100g'] || 0,
        vitaminC: nutriments['vitamin-c_100g'] || 0,
        vitaminD: nutriments['vitamin-d_100g'] || 0,
        calcium: nutriments.calcium_100g || 0,
        iron: nutriments.iron_100g || 0,
        potassium: nutriments.potassium_100g || 0,
        category: categorizeFood(product.categories_tags || []),
        isProcessed: isProcessedFood(product.nova_group),
        healthScore: product.nutriscore_score || 50
      };

      cache.set(cacheKey, nutritionData);
      console.log(`✅ Found "${productName}" in OpenFoodFacts`);
      return nutritionData;
    }
    
    return null;
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      console.log(`⏱️ OpenFoodFacts timeout for "${productName}"`);
    } else {
      console.log(`⚠️ OpenFoodFacts error: ${err.message}`);
    }
    return null;
  }
}

/**
 * Categorize food
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
  
  return 'other';
}

/**
 * Check if processed
 */
function isProcessedFood(novaGroup) {
  return novaGroup >= 3;
}

/**
 * ⚡ MASTER FUNCTION (Optimized order)
 */
export async function getNutritionData(itemName) {
  console.log(`\n🔍 Fetching nutrition data for: ${itemName}`);
  const startTime = Date.now();
  
  // 1️⃣ Try local database FIRST (instant - 0ms)
  let data = getNutritionFromLocalDB(itemName);
  if (data) {
    console.log(`⚡ Response time: ${Date.now() - startTime}ms\n`);
    return data;
  }
  
  // 2️⃣ Only call API if not in local DB (branded products)
  data = await getNutritionFromOpenFoodFacts(itemName);
  if (data) {
    console.log(`⚡ Response time: ${Date.now() - startTime}ms\n`);
    return data;
  }
  
  // 3️⃣ Return generic data if nothing found
  console.log(`⚠️ No nutrition data found for "${itemName}" - using generic data`);
  console.log(`⚡ Response time: ${Date.now() - startTime}ms\n`);
  
  return {
    productName: itemName,
    category: 'other',
    calories: 50,
    protein: 1,
    carbs: 10,
    fat: 1,
    fiber: 1,
    isProcessed: false,
    healthScore: 50
  };
}
