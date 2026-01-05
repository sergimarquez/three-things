import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { useEntries } from "../hooks/useEntries";
import type { EntryItem, Entry } from "../hooks/useEntries";
import { Star, X, Check } from "lucide-react";

type Props = {
  month: string; // Format: "2024-01"
  onClose: () => void;
  onSave: () => void;
};

export default function MonthlyReview({ month, onClose, onSave }: Props) {
  const {
    entries,
    getEntriesForMonth,
    getStarredItemsForMonth,
    getMonthlyReflection,
    saveMonthlyReflection,
    updateEntry,
  } = useEntries();

  const monthEntries = getEntriesForMonth(month);
  const starredItems = getStarredItemsForMonth(month);
  const existingReflection = getMonthlyReflection(month);

  const [selectedFavorites, setSelectedFavorites] = useState<string[]>(
    existingReflection?.selectedFavorites || []
  );
  const [reflectionText, setReflectionText] = useState(existingReflection?.reflectionText || "");
  const [viewMode, setViewMode] = useState<"all" | "starred">("all");

  // Memoize longest streak calculation - only recalculate when monthEntries change
  const longestStreak = useMemo(() => calculateLongestStreak(monthEntries), [monthEntries]);

  // Calculate stats (memoized values)
  const stats = useMemo(
    () => ({
      daysPracticed: monthEntries.length,
      totalItems: monthEntries.length * 3,
      starredCount: starredItems.length,
      longestStreak,
    }),
    [monthEntries.length, starredItems.length, longestStreak]
  );

  function calculateLongestStreak(entries: Entry[]) {
    if (entries.length === 0) return 0;

    const sorted = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sorted.length; i++) {
      const prevDate = parseISO(sorted[i - 1].date);
      const currDate = parseISO(sorted[i].date);
      const daysDiff = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }

  const toggleItemStar = (entryId: string, itemIndex: number) => {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    const updatedItems = [...entry.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      favorite: !updatedItems[itemIndex].favorite,
    };

    updateEntry(entryId, {
      date: entry.date,
      time: entry.time,
      items: updatedItems as [EntryItem, EntryItem, EntryItem],
    });

    // If unstarring an item that was selected as a favorite, remove it from selection
    if (updatedItems[itemIndex].favorite === false) {
      const key = `${entryId}-${itemIndex}`;
      setSelectedFavorites((prev) => prev.filter((k) => k !== key));
    }
  };

  const toggleFavorite = (entryId: string, itemIndex: number) => {
    const key = `${entryId}-${itemIndex}`;
    setSelectedFavorites((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      } else if (prev.length < 5) {
        return [...prev, key];
      }
      return prev;
    });
  };

  const handleSave = () => {
    saveMonthlyReflection({
      month,
      selectedFavorites,
      reflectionText: reflectionText.trim(),
    });
    // Dispatch event immediately to notify other components
    window.dispatchEvent(new CustomEvent("monthlyReviewUpdated"));
    // Small delay to ensure state updates before calling onSave
    setTimeout(() => {
      onSave();
    }, 100);
  };

  const monthDate = parseISO(`${month}-01`);
  const monthName = format(monthDate, "MMMM yyyy");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-8 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-medium text-stone-900">Review {monthName}</h2>
            <p className="text-stone-600 mt-1">Select your 5 favorite moments from this month</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-stone-50 rounded-lg p-4">
            <div className="text-2xl font-semibold text-stone-900">{stats.daysPracticed}</div>
            <div className="text-sm text-stone-600">Days practiced</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-4">
            <div className="text-2xl font-semibold text-stone-900">{starredItems.length}</div>
            <div className="text-sm text-stone-600">Starred moments</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-4">
            <div className="text-2xl font-semibold text-stone-900">{stats.longestStreak}</div>
            <div className="text-sm text-stone-600">Longest streak</div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={() => setViewMode("all")}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                viewMode === "all"
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }
            `}
          >
            All Entries
          </button>
          <button
            onClick={() => setViewMode("starred")}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                viewMode === "starred"
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }
            `}
          >
            Starred Only
          </button>
        </div>

        {/* All Entries View - Review and Star Items */}
        {viewMode === "all" && (
          <div className="mb-8">
            <h3 className="font-medium text-stone-900 mb-2">
              Review your month ({monthEntries.length} {monthEntries.length === 1 ? "day" : "days"})
            </h3>
            <p className="text-sm text-stone-600 mb-4">
              Go through your entries and star the moments you want to consider for your top 5
              favorites
            </p>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {monthEntries.map((entry) => {
                const entryDate = format(parseISO(entry.date), "EEEE, MMMM d");
                return (
                  <div
                    key={entry.id}
                    className="bg-stone-50 rounded-lg p-4 border border-stone-200"
                  >
                    <div className="text-xs font-medium text-stone-600 mb-3">{entryDate}</div>
                    <div className="space-y-2">
                      {entry.items.map((item, itemIndex) => {
                        const isStarred = item.favorite === true;
                        return (
                          <div
                            key={itemIndex}
                            className={`
                              flex items-start gap-3 p-3 rounded-lg transition-colors
                              ${
                                isStarred
                                  ? "bg-amber-50 border border-amber-200"
                                  : "bg-white border border-stone-200"
                              }
                            `}
                          >
                            <div className="flex-1">
                              <p className="text-stone-900 text-sm">{item.text}</p>
                            </div>
                            <button
                              onClick={() => toggleItemStar(entry.id, itemIndex)}
                              className={`
                                p-1.5 rounded transition-colors flex-shrink-0
                                ${
                                  isStarred
                                    ? "text-amber-500 hover:text-amber-600"
                                    : "text-stone-300 hover:text-amber-400"
                                }
                              `}
                              title={isStarred ? "Unstar this moment" : "Star this moment"}
                            >
                              <Star size={18} fill={isStarred ? "currentColor" : "none"} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Starred Items Selection - Choose Top 5 */}
        {viewMode === "starred" && (
          <div className="mb-8">
            <h3 className="font-medium text-stone-900 mb-2">
              Choose your favorites ({selectedFavorites.length}/5)
            </h3>
            <p className="text-sm text-stone-600 mb-4">
              Select your top 5 favorite moments from this month's starred entries
            </p>
            {starredItems.length === 0 ? (
              <div className="text-center py-8 bg-stone-50 rounded-lg border border-stone-200">
                <p className="text-stone-600 mb-2">No starred moments yet</p>
                <p className="text-sm text-stone-500">
                  Switch to "All Entries" view to star some moments first
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {starredItems.map((item) => {
                  const key = `${item.entryId}-${item.itemIndex}`;
                  const isSelected = selectedFavorites.includes(key);
                  const entry = monthEntries.find((e) => e.id === item.entryId);
                  const entryDate = entry ? format(parseISO(entry.date), "MMM d") : "";

                  return (
                    <button
                      key={key}
                      onClick={() => toggleFavorite(item.entryId, item.itemIndex)}
                      disabled={!isSelected && selectedFavorites.length >= 5}
                      className={`
                        w-full text-left p-4 rounded-lg border-2 transition-all
                        ${
                          isSelected
                            ? "border-amber-400 bg-amber-50"
                            : selectedFavorites.length >= 5
                            ? "border-stone-200 bg-stone-50 opacity-50 cursor-not-allowed"
                            : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="text-xs text-stone-500 mb-1">{entryDate}</div>
                          <p className="text-stone-900">{item.text}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                              <Check size={14} className="text-white" />
                            </div>
                          ) : (
                            <Star size={20} className="text-amber-400" fill="currentColor" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Reflection Text */}
        <div className="mb-6">
          <label className="block font-medium text-stone-900 mb-2">
            Monthly Reflection (optional)
          </label>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="What patterns do you notice this month? What stood out most?"
            className="w-full p-4 border border-stone-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={selectedFavorites.length === 0}
            className={`
              flex-1 px-6 py-3 rounded-lg font-medium transition-colors
              ${
                selectedFavorites.length === 0
                  ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                  : "bg-stone-900 text-white hover:bg-stone-800"
              }
            `}
          >
            Save Review
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
