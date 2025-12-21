import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { useEntries, DATA_VERSION } from "../hooks/useEntries";
import type { EntryItem, Entry, MonthlyReflection } from "../hooks/useEntries";
import { Search, Star, Edit3, Trash2, Filter, Plus, Upload, Calendar } from "lucide-react";
import MonthlyReviewCard from "../components/MonthlyReviewCard";

export default function Archive() {
  const navigate = useNavigate();
  const {
    entries,
    updateEntry,
    deleteEntry,
    addFakeData,
    importEntries,
    importMonthlyReflections,
    importYearlyReviews,
    monthlyReflections,
    isLoading,
  } = useEntries();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItems, setEditingItems] = useState<EntryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showMonthlyReviews, setShowMonthlyReviews] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Mark initial load as complete after first render
  useEffect(() => {
    setIsInitialLoad(false);
  }, []);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search term - update debouncedSearchTerm 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Listen for monthly review updates to reload data
  useEffect(() => {
    const handleUpdate = () => {
      // Trigger hook to reload monthly reflections from localStorage
      window.dispatchEvent(new CustomEvent("reloadMonthlyReflections"));
    };
    window.addEventListener("monthlyReviewUpdated", handleUpdate);
    return () => window.removeEventListener("monthlyReviewUpdated", handleUpdate);
  }, []);

  const formatDisplayDate = (dateStr: string, timeStr: string) => {
    const date = parseISO(dateStr);
    return `${format(date, "EEEE, MMMM d, yyyy")} at ${timeStr}`;
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    let result = entries.filter((entry) => {
      // Search filter (using debounced search term)
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const matchesText = entry.items.some((item) =>
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
      result = result
        .map((entry) => ({
          ...entry,
          items: entry.items.filter((item) => item.favorite === true) as [
            EntryItem,
            EntryItem,
            EntryItem
          ],
        }))
        .filter((entry) => entry.items.length > 0);
    }

    return result;
  }, [entries, debouncedSearchTerm, showStarredOnly, dateFrom, dateTo]);

  // Get months needing review (memoized)
  const monthsNeedingReview = useMemo(() => {
    const today = new Date();
    const currentMonth = format(today, "yyyy-MM");

    const monthsWithEntries = new Set<string>();
    entries.forEach((entry) => {
      const month = format(parseISO(entry.date), "yyyy-MM");
      monthsWithEntries.add(month);
    });

    const monthsNeeding: string[] = [];
    monthsWithEntries.forEach((month) => {
      // Only include months that have ended (not the current month or future months)
      if (month >= currentMonth) return;

      const hasReflection = monthlyReflections.some((r) => r.month === month);
      if (!hasReflection) {
        monthsNeeding.push(month);
      }
    });

    // Sort newest first
    return monthsNeeding.sort((a, b) => b.localeCompare(a));
  }, [monthlyReflections, entries]);

  // Merge entries and monthly reviews chronologically
  const mergedItems = useMemo(() => {
    type MergedItem =
      | {
          type: "entry";
          date: string; // For sorting
          data: Entry;
        }
      | {
          type: "monthlyReview";
          date: string; // For sorting
          data: MonthlyReflection;
        };

    const items: MergedItem[] = [];

    // Add entries
    filteredEntries.forEach((entry) => {
      items.push({
        type: "entry",
        date: entry.date,
        data: entry,
      });
    });

    // Add monthly reviews (only if showMonthlyReviews is true)
    if (showMonthlyReviews) {
      monthlyReflections.forEach((reflection) => {
        // Use the first day of the month for sorting
        const monthDate = parseISO(`${reflection.month}-01`);
        items.push({
          type: "monthlyReview",
          date: format(monthDate, "yyyy-MM-dd"),
          data: reflection,
        });
      });
    }

    // Sort by date (newest first)
    return items.sort((a, b) => {
      const dateA = parseISO(a.date).getTime();
      const dateB = parseISO(b.date).getTime();
      return dateB - dateA;
    });
  }, [filteredEntries, monthlyReflections, showMonthlyReviews]);

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setShowStarredOnly(false);
    setDateFrom("");
    setDateTo("");
  };

  const activeFiltersCount = [searchTerm, showStarredOnly, dateFrom, dateTo].filter(Boolean).length;

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Validate the JSON structure
        if (!data.entries || !Array.isArray(data.entries)) {
          throw new Error("Invalid file format");
        }

        // Check version compatibility (optional, backward compatible)
        if (data.version) {
          const [major] = data.version.split(".").map(Number);
          const [currentMajor] = DATA_VERSION.split(".").map(Number);
          if (major > currentMajor) {
            throw new Error(
              `This backup is from a newer version (${data.version}). Please update the app to import it.`
            );
          }
        }

        // Import the entries
        const importedEntriesCount = importEntries(data.entries);

        // Import monthly reflections if they exist (backward compatible)
        let importedMonthlyCount = 0;
        if (data.monthlyReflections && Array.isArray(data.monthlyReflections)) {
          importedMonthlyCount = importMonthlyReflections(data.monthlyReflections);
        }

        // Import yearly reviews if they exist (backward compatible)
        let importedYearlyCount = 0;
        if (data.yearlyReviews && Array.isArray(data.yearlyReviews)) {
          importedYearlyCount = importYearlyReviews(data.yearlyReviews);
        }

        // Build success message
        const parts: string[] = [];
        if (importedEntriesCount > 0) {
          parts.push(
            `${importedEntriesCount} ${importedEntriesCount === 1 ? "reflection" : "reflections"}`
          );
        }
        if (importedMonthlyCount > 0) {
          parts.push(
            `${importedMonthlyCount} ${
              importedMonthlyCount === 1 ? "monthly review" : "monthly reviews"
            }`
          );
        }
        if (importedYearlyCount > 0) {
          parts.push(
            `${importedYearlyCount} ${
              importedYearlyCount === 1 ? "yearly review" : "yearly reviews"
            }`
          );
        }

        if (parts.length > 0) {
          setImportStatus({
            type: "success",
            message: `Successfully imported ${parts.join(", ")}`,
          });
        } else {
          setImportStatus({
            type: "success",
            message: "No new data to import (all items already exist)",
          });
        }

        // Clear the status after 5 seconds
        setTimeout(() => setImportStatus(null), 5000);
      } catch {
        setImportStatus({
          type: "error",
          message: "Failed to import file. Please ensure it's a valid 3Good JSON export.",
        });
        setTimeout(() => setImportStatus(null), 5000);
      }
    };

    reader.readAsText(file);
    // Reset the input
    event.target.value = "";
  };

  // Show loading state while data is being loaded from localStorage
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-[fadeIn_0.3s_ease-out]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-stone-600">Loading your journal...</p>
          </div>
        </div>
      </div>
    );
  }

  // Only show empty state after loading is complete
  if (entries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center animate-[fadeIn_0.3s_ease-out]">
        <div className="bg-white border border-stone-200 rounded-2xl p-8">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-stone-300 rounded-full border-dashed"></div>
          </div>

          <h2 className="text-xl font-medium text-stone-900 mb-2">Your journal is empty</h2>
          <p className="text-stone-600 mb-6">
            Start your gratitude practice by recording your first reflection, or import from a
            backup
          </p>

          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={handleImport}
              className="inline-flex items-center gap-2 px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
            >
              <Upload size={16} />
              Import Backup
            </button>

            <button
              onClick={addFakeData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
            >
              <Plus size={16} />
              Add Sample Entries
            </button>
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
    const entry = entries.find((e) => e.id === entryId);
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
    <div className="max-w-4xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-stone-900">Journal</h1>
          <p className="text-stone-600 mt-1">
            {mergedItems.length} {mergedItems.length === 1 ? "item" : "items"}
            {activeFiltersCount > 0 && ` (filtered)`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleImport}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <Upload size={16} />
            Import
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                showFilters || activeFiltersCount > 0
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
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Import Status */}
      {importStatus && (
        <div
          className={`
          mb-6 p-4 rounded-lg border
          ${
            importStatus.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }
        `}
        >
          {importStatus.message}
        </div>
      )}

      {/* Months Needing Review (if any) */}
      {!isInitialLoad && monthsNeedingReview.length > 0 && (
        <div className="mb-6 p-4 bg-stone-50 border border-stone-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-stone-600" />
              <h3 className="font-medium text-stone-900">Create Monthly Reviews</h3>
            </div>
          </div>
          <p className="text-sm text-stone-600 mb-3">
            You have months with entries that don't have reviews yet:
          </p>
          <div className="flex flex-wrap gap-2">
            {monthsNeedingReview.map((month) => (
              <button
                key={month}
                onClick={() => navigate(`/monthly-review/${month}`)}
                className="px-3 py-1.5 text-sm bg-white border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
              >
                {format(parseISO(`${month}-01`), "MMMM yyyy")}
              </button>
            ))}
          </div>
        </div>
      )}

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
              <label className="block text-sm font-medium text-stone-700 mb-2">Search</label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400"
                />
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
              <label className="block text-sm font-medium text-stone-700 mb-2">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">To Date</label>
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

            {/* Show Monthly Reviews */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMonthlyReviews}
                  onChange={(e) => setShowMonthlyReviews(e.target.checked)}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                />
                <span className="text-sm font-medium text-stone-700">Show monthly reviews</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Entries and Monthly Reviews */}
      <div className="space-y-6">
        {mergedItems.map((item) => {
          if (item.type === "monthlyReview") {
            return <MonthlyReviewCard key={item.data.id} reflection={item.data} />;
          } else {
            const entry = item.data;
            return (
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
                          <label className="text-sm font-medium text-stone-700">{index + 1}.</label>
                          <button
                            onClick={() => toggleEditFavorite(index)}
                            className={`p-1 rounded transition-colors ${
                              item.favorite
                                ? "text-amber-500"
                                : "text-stone-300 hover:text-amber-400"
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
                    {entry.items.map((item: EntryItem, index: number) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          item.favorite ? "bg-amber-50 border border-amber-200" : "bg-stone-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-stone-900 flex-1">{item.text}</p>
                          {item.favorite && (
                            <Star
                              size={16}
                              className="text-amber-500 mt-0.5 flex-shrink-0"
                              fill="currentColor"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }
        })}
      </div>

      {mergedItems.length === 0 && entries.length > 0 && (
        <div className="text-center py-12">
          <p className="text-stone-600 mb-4">No reflections match your current filters</p>
          <button onClick={clearFilters} className="text-stone-900 hover:underline">
            Clear filters to see all entries
          </button>
        </div>
      )}
    </div>
  );
}
