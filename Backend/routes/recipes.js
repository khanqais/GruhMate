// routes/recipes.js
import express from "express";
import mongoose from "mongoose";
import Stock from "../models/Stock.js";
import { generateRecipeJSON } from "../services/recipeAgent.js";
import { RecipeSchema, reconcileWithStock } from "../services/validators.js";
import { shapePantry, expiringSoon } from "../utils/dataPrep.js";

const router = express.Router();

function buildStockMap(docs) {
  const map = {};
  docs.forEach(d => {
    const key = d.name.toLowerCase().trim();
    map[key] = {
      quantity: d.quantity,
      unit: d.unit,
      expiryDate: d.expiryDate || null
    };
  });
  return map;
}

// User posts: goals, timeMinutes, equipment
router.post("/generate", async (req, res) => {
  try {
    const { teamId } = req.body;
    const teamObjectId = new mongoose.Types.ObjectId(teamId);
    
    console.log("Incoming teamId:", teamId);
    console.log("Converted ObjectId:", teamObjectId);

    const { goals = [], timeMinutes = 20, equipment = [], focusItems = [] } = req.body;

    // Fetch stock for the team
    const stockDocs = await Stock.find({ team: teamObjectId, quantity: { $gt: 0 } }).lean();
    const pantry = shapePantry(stockDocs);
    
    console.log("Pantry context:", pantry);
    console.log("StockDocs:", stockDocs);

    const soon = expiringSoon(pantry, 2);
    const stockMap = buildStockMap(stockDocs);

    const ctx = { pantry, expiringSoon: soon, goals, timeMinutes, equipment, focusItems };
    const rawRecipe = await generateRecipeJSON(ctx);
    const recipe = RecipeSchema.parse(rawRecipe);
    const reconciled = reconcileWithStock(recipe, stockMap);

    // Auto-add expiry warnings
    const warnings = soon.map(e => `Use ${e.name} within ${e.daysLeft} day(s).`);
    reconciled.expiryWarnings = Array.from(new Set([...(reconciled.expiryWarnings || []), ...warnings]));

    res.status(200).json(reconciled);
  } catch (err) {
    console.error("Recipe generation error:", err);
    res.status(400).json({ error: "RECIPE_GENERATION_FAILED", detail: String(err) });
  }
});

export default router;
