import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useEntries } from "../hooks/useEntries";
import type { EntryItem } from "../hooks/useEntries";
import { Link } from "react-router-dom";
import { Star, BookOpen, TrendingUp, ArrowRight, Check, Calendar, X, Sparkles } from "lucide-react";
import LocalStorageNotice from "./LocalStorageNotice";

const placeholders = [
  "Something you're grateful for today...",
  "A moment of joy or satisfaction you experienced...",
  "Progress you made or something positive that happened...",
];

const completionMessages = [
  "Your gratitude has been recorded. Thank you for taking this moment.",
  "Today's reflections captured. See you tomorrow for another practice.",
  "Gratitude noted. These moments of appreciation matter.",
  "Your daily reflection is complete. Well done on practicing gratitude.",
  "Another day of mindful gratitude recorded. This practice builds over time.",
];

export default function EntryInput() {
  const navigate = useNavigate();
  const {
    entries,
    saveEntry,
    hasTodayEntry,
    shouldShowMonthlyReviewPrompt,
    shouldShowYearlyReviewPrompt,
    getPreviousMonth,
    isLoading,
  } = useEntries();
  const [items, setItems] = useState<EntryItem[]>([{ text: "" }, { text: "" }, { text: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showMonthlyReviewPrompt, setShowMonthlyReviewPrompt] = useState(false);
  const [dismissedPromptMonth, setDismissedPromptMonth] = useState<string | null>(() => {
    const stored = localStorage.getItem("three-things-dismissed-month");
    return stored || null;
  });
  const [showYearlyReviewBanner, setShowYearlyReviewBanner] = useState(false);
  const [dismissedYearBanner, setDismissedYearBanner] = useState<string | null>(() => {
    const stored = localStorage.getItem("three-things-dismissed-year");
    return stored || null;
  });

  // Check if we should show monthly review prompt
  useEffect(() => {
    // Don't check until data is loaded
    if (isLoading) return;

    const checkMonthlyPrompt = () => {
      const shouldShow = shouldShowMonthlyReviewPrompt();
      const previousMonth = getPreviousMonth();

      if (shouldShow) {
        if (dismissedPromptMonth !== previousMonth) {
          setShowMonthlyReviewPrompt(true);
        } else {
          setShowMonthlyReviewPrompt(false);
        }
      } else {
        setShowMonthlyReviewPrompt(false);
      }
    };

    // Check immediately
    checkMonthlyPrompt();

    // Also check periodically in case date changes (e.g., at midnight)
    const interval = setInterval(checkMonthlyPrompt, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [
    dismissedPromptMonth,
    entries.length,
    isLoading,
    shouldShowMonthlyReviewPrompt,
    getPreviousMonth,
  ]);

  // Check if we should show yearly review prompt (throughout January)
  useEffect(() => {
    // Don't check until data is loaded
    if (isLoading) return;

    const checkYearlyPrompt = () => {
      const shouldShow = shouldShowYearlyReviewPrompt();
      const today = new Date();
      const previousYear = String(today.getFullYear() - 1);
      const decemberMonth = `${previousYear}-12`;
      const decemberDismissed = dismissedPromptMonth === decemberMonth;

      // Check if user visited review page - if visited yesterday or earlier, don't show today
      const reviewVisitedKey = `year-review-visited-${previousYear}`;
      const reviewVisitedDate = localStorage.getItem(reviewVisitedKey);
      const todayStr = format(today, "yyyy-MM-dd");

      // Parse dates to compare properly
      let visitedYesterday = false;
      if (reviewVisitedDate) {
        const visitedDate = parseISO(reviewVisitedDate);
        const todayDate = parseISO(todayStr);
        // Check if visited date is before today (yesterday or earlier)
        visitedYesterday = visitedDate < todayDate;
      }

      // If user visited review page yesterday or earlier, don't show today
      if (visitedYesterday) {
        setShowYearlyReviewBanner(false);
        return;
      }

      if (shouldShow) {
        if (dismissedYearBanner !== previousYear && !visitedYesterday) {
          setShowYearlyReviewBanner(true);
        } else {
          setShowYearlyReviewBanner(false);
        }
      } else {
        setShowYearlyReviewBanner(false);
      }
    };

    // Check immediately
    checkYearlyPrompt();

    // Also check periodically in case date changes (e.g., at midnight)
    const interval = setInterval(checkYearlyPrompt, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [
    dismissedYearBanner,
    dismissedPromptMonth,
    entries.length,
    isLoading,
    shouldShowYearlyReviewPrompt,
  ]);

  // Listen for monthly review updates
  useEffect(() => {
    const handleUpdate = () => {
      setShowMonthlyReviewPrompt(false);
      window.dispatchEvent(new CustomEvent("reloadMonthlyReflections"));
    };
    window.addEventListener("monthlyReviewUpdated", handleUpdate);
    return () => window.removeEventListener("monthlyReviewUpdated", handleUpdate);
  }, []);

  // Pick a message based on today's date (static for the day)
  const getTodayMessage = () => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    return completionMessages[dayOfYear % completionMessages.length];
  };

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

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Save with today's date
    const today = new Date();
    const entryData = {
      date: format(today, "yyyy-MM-dd"),
      time: format(today, "HH:mm"),
      items: items as [EntryItem, EntryItem, EntryItem],
    };

    saveEntry(entryData);

    // Dispatch custom event to notify Layout of the change
    window.dispatchEvent(new CustomEvent("entryAdded"));

    // Show success animation
    setTimeout(() => {
      setShowSuccessAnimation(true);
    }, 300);

    // Reset form after animation completes
    setTimeout(() => {
      setItems([{ text: "" }, { text: "" }, { text: "" }]);
      setIsSubmitting(false);
    }, 2000);
  };

  // Check how many fields are filled
  const filledCount = items.filter((item) => item.text.trim().length > 0).length;
  const isFormValid = filledCount === 3;

  // Success Animation Component
  if (showSuccessAnimation && !hasTodayEntry()) {
    return (
      <>
        <LocalStorageNotice entriesCount={entries.length} />
        <div className="max-w-2xl mx-auto min-h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              {/* Animated Checkmark */}
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto animate-[bounce_0.6s_ease-in-out] shadow-lg">
                  <Check
                    size={48}
                    className="text-white animate-[fadeIn_0.8s_ease-in-out_0.3s_both]"
                  />
                </div>
                {/* Ripple effect */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-green-200 rounded-full animate-[ping_1s_cubic-bezier(0,0,0.2,1)_0.2s]"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-green-100 rounded-full animate-[ping_1s_cubic-bezier(0,0,0.2,1)_0.5s]"></div>
              </div>

              {/* Success Message */}
              <div className="animate-[fadeInUp_0.8s_ease-out_0.5s_both]">
                <h2 className="text-2xl font-medium text-stone-900 mb-3">Gratitude Saved! ✨</h2>
                <p className="text-stone-600 text-lg">Your three good things have been recorded</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (hasTodayEntry()) {
    return (
      <div className="max-w-2xl mx-auto min-h-[calc(100vh-200px)] flex flex-col justify-center">
        {/* Yearly Review - Special once-a-year reminder */}
        {showYearlyReviewBanner && (
          <div className="mb-8 text-center">
            <div className="inline-block p-6 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border border-amber-200/50 rounded-2xl shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles size={20} className="text-amber-600" />
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                  Once a Year
                </span>
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                Your {new Date().getFullYear() - 1} Year in Review
              </h3>
              <p className="text-sm text-stone-600 mb-4 max-w-md">
                Take a moment to reflect on your year—all your favorite moments and highlights are
                waiting
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  to="/year-review"
                  className="px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-200 hover:scale-105 text-sm font-medium shadow-sm"
                >
                  Review Your Year
                </Link>
                <button
                  onClick={() => {
                    const year = String(new Date().getFullYear() - 1);
                    setShowYearlyReviewBanner(false);
                    setDismissedYearBanner(year);
                    localStorage.setItem("three-things-dismissed-year", year);
                  }}
                  className="px-4 py-2 text-stone-500 hover:text-stone-700 text-sm transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Review Prompt Banner */}
        {showMonthlyReviewPrompt && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-blue-600" />
              <div>
                <h3 className="font-medium text-stone-900">
                  Review your {format(parseISO(`${getPreviousMonth()}-01`), "MMMM")}
                </h3>
                <p className="text-sm text-stone-600">
                  Reflect on last month and select your favorite moments
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigate(`/monthly-review/${getPreviousMonth()}`);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Review Now
              </button>
              <button
                onClick={() => {
                  const month = getPreviousMonth();
                  setShowMonthlyReviewPrompt(false);
                  setDismissedPromptMonth(month);
                  localStorage.setItem("three-things-dismissed-month", month);
                }}
                className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-blue-100"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center animate-[fadeIn_0.5s_ease-out]">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 bg-green-500 rounded-full"></div>
          </div>

          <h2 className="text-xl font-medium text-stone-900 mb-2">Today's gratitude recorded</h2>
          <p className="text-stone-600 mb-8">{getTodayMessage()}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/archive"
              className="inline-flex items-center gap-2 px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-all duration-200 hover:scale-105"
            >
              <BookOpen size={16} />
              View Journal
            </Link>

            <Link
              to="/streak"
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-all duration-200 hover:scale-105"
            >
              <TrendingUp size={16} />
              Check Progress
              <ArrowRight size={14} />
            </Link>
          </div>

          <p className="text-sm text-stone-500 mt-6">Come back tomorrow for another reflection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto min-h-[calc(100vh-200px)] flex flex-col justify-center">
      {/* Yearly Review - Special once-a-year reminder */}
      {showYearlyReviewBanner && (
        <div className="mb-8 text-center">
          <div className="inline-block p-6 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border border-amber-200/50 rounded-2xl shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles size={20} className="text-amber-600" />
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                Happy New Year
              </span>
            </div>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              Your {new Date().getFullYear() - 1} Year in Review
            </h3>
            <p className="text-sm text-stone-600 mb-4 max-w-md">
              Take a moment to reflect on your year—all your favorite moments and highlights are
              waiting
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/year-review"
                onClick={() => {
                  // Track that user visited review page today (will auto-dismiss tomorrow)
                  const year = String(new Date().getFullYear() - 1);
                  const todayStr = format(new Date(), "yyyy-MM-dd");
                  localStorage.setItem(`year-review-visited-${year}`, todayStr);
                  // Don't hide immediately - let it show for the rest of the day
                }}
                className="px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-200 hover:scale-105 text-sm font-medium shadow-sm"
              >
                Review Your Year
              </Link>
              <button
                onClick={() => {
                  const year = String(new Date().getFullYear() - 1);
                  setShowYearlyReviewBanner(false);
                  setDismissedYearBanner(year);
                  localStorage.setItem("three-things-dismissed-year", year);
                }}
                className="px-4 py-2 text-stone-500 hover:text-stone-700 text-sm transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Review Prompt Banner */}
      {showMonthlyReviewPrompt && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-blue-600" />
            <div>
              <h3 className="font-medium text-stone-900">
                Review your {format(parseISO(`${getPreviousMonth()}-01`), "MMMM")}
              </h3>
              <p className="text-sm text-stone-600">
                Reflect on last month and select your favorite moments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigate(`/monthly-review/${getPreviousMonth()}`);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Review Now
            </button>
            <button
              onClick={() => {
                const month = getPreviousMonth();
                setShowMonthlyReviewPrompt(false);
                setDismissedPromptMonth(month);
                localStorage.setItem("three-things-dismissed-month", month);
              }}
              className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-blue-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-medium text-stone-900 mb-2">
          What are you grateful for today?
        </h1>
        <p className="text-stone-600 mb-1">Take a moment to notice what you appreciate</p>
        <p className="text-sm text-stone-500">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      {/* Form */}
      <div
        className={`space-y-6 transition-all duration-300 ${
          isSubmitting ? "opacity-50 scale-95" : ""
        }`}
      >
        {items.map((item, i) => (
          <div key={i} className="group">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-stone-700">Good thing {i + 1}</label>
              <button
                onClick={() => toggleFavorite(i)}
                className={`
                  p-1 rounded transition-colors
                  ${item.favorite ? "text-amber-500" : "text-stone-300 hover:text-amber-400"}
                `}
              >
                <Star size={16} fill={item.favorite ? "currentColor" : "none"} />
              </button>
            </div>

            <div
              className={`
              border rounded-xl transition-all duration-200
              ${
                item.favorite
                  ? "border-amber-200 bg-amber-50"
                  : item.text.trim()
                  ? "border-stone-300 bg-white"
                  : "border-stone-200 bg-stone-50 group-hover:border-stone-300"
              }
            `}
            >
              <textarea
                value={item.text}
                onChange={(e) => handleChange(i, e.target.value)}
                className="
                  w-full p-4 bg-transparent border-0 resize-none
                  focus:outline-none focus:ring-0
                  placeholder-stone-400 text-stone-900
                  min-h-[80px]
                "
                placeholder={placeholders[i]}
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>
        ))}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className={`
              w-full py-3 px-4 rounded-xl font-medium transition-all duration-200
              ${
                isFormValid && !isSubmitting
                  ? "bg-stone-900 text-white hover:bg-stone-800 hover:scale-105"
                  : "bg-stone-100 text-stone-400 cursor-not-allowed"
              }
              ${isSubmitting ? "animate-pulse" : ""}
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving your gratitude...
              </span>
            ) : isFormValid ? (
              "Save Today's Gratitude"
            ) : (
              `${3 - filledCount} more to complete`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
