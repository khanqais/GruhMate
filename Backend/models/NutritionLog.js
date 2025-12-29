import mongoose from "mongoose";

const nutritionLogSchema = new mongoose.Schema({
  teamId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Team", 
    required: true 
  },
  stockItemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Stock" 
  },
  itemName: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['vegetables', 'fruits', 'grains', 'protein', 'dairy', 'processed', 'snacks', 'beverages', 'other'],
    default: 'other'
  },
  nutritionData: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },      // grams
    carbs: { type: Number, default: 0 },        // grams
    fat: { type: Number, default: 0 },          // grams
    fiber: { type: Number, default: 0 },        // grams
    sugar: { type: Number, default: 0 },        // grams
    sodium: { type: Number, default: 0 },       // mg
    
    // Vitamins (% daily value)
    vitaminA: { type: Number, default: 0 },
    vitaminC: { type: Number, default: 0 },
    vitaminD: { type: Number, default: 0 },
    vitaminE: { type: Number, default: 0 },
    vitaminK: { type: Number, default: 0 },
    vitaminB12: { type: Number, default: 0 },
    
    // Minerals (% daily value)
    calcium: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
    magnesium: { type: Number, default: 0 },
    potassium: { type: Number, default: 0 },
    zinc: { type: Number, default: 0 }
  },
  healthScore: { type: Number, default: 50 }, // 0-100
  isProcessed: { type: Boolean, default: false },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  dateAdded: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for faster queries
nutritionLogSchema.index({ teamId: 1, dateAdded: -1 });
nutritionLogSchema.index({ teamId: 1, category: 1 });

export default mongoose.model("NutritionLog", nutritionLogSchema);
