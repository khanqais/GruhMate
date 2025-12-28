import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useStock } from "../context/StockContext";

export default function RecipeDrawer({ open, onClose }) {
  const { currentUser } = useAuth();
  const { stocks } = useStock();

 
const teamId = currentUser?.team || null;

  const [goals, setGoals] = useState("");
  const [timeMinutes, setTimeMinutes] = useState(20);
  const [equipment, setEquipment] = useState("");
  const [focusItems, setFocusItems] = useState("");

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
  useEffect(() => {
    if (!stocks || stocks.length === 0) {
      setFocusItems("");
      return;
    }
    setFocusItems(stocks.map(s => s.name).join(","));
  }, [stocks]);

  async function generateRecipe() {
    if (!teamId) {
      setError("Team ID not found. Please login again.");
      return;
    }

    setLoading(true);
    setError("");
    setRecipe(null);

    try {
      const res = await fetch(
        "http://localhost:5000/api/recipes/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamId,
            goals: goals.split(",").map(g => g.trim()).filter(Boolean),
            timeMinutes: Number(timeMinutes),
            equipment: equipment.split(",").map(e => e.trim()).filter(Boolean),
            focusItems: focusItems.split(",").map(f => f.trim()).filter(Boolean),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Recipe generation failed");
      }

      setRecipe(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="w-full md:w-[520px] bg-white shadow-xl ml-auto flex flex-col">
        {/* HEADER */}
        <div className="p-4 border-b flex justify-between">
          <h2 className="text-lg font-semibold">Smart Recipe Architect</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* FORM */}
        <div className="p-4 space-y-4 border-b">
          {!teamId && (
            <p className="text-red-600 text-sm">
              ❌ Team ID missing (auth not loaded)
            </p>
          )}

          <div>
            <label className="text-sm font-medium">Goals</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="high-protein, low-carb"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Time (minutes)</label>
            <input
              type="number"
              min={1}
              className="w-full border rounded px-3 py-2"
              value={timeMinutes}
              onChange={(e) => setTimeMinutes(Number(e.target.value))}

            />
          </div>

          <div>
            <label className="text-sm font-medium">Equipment</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="stovetop, oven"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Focus Items (auto from stock)
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              value={focusItems}
              onChange={(e) => setFocusItems(e.target.value)}
            />
          </div>

          <button
            className="w-full bg-indigo-600 text-white rounded py-2 disabled:opacity-50"
            onClick={generateRecipe}
            disabled={loading || !teamId}
          >
            {loading ? "Generating..." : "Generate Recipe"}
          </button>

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        {/* RESULT */}
        <div className="p-4 overflow-y-auto">
          {recipe && (
            <>
              <h3 className="text-xl font-bold">{recipe.title}</h3>
              <p className="text-gray-500">⏱ {recipe.timeMinutes} mins</p>

              <h4 className="mt-4 font-semibold">Ingredients</h4>
              <ul className="list-disc pl-5">
                {recipe.ingredients.map((i, idx) => (
                  <li key={idx}>
                    {i.name} — {i.quantity} {i.unit}
                  </li>
                ))}
              </ul>

              <h4 className="mt-4 font-semibold">Steps</h4>
              <ol className="list-decimal pl-5">
                {recipe.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 bg-black/30" onClick={onClose} />
    </div>
  );
}
