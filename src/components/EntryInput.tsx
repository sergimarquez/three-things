import { useState } from "react";
import { format } from "date-fns";

type EntryItem = {
  text: string;
  favorite?: boolean;
};

export default function EntryInput() {
  const [items, setItems] = useState<EntryItem[]>([
    { text: "" },
    { text: "" },
    { text: "" },
  ]);

  const handleChange = (index: number, value: string) => {
    const updated = [...items];
    updated[index].text = value;
    setItems(updated);
  };

  const toggleFavorite = (index: number) => {
    const updated = [...items];
    updated[index].favorite = !updated[index].favorite;
    setItems(updated);
  };

  const handleSubmit = () => {
    const entry = {
      date: format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm"),
      items,
    };

    const existing = JSON.parse(localStorage.getItem("three-things-entries") || "[]");
    localStorage.setItem("three-things-entries", JSON.stringify([entry, ...existing]));

    setItems([{ text: "" }, { text: "" }, { text: "" }]);
    // optionally lock here
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
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save Today's 3 Things
      </button>
    </div>
  );
}
