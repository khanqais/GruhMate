import mongoose from "mongoose";

const vitalityScoreSchema = new mongoose.Schema({
  teamId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Team", 
    required: true,
    unique: true
  },
  currentScore: { type: Number, default: 50, min: 0, max: 100 },
  previousScore: { type: Number, default: 50 },
  trend: { type: String, enum: ['improving', 'declining', 'stable'], default: 'stable' },
  
  breakdown: {
    freshFoodScore: { type: Number, default: 50 },      // 0-25 points
    nutritionBalanceScore: { type: Number, default: 50 }, // 0-25 points
    varietyScore: { type: Number, default: 50 },        // 0-25 points
    micronutrientScore: { type: Number, default: 50 }   // 0-25 points
  },
  
  categoryDistribution: {
    vegetables: { type: Number, default: 0 },   // percentage
    fruits: { type: Number, default: 0 },
    grains: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    dairy: { type: Number, default: 0 },
    processed: { type: Number, default: 0 },
    snacks: { type: Number, default: 0 },
    beverages: { type: Number, default: 0 }
  },
  
  deficiencies: [{
    nutrient: String,
    severity: { type: String, enum: ['low', 'moderate', 'high'] },
    daysLow: Number,
    recommendation: String
  }],
  
  lastCalculated: { type: Date, default: Date.now },
  weeklyHistory: [{
    week: String,
    score: Number,
    date: Date
  }]
}, { timestamps: true });

export default mongoose.model("VitalityScore", vitalityScoreSchema);
