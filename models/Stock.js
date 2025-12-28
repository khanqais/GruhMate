// models/Stock.js
import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  consumptionRate: { type: String },
  requiredQuantity: { type: Number },
  expiryDate: { type: Date },
  brand: { type: String },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  
  lastExpiryNotification: { 
    type: String, 
    enum: ['30days', '1day', 'expired', null],
    default: null 
  },
  lastNotificationDate: { type: Date }
}, { timestamps: true });

const Stock = mongoose.model("Stock", stockSchema);
export default Stock;
