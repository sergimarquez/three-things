import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEntries } from "../hooks/useEntries";
import { Star, Edit3, Calendar } from "lucide-react";

type Props = {
  reflection: {
    id: string;
    month: string;
    selectedFavorites: string[];
    reflectionText: string;
    createdAt: string;
  };
};

export default function MonthlyReviewCard({ reflection }: Props) {
  const navigate = useNavigate();
  const { entries, getEntriesForMonth } = useEntries();

  const monthEntries = getEntriesForMonth(reflection.month);
  const monthDate = parseISO(`${reflection.month}-01`);
  const monthName = format(monthDate, "MMMM yyyy");

  // Memoize favorite items - only recalculate when entries or selectedFavorites change
  const favoriteItems = useMemo(
    () =>
      reflection.selectedFavorites
        .map((key) => {
          // Key format is "entryId-itemIndex", but entryId contains dashes
          // So we need to split from the end - last part is itemIndex
          const lastDashIndex = key.lastIndexOf("-");
          if (lastDashIndex === -1) return null;

          const entryId = key.substring(0, lastDashIndex);
          const itemIndexStr = key.substring(lastDashIndex + 1);
          const itemIndex = parseInt(itemIndexStr);

          if (isNaN(itemIndex)) return null;

          const entry = entries.find((e) => e.id === entryId);
          if (entry && entry.items[itemIndex] !== undefined) {
            return {
              text: entry.items[itemIndex].text,
              date: entry.date,
            };
          }
          return null;
        })
        .filter(Boolean) as Array<{ text: string; date: string }>,
    [entries, reflection.selectedFavorites]
  );

  const stats = {
    daysPracticed: monthEntries.length,
    starredCount: reflection.selectedFavorites.length,
  };

  const handleEdit = () => {
    navigate(`/monthly-review/${reflection.month}`);
  };

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-stone-900">Monthly Review: {monthName}</h3>
            <p className="text-sm text-stone-600">
              {stats.daysPracticed} days practiced • {stats.starredCount} favorite
              {stats.starredCount !== 1 ? "s" : ""} selected
            </p>
          </div>
        </div>
        <button
          onClick={handleEdit}
          className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <Edit3 size={16} />
        </button>
      </div>

      {/* Selected Favorites */}
      {favoriteItems.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-stone-700 mb-3">Selected Favorites</h4>
          <div className="space-y-2">
            {favoriteItems.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 bg-white rounded-lg border border-blue-100"
              >
                <Star
                  size={16}
                  className="text-amber-500 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                />
                <div className="flex-1">
                  <div className="text-xs text-stone-500 mb-1">
                    {format(parseISO(item.date), "MMM d")}
                  </div>
                  <p className="text-stone-900 text-sm">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reflection Text */}
      {reflection.reflectionText && (
        <div className="pt-4 border-t border-blue-200">
          <h4 className="text-sm font-medium text-stone-700 mb-2">Reflection</h4>
          <p className="text-stone-700 whitespace-pre-wrap">{reflection.reflectionText}</p>
        </div>
      )}
    </div>
  );
}
