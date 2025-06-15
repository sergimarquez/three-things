import { useState } from "react";
import { format, parseISO } from "date-fns";
import { useEntries } from "../hooks/useEntries";
import type { EntryItem } from "../hooks/useEntries";

export default function Archive() {
  const { entries, updateEntry, deleteEntry } = useEntries();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItems, setEditingItems] = useState<EntryItem[]>([]);

  const formatDisplayDate = (dateStr: string, timeStr: string) => {
    const date = parseISO(dateStr);
    return `${format(date, 'd MMMM yyyy')} at ${timeStr}`;
  };

  if (entries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Journal</h1>
        <p className="text-gray-600">No entries yet. Go to Home to add your first entry!</p>
      </div>
    );
  }

  const startEditing = (entryId: string, items: EntryItem[]) => {
    setEditingId(entryId);
    setEditingItems([...items]);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingItems([]);
  };

  const saveEdit = (entryId: string, originalDate: string, originalTime: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      updateEntry(entryId, {
        date: originalDate,
        time: originalTime,
        items: editingItems as [EntryItem, EntryItem, EntryItem],
      });
    }
    setEditingId(null);
    setEditingItems([]);
  };

  const handleEditChange = (index: number, value: string) => {
    const updated = [...editingItems];
    updated[index].text = value;
    setEditingItems(updated);
  };

  const toggleEditFavorite = (index: number) => {
    const updated = [...editingItems];
    updated[index].favorite = !updated[index].favorite;
    setEditingItems(updated);
  };

  const handleDelete = (entryId: string, date: string) => {
    const displayDate = formatDisplayDate(date, "");
    if (window.confirm(`Are you sure you want to delete the entry from ${displayDate.replace(" at ", "")}? This action cannot be undone.`)) {
      deleteEntry(entryId);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Journal</h1>
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="text-sm text-gray-500">
                {formatDisplayDate(entry.date, entry.time)}
              </div>
              
              {editingId !== entry.id && (
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(entry.id, entry.items)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id, entry.date)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {editingId === entry.id ? (
              // Edit mode
              <div className="space-y-3">
                {editingItems.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-2">
                    <button
                      onClick={() => toggleEditFavorite(itemIndex)}
                      className={`text-xl ${item.favorite ? "text-yellow-500" : "text-gray-400"}`}
                    >
                      ★
                    </button>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => handleEditChange(itemIndex, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Thing ${itemIndex + 1}`}
                    />
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => saveEdit(entry.id, entry.date, entry.time)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View mode
              <div className="space-y-2">
                {entry.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start gap-2">
                    <span className={`text-lg ${item.favorite ? "text-yellow-500" : "text-gray-300"}`}>
                      ★
                    </span>
                    <span className={`text-gray-800 ${item.favorite ? "font-semibold" : ""}`}>
                      {item.text || `Thing ${itemIndex + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
