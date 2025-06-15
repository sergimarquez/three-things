import { useState } from "react";
import { format } from "date-fns";
import { useEntries } from "../hooks/useEntries";
import type { EntryItem } from "../hooks/useEntries";

export default function EntryInput() {
  const { saveEntry, hasTodayEntry } = useEntries();
  const [items, setItems] = useState<EntryItem[]>([
    { text: "" },
    { text: "" },
    { text: "" },
  ]);

  const handleChange = (i: number, val: string) => {
    const updated = [...items];
    updated[i].text = val;
    setItems(updated);
  };

  const toggleFavorite = (i: number) => {
    const updated = [...items];
    updated[i].favorite = !updated[i].favorite;
    setItems(updated);
  };

  const handleSubmit = () => {
    const now = new Date();
    saveEntry({
      date: format(now, "yyyy-MM-dd"),
      time: format(now, "HH:mm"),
      items: items as [EntryItem, EntryItem, EntryItem],
    });
    setItems([{ text: "" }, { text: "" }, { text: "" }]);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">What was good today?</h2>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(i)}
            className={`text-xl ${item.favorite ? "text-yellow-500" : "text-gray-400"}`}
          >
            ★
          </button>
          <input
            type="text"
            value={item.text}
            onChange={(e) => handleChange(i, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder={`Thing ${i + 1}`}
          />
        </div>
      ))}
      {!hasTodayEntry() && (
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Today's 3 Things
        </button>
      )}
      {hasTodayEntry() && (
        <p className="text-green-600 font-medium">✅ You've already submitted today's entry</p>
      )}
    </div>
  );
}
