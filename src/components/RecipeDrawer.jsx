// RecipeDrawer.jsx
import { useState } from 'react';

export default function RecipeDrawer({ open, onClose }) {
  const [teamId, setTeamId] = useState('');
  const [goals, setGoals] = useState(['high-protein']);
  const [timeMinutes, setTimeMinutes] = useState(20);
  const [equipment, setEquipment] = useState(['stovetop']);
  const [focusItems, setFocusItems] = useState(['dal', 'bread']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recipe, setRecipe] = useState(null);

  const parseCSV = (val) =>
    val.split(',').map(s => s.trim()).filter(Boolean);

  async function generateRecipe() {
    setLoading(true);
    setError('');
    setRecipe(null);
    try {
      const res = await fetch('/recipes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          goals,
          timeMinutes,
          equipment,
          focusItems
        })
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setRecipe(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="w-full md:w-[520px] bg-white border-l shadow-xl ml-auto flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Smart Recipe Architect</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>Close</button>
        </div>

        <div className="p-4 space-y-3 border-b">
          <label className="block text-sm font-medium">Team ID (ObjectId)</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="694a0630c49629c948590290"
            value={teamId}
            onChange={e => setTeamId(e.target.value)}
          />

          <label className="block text-sm font-medium">Goals (comma-separated)</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={goals.join(',')}
            onChange={e => setGoals(parseCSV(e.target.value))}
          />

          <label className="block text-sm font-medium">Time minutes</label>
          <input
            type="number"
            min={5}
            className="w-full border rounded px-3 py-2"
            value={timeMinutes}
            onChange={e => setTimeMinutes(Number(e.target.value))}
          />

          <label className="block text-sm font-medium">Equipment (comma-separated)</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={equipment.join(',')}
            onChange={e => setEquipment(parseCSV(e.target.value))}
          />

          <label className="block text-sm font-medium">Focus items (comma-separated)</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={focusItems.join(',')}
            onChange={e => setFocusItems(parseCSV(e.target.value))}
          />

          <div className="flex gap-2 pt-2">
            <button
              className="rounded bg-indigo-600 text-white px-4 py-2 disabled:opacity-50"
              onClick={generateRecipe}
              disabled={loading || !teamId}
            >
              {loading ? 'Generating…' : 'Generate recipe'}
            </button>
            <button
              className="rounded border px-4 py-2"
              onClick={() => { setRecipe(null); setError(''); }}
            >
              Reset
            </button>
          </div>

          {error && (
            <div className="mt-2 text-sm text-red-600">
              Error: {error}
            </div>
          )}
        </div>

        <div className="p-4 overflow-y-auto">
          {!recipe && !loading && !error && (
            <p className="text-sm text-gray-500">Fill the form and click “Generate recipe”.</p>
          )}

          {recipe && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{recipe.title}</h3>
                <p className="text-gray-600">Time: {recipe.timeMinutes} minutes</p>
              </div>

              <div>
                <h4 className="font-semibold">Ingredients</h4>
                <ul className="list-disc pl-6">
                  {recipe.ingredients?.map((ing, idx) => (
                    <li key={idx}>
                      <span className="font-medium">{ing.name}</span>{' '}
                      — {ing.quantity} {ing.unit}
                      {ing.note ? ` (${ing.note})` : ''}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold">Steps</h4>
                <ol className="list-decimal pl-6">
                  {recipe.steps?.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ol>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h5 className="font-semibold">Nutrition</h5>
                  <p>Kcal: {recipe.nutritionEstimate?.kcal}</p>
                  <p>Protein: {recipe.nutritionEstimate?.protein_g} g</p>
                  <p>Fiber: {recipe.nutritionEstimate?.fiber_g} g</p>
                </div>

                <div>
                  <h5 className="font-semibold">Expiry warnings</h5>
                  {recipe.expiryWarnings?.length ? (
                    <ul className="list-disc pl-5">
                      {recipe.expiryWarnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  ) : <p className="text-gray-500">None</p>}
                </div>

                <div>
                  <h5 className="font-semibold">Buy list</h5>
                  {recipe.buyList?.length ? (
                    <ul className="list-disc pl-5">
                      {recipe.buyList.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  ) : <p className="text-gray-500">Empty</p>}
                </div>
              </div>

              {recipe.issues?.length > 0 && (
                <div>
                  <h4 className="font-semibold">Notes</h4>
                  <ul className="list-disc pl-6">
                    {recipe.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* backdrop */}
      <div className="flex-1 bg-black/30" onClick={onClose} />
    </div>
  );
}
