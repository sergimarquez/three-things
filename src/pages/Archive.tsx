import { useEntries } from "../hooks/useEntries";

export default function Archive() {
  const { entries } = useEntries();

  if (entries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Archive</h1>
        <p className="text-gray-600">No entries yet. Go to Home to add your first entry!</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Archive</h1>
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-3">
              {entry.date} at {entry.time}
            </div>
            <div className="space-y-2">
              {entry.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-start gap-2">
                  <span className={`text-lg ${item.favorite ? "text-yellow-500" : "text-gray-300"}`}>
                    ★
                  </span>
                  <span className="text-gray-800">{item.text || `Thing ${itemIndex + 1}`}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
