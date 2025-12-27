// services/validators.js
import { z } from "zod";

export const RecipeSchema = z.object({
  title: z.string().min(2),
  timeMinutes: z.number().int().min(1),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.number().min(0),
    unit: z.string(),
    note: z.string().optional()
  })),
  steps: z.array(z.string()).min(1).max(10),
  nutritionEstimate: z.object({
    kcal: z.number().min(0),
    protein_g: z.number().min(0),
    fiber_g: z.number().min(0)
  }),
  expiryWarnings: z.array(z.string()).default([]),
  buyList: z.array(z.string()).default([]),
  issues: z.array(z.string()).default([])
});

/**
 * Reconcile recipe ingredients against actual stock.
 * - Ensures pantry items are always reflected correctly.
 * - Scales down quantities if Gemini overshoots.
 * - Adds missing items to buyList.
 * - Normalizes units and names.
 * - Guarantees at least one ingredient if pantry has focus items.
 */
export function reconcileWithStock(recipe, stockMap) {
  const issues = [];

  // Normalize ingredients
  recipe.ingredients = recipe.ingredients.map(ing => {
    const key = ing.name.toLowerCase().trim();
    const stock = stockMap[key];

    if (!stock || stock.quantity <= 0) {
      // Not in stock
      if (!recipe.buyList.includes(ing.name)) {
        recipe.buyList.push(ing.name);
      }
      issues.push(`Missing: ${ing.name}`);
      return {
        ...ing,
        quantity: 0,
        unit: stock?.unit || ing.unit || "unit",
        note: "Not in stock; added to buyList."
      };
    }

    // Scale down if Gemini overshot
    if (ing.quantity > stock.quantity) {
      issues.push(`Scaled: ${ing.name} from ${ing.quantity} to ${stock.quantity}`);
      return {
        ...ing,
        quantity: stock.quantity,
        unit: stock.unit,
        note: `Scaled to available (${stock.quantity} ${stock.unit}).`
      };
    }

    // Auto-fill if Gemini left quantity 0
    if (ing.quantity === 0 && stock.quantity > 0) {
      issues.push(`Auto-filled: ${ing.name} set to ${stock.quantity}`);
      return {
        ...ing,
        quantity: stock.quantity,
        unit: stock.unit,
        note: "Auto-filled from pantry stock."
      };
    }

    // Normal case
    return { ...ing, unit: stock.unit };
  });

  // If Gemini returned empty ingredients but pantry has stock, auto-fill focus items
  if (recipe.ingredients.length === 0 && Object.keys(stockMap).length > 0) {
    const fallback = Object.entries(stockMap).map(([name, stock]) => ({
      name,
      quantity: stock.quantity,
      unit: stock.unit,
      note: "Auto-added from pantry because Gemini returned empty."
    }));
    recipe.ingredients = fallback;
    issues.push("Ingredients were empty; auto-filled from pantry.");
  }

  recipe.issues = [...(recipe.issues || []), ...issues];
  return recipe;
}
