import { useState, useMemo } from "react";
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { useEntries } from "../hooks/useEntries";
import type { EntryItem } from "../hooks/useEntries";

export default function Archive() {
  const { entries, updateEntry, deleteEntry, addFakeData } = useEntries();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItems, setEditingItems] = useState<EntryItem[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const formatDisplayDate = (dateStr: string, timeStr: string) => {
    const date = parseISO(dateStr);
    return `${format(date, 'd MMMM yyyy')} at ${timeStr}`;
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    console.log("Filtering entries:", { 
      totalEntries: entries.length, 
      showStarredOnly, 
      searchTerm, 
      dateFrom, 
      dateTo 
    });
    
    let result = entries.filter(entry => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesText = entry.items.some(item => 
          item.text.toLowerCase().includes(searchLower)
        );
        if (!matchesText) return false;
      }

      // Date range filter
      if (dateFrom) {
        const entryDate = parseISO(entry.date);
        const fromDate = startOfDay(parseISO(dateFrom));
        if (isBefore(entryDate, fromDate)) return false;
      }

      if (dateTo) {
        const entryDate = parseISO(entry.date);
        const toDate = endOfDay(parseISO(dateTo));
        if (isAfter(entryDate, toDate)) return false;
      }

      return true;
    });

    // If showing starred only, filter the items within each entry
    if (showStarredOnly) {
      result = result.map(entry => ({
        ...entry,
        items: entry.items.filter(item => item.favorite === true) as [EntryItem, EntryItem, EntryItem]
      })).filter(entry => entry.items.length > 0); // Remove entries with no starred items
    }

    return result;
  }, [entries, searchTerm, showStarredOnly, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearchTerm("");
    setShowStarredOnly(false);
    setDateFrom("");
    setDateTo("");
  };

  if (entries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Journal</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-gray-600 mb-3">No entries yet. You can:</p>
          <div className="flex gap-3">
            <button
              onClick={addFakeData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Sample Data
            </button>
            <span className="text-gray-500">or go to Home to add your first entry!</span>
          </div>
        </div>
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
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Journal</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            Filters
            {(searchTerm || showStarredOnly || dateFrom || dateTo) && (
              <span className="bg-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                {[searchTerm, showStarredOnly, dateFrom, dateTo].filter(Boolean).length}
              </span>
            )}
          </button>
          {entries.length > 0 && (
            <button
              onClick={addFakeData}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Add Sample Data
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        showFilters ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'
      }`}>
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 transform transition-transform duration-300">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in your entries..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Starred Filter */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showStarredOnly}
                onChange={(e) => setShowStarredOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                ⭐ Show only starred entries
              </span>
            </label>

            {/* Clear Filters */}
            {(searchTerm || showStarredOnly || dateFrom || dateTo) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:bg-blue-50 rounded"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-600 transition-all duration-300">
            Showing {filteredEntries.length} of {entries.length} entries
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredEntries.map((entry, index) => (
          <div 
            key={entry.id} 
            className="group bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.01] animate-fadeIn"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="text-sm text-gray-500 transition-colors duration-200">
                {formatDisplayDate(entry.date, entry.time)}
              </div>
              
              {editingId !== entry.id && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => startEditing(entry.id, entry.items)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-all duration-200 hover:bg-blue-50 px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id, entry.date)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium transition-all duration-200 hover:bg-red-50 px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <div className="transition-all duration-300 ease-in-out">
              {editingId === entry.id ? (
                // Edit mode
                <div className="space-y-3 animate-slideIn">
                  {editingItems.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2 group">
                      <button
                        onClick={() => toggleEditFavorite(itemIndex)}
                        className={`text-xl transition-all duration-300 transform hover:scale-125 ${
                          item.favorite ? "text-yellow-500 drop-shadow-sm" : "text-gray-400 hover:text-yellow-400"
                        }`}
                      >
                        ★
                      </button>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => handleEditChange(itemIndex, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 focus:border-blue-500"
                        placeholder={`Thing ${itemIndex + 1}`}
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => saveEdit(entry.id, entry.date, entry.time)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="space-y-2">
                  {entry.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start gap-2 group hover:bg-gray-50 p-2 rounded transition-all duration-200">
                      <span className={`text-lg transition-all duration-300 ${
                        item.favorite ? "text-yellow-500 drop-shadow-sm" : "text-gray-300"
                      }`}>
                        ★
                      </span>
                      <span className={`text-gray-800 transition-all duration-200 ${
                        item.favorite ? "font-semibold" : ""
                      }`}>
                        {item.text || `Thing ${itemIndex + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
