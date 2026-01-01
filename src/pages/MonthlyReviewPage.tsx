import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useEntries } from "../hooks/useEntries";
import type { EntryItem } from "../hooks/useEntries";
import { Star, Check, ArrowLeft, Loader2 } from "lucide-react";

export default function MonthlyReviewPage() {
  const { month } = useParams<{ month: string }>();
  const navigate = useNavigate();

  if (!month) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-stone-600">Invalid month parameter</p>
        <Link to="/archive" className="text-stone-900 hover:underline mt-4 inline-block">
          Back to Archive
        </Link>
      </div>
    );
  }

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
  const [viewMode, setViewMode] = useState<"review" | "select">("select");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Calculate stats
  const stats = {
    daysPracticed: monthEntries.length,
    totalItems: monthEntries.length * 3,
    starredCount: starredItems.length,
    longestStreak: calculateLongestStreak(monthEntries),
  };

  function calculateLongestStreak(entries: any[]) {
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

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    setIsSaved(false);

    // Simulate a small delay to show saving state (save is instant, but UX feels better)
    await new Promise((resolve) => setTimeout(resolve, 500));

    saveMonthlyReflection({
      month,
      selectedFavorites,
      reflectionText: reflectionText.trim(),
    });

    setIsSaving(false);
    setIsSaved(true);
    setSaveMessage("Monthly review saved!");

    // Navigate after showing success message
    setTimeout(() => {
      navigate("/archive");
    }, 2000);
  };

  const monthDate = parseISO(`${month}-01`);
  const monthName = format(monthDate, "MMMM yyyy");

  return (
    <div className="max-w-4xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/archive"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Journal
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium text-stone-900">Monthly Review: {monthName}</h1>
            <p className="text-stone-600 mt-2">
              Select your top 5 favorite moments from this month
            </p>
          </div>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
          <Check size={20} className="text-green-600 flex-shrink-0" />
          <span className="font-medium">{saveMessage}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-2xl font-semibold text-stone-900">{stats.daysPracticed}</div>
          <div className="text-sm text-stone-600">Days practiced</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-2xl font-semibold text-stone-900">{stats.totalItems}</div>
          <div className="text-sm text-stone-600">Total moments</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-2xl font-semibold text-stone-900">{starredItems.length}</div>
          <div className="text-sm text-stone-600">Starred moments</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-2xl font-semibold text-stone-900">{stats.longestStreak}</div>
          <div className="text-sm text-stone-600">Longest streak</div>
        </div>
      </div>

      {/* Optional: Review All Entries */}
      {viewMode === "review" && (
        <div className="mb-8">
          <div className="bg-white border border-stone-200 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-medium text-stone-900 mb-2">Review & Star Entries</h2>
                <p className="text-stone-600">
                  Go through all your entries from {monthName} and star the moments you want to
                  consider. You can star as many as you'd like.
                </p>
              </div>
              <button
                onClick={() => setViewMode("select")}
                className="px-4 py-2 text-sm border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors whitespace-nowrap"
              >
                Back to Select Favorites
              </button>
            </div>
            {starredItems.length > 0 && (
              <div className="mt-4 pt-4 border-t border-stone-200">
                <p className="text-sm text-stone-600 mb-3">
                  You've starred <strong className="text-stone-900">{starredItems.length}</strong>{" "}
                  moment{starredItems.length !== 1 ? "s" : ""} so far.
                </p>
                {starredItems.length >= 5 && (
                  <button
                    onClick={() => setViewMode("select")}
                    className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors text-sm font-medium"
                  >
                    Select Your Top 5 →
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {monthEntries.length === 0 ? (
              <div className="text-center py-12 bg-white border border-stone-200 rounded-xl">
                <p className="text-stone-600">No entries found for {monthName}</p>
              </div>
            ) : (
              monthEntries.map((entry) => {
                const entryDate = format(parseISO(entry.date), "EEEE, MMMM d");
                return (
                  <div key={entry.id} className="bg-white border border-stone-200 rounded-xl p-6">
                    <div className="text-sm font-medium text-stone-600 mb-4">{entryDate}</div>
                    <div className="space-y-3">
                      {entry.items.map((item, itemIndex) => {
                        const isStarred = item.favorite === true;
                        return (
                          <div
                            key={itemIndex}
                            className={`
                              flex items-start gap-4 p-4 rounded-lg transition-all
                              ${
                                isStarred
                                  ? "bg-amber-50 border-2 border-amber-300"
                                  : "bg-stone-50 border border-stone-200"
                              }
                            `}
                          >
                            <div className="flex-1">
                              <p className="text-stone-900">{item.text}</p>
                            </div>
                            <button
                              onClick={() => toggleItemStar(entry.id, itemIndex)}
                              className={`
                                p-2 rounded-lg transition-colors flex-shrink-0
                                ${
                                  isStarred
                                    ? "text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                                    : "text-stone-400 hover:text-amber-500 hover:bg-stone-100"
                                }
                              `}
                              title={isStarred ? "Unstar this moment" : "Star this moment"}
                            >
                              <Star size={20} fill={isStarred ? "currentColor" : "none"} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Main: Select Top 5 Favorites */}
      {viewMode === "select" && (
        <div className="mb-8">
          <div className="bg-white border border-stone-200 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-medium text-stone-900 mb-2">
                  Select Your Top 5 Favorites
                </h2>
                <p className="text-stone-600">
                  Choose your 5 favorite moments from this month. These will be highlighted in your
                  monthly review.
                </p>
              </div>
              {starredItems.length > 0 && (
                <button
                  onClick={() => setViewMode("review")}
                  className="px-4 py-2 text-sm border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors whitespace-nowrap"
                >
                  Review & Star More
                </button>
              )}
            </div>
            <div className="pt-4 border-t border-stone-200">
              <p className="text-sm text-stone-600">
                Selected: <strong className="text-stone-900">{selectedFavorites.length}/5</strong>
                {starredItems.length > 0 && (
                  <span className="ml-4">
                    • {starredItems.length} starred moment{starredItems.length !== 1 ? "s" : ""}{" "}
                    available
                  </span>
                )}
              </p>
            </div>
          </div>

          {starredItems.length === 0 ? (
            <div className="text-center py-16 bg-white border border-stone-200 rounded-xl">
              <Star size={48} className="text-stone-300 mx-auto mb-4" />
              <p className="text-stone-700 font-medium mb-2">No starred moments yet</p>
              <p className="text-sm text-stone-600 mb-6">
                Review your entries and star the moments you want to consider
              </p>
              <button
                onClick={() => setViewMode("review")}
                className="px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium"
              >
                Review & Star Moments
              </button>
            </div>
          ) : (
            <div className="space-y-3">
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
                      w-full text-left p-5 rounded-xl border-2 transition-all
                      ${
                        isSelected
                          ? "border-amber-400 bg-amber-50 shadow-sm"
                          : selectedFavorites.length >= 5
                          ? "border-stone-200 bg-stone-50 opacity-50 cursor-not-allowed"
                          : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-xs text-stone-500 mb-2 font-medium">{entryDate}</div>
                        <p className="text-stone-900">{item.text}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                            <Check size={18} className="text-white" />
                          </div>
                        ) : (
                          <Star size={24} className="text-amber-400" fill="currentColor" />
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
      <div className="mb-8 bg-white border border-stone-200 rounded-xl p-6">
        <label className="block font-medium text-stone-900 mb-2">
          Monthly Reflection (optional)
        </label>
        <p className="text-sm text-stone-600 mb-3">
          Add any thoughts, patterns, or insights you noticed this month
        </p>
        <textarea
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder="What patterns do you notice this month? What stood out most?"
          className="w-full p-4 border border-stone-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
          rows={5}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={selectedFavorites.length === 0 || isSaving || isSaved}
          className={`
              flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2
              ${
                selectedFavorites.length === 0 || isSaving || isSaved
                  ? isSaved
                    ? "bg-green-600 text-white cursor-default"
                    : "bg-stone-100 text-stone-400 cursor-not-allowed"
                  : "bg-stone-900 text-white hover:bg-stone-800"
              }
            `}
        >
          {isSaving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : isSaved ? (
            <>
              <Check size={18} />
              <span>Saved!</span>
            </>
          ) : (
            "Save Monthly Review"
          )}
        </button>
        <Link
          to="/archive"
          className="px-6 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
