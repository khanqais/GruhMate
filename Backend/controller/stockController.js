import Stock from '../models/Stock.js';
import BuyList from '../models/BuyList.js';
import { notifyTeam } from '../services/teamNotifier.js';

import { getNutritionData } from "../services/nutritionAPI.js";
import NutritionLog from "../models/NutritionLog.js";


import { calculateVitalityScore } from "../services/vitalityCalculator.js";

export const addStock = async (req, res) => {
  try {
    const { teamId, name, quantity, unit, consumptionRate, expiryDate, brand, userName } = req.body;

    // Create stock
    const stock = await Stock.create({
      teamId,
      name,
      quantity,
      unit,
      consumptionRate,
      expiryDate: expiryDate || null,
      brand
    });

    // ✅ AUTO-ANALYZE NUTRITION
    try {
      const nutritionData = await getNutritionData(name);
      
      if (nutritionData) {
        await NutritionLog.create({
          teamId,
          stockItemId: stock._id,
          itemName: name,
          category: nutritionData.category || 'other',
          nutritionData: {
            calories: nutritionData.calories,
            protein: nutritionData.protein,
            carbs: nutritionData.carbs,
            fat: nutritionData.fat,
            fiber: nutritionData.fiber,
            sugar: nutritionData.sugar,
            sodium: nutritionData.sodium,
            vitaminA: nutritionData.vitaminA || 0,
            vitaminC: nutritionData.vitaminC || 0,
            calcium: nutritionData.calcium || 0,
            iron: nutritionData.iron || 0
          },
          healthScore: nutritionData.healthScore || 50,
          isProcessed: nutritionData.isProcessed || false,
          quantity,
          unit
        });
        
        // Recalculate vitality score
        await calculateVitalityScore(teamId);
        
        console.log(`✅ Nutrition logged for: ${name}`);
      }
    } catch (nutritionError) {
      console.error("⚠️ Nutrition logging failed:", nutritionError.message);
      // Don't fail the stock addition if nutrition fails
    }

    await notifyTeam(
      teamId,
      `✅ NEW STOCK ADDED!\n📦 Item: ${name}\n📊 Quantity: ${quantity} ${unit}\n🏷️ Brand: ${brand || 'N/A'}\n👤 Added by: ${userName || 'Team member'}`
    );

    res.status(201).json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getStockByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!teamId || teamId === "undefined" || teamId === "null") {
      return res.status(400).json({ message: "Invalid teamId" });
    }

    const stock = await Stock.find({ teamId }).populate("teamId", "teamName");
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, ...updateData } = req.body;

    const stock = await Stock.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    await notifyTeam(
      stock.teamId,
      `✏️ STOCK UPDATED\n📦 ${stock.name} has been updated\n👤 By: ${userName || 'Team member'}`
    );

    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName } = req.body;

    const stock = await Stock.findById(id);
    
    if (!stock) {
      return res.status(404).json({ error: "Stock item not found" });
    }

    const teamId = stock.team;
    const itemName = stock.name;

    // Delete the stock item
    await Stock.findByIdAndDelete(id);

    // ✅ NEW: Delete all nutrition logs for this item
    const deleteResult = await NutritionLog.deleteMany({
      teamId: teamId,
      itemName: itemName
    });

    console.log(`🗑️ Deleted stock "${itemName}" and ${deleteResult.deletedCount} nutrition logs`);

    // ✅ NEW: Recalculate vitality score after deletion
    try {
      await calculateVitalityScore(teamId);
      console.log(`✅ Vitality score recalculated after deleting "${itemName}"`);
    } catch (err) {
      console.error("Error recalculating vitality:", err);
    }

    res.json({ 
      message: `Stock item "${itemName}" deleted successfully`,
      nutritionLogsDeleted: deleteResult.deletedCount
    });
  } catch (err) {
    console.error("Error deleting stock:", err);
    res.status(500).json({ error: "Failed to delete stock item" });
  }
};
