import { useState } from 'react';
import RecipeLauncherButton from "./RecipeLauncherButton";
import RecipeDrawer from "./RecipeDrawer";

export default function RecipesPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <RecipeLauncherButton onOpen={() => setOpen(true)} />
      <RecipeDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
