import { useState, useMemo } from "react";
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { useEntries } from "../hooks/useEntries";
import type { EntryItem } from "../hooks/useEntries";
import { Search, Star, Edit3, Trash2, Filter, X, Plus } from "lucide-react";

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
    return `${format(date, 'EEEE, MMMM d, yyyy')} at ${timeStr}`;
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
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
      })).filter(entry => entry.items.length > 0);
    }

    return result;
  }, [entries, searchTerm, showStarredOnly, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearchTerm("");
    setShowStarredOnly(false);
    setDateFrom("");
    setDateTo("");
  };

  const activeFiltersCount = [searchTerm, showStarredOnly, dateFrom, dateTo].filter(Boolean).length;

  if (entries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white border border-stone-200 rounded-2xl p-8">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-stone-300 rounded-full border-dashed"></div>
          </div>
          
          <h2 className="text-xl font-medium text-stone-900 mb-2">
            Your journal is empty
          </h2>
          <p className="text-stone-600 mb-6">
            Start your gratitude practice by recording your first reflection
          </p>
          
          <button
            onClick={addFakeData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <Plus size={16} />
            Add Sample Entries
          </button>
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
    if (window.confirm(`Delete this reflection from ${displayDate.replace(" at ", "")}?`)) {
      deleteEntry(entryId);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-stone-900">Journal</h1>
          <p className="text-stone-600 mt-1">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'reflection' : 'reflections'}
            {activeFiltersCount > 0 && ` (filtered)`}
          </p>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${showFilters || activeFiltersCount > 0
              ? "bg-stone-900 text-white" 
              : "border border-stone-300 text-stone-700 hover:bg-stone-50"
            }
          `}
        >
          <Filter size={16} />
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-stone-700 text-xs px-1.5 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-stone-900">Filter Reflections</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search your reflections..."
                  className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              />
            </div>

            {/* Starred Only */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStarredOnly}
                  onChange={(e) => setShowStarredOnly(e.target.checked)}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                />
                <span className="text-sm font-medium text-stone-700">
                  Show only starred reflections
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Entries */}
      <div className="space-y-6">
        {filteredEntries.map((entry) => (
          <div key={entry.id} className="bg-white border border-stone-200 rounded-xl p-6">
            {/* Entry Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-stone-900">
                  {formatDisplayDate(entry.date, entry.time)}
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEditing(entry.id, entry.items)}
                  className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(entry.id, entry.date)}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Entry Items */}
            {editingId === entry.id ? (
              <div className="space-y-4">
                {editingItems.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-stone-700">
                        {index + 1}.
                      </label>
                      <button
                        onClick={() => toggleEditFavorite(index)}
                        className={`p-1 rounded transition-colors ${
                          item.favorite ? "text-amber-500" : "text-stone-300 hover:text-amber-400"
                        }`}
                      >
                        <Star size={16} fill={item.favorite ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <textarea
                      value={item.text}
                      onChange={(e) => handleEditChange(index, e.target.value)}
                      className="w-full p-3 border border-stone-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>
                ))}
                
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => saveEdit(entry.id, entry.date, entry.time)}
                    className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {entry.items.map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      item.favorite ? "bg-amber-50 border border-amber-200" : "bg-stone-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-stone-900 flex-1">{item.text}</p>
                      {item.favorite && (
                        <Star size={16} className="text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredEntries.length === 0 && entries.length > 0 && (
        <div className="text-center py-12">
          <p className="text-stone-600 mb-4">No reflections match your current filters</p>
          <button
            onClick={clearFilters}
            className="text-stone-900 hover:underline"
          >
            Clear filters to see all entries
          </button>
        </div>
      )}
    </div>
  );
}
