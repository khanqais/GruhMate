import { SparklesIcon } from '@heroicons/react/24/outline';

export default function RecipeLauncherButton({ onOpen }) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-md border px-3 py-2 hover:bg-gray-50"
      onClick={onOpen}
      aria-label="Open Smart Recipe"
    >
      <SparklesIcon className="h-5 w-5 text-indigo-600" />
      <span>Smart Recipe</span>
    </button>
  );
}
