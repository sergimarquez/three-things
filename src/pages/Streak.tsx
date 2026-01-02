import { useState } from "react";
import {
  format,
  parseISO,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  subDays,
  differenceInCalendarDays,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { useEntries } from "../hooks/useEntries";
import { TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function Progress() {
  const { entries, getYearsWithEntries } = useEntries();
  const allYearsWithEntries = getYearsWithEntries();
  const currentYear = new Date().getFullYear();
  // Only show button if there's at least one completed year (not the current year)
  const completedYears = allYearsWithEntries.filter((year) => Number(year) < currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Calculate streak
  const calculateStreak = () => {
    if (entries.length === 0) return 0;

    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = parseISO(sortedEntries[i].date);
      const expectedDate = subDays(today, i);

      if (differenceInDays(expectedDate, entryDate) === 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  // Calculate longest streak ever
  const calculateLongestStreak = () => {
    if (entries.length === 0) return 0;

    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedEntries.length; i++) {
      const currentDate = parseISO(sortedEntries[i].date);
      const previousDate = parseISO(sortedEntries[i - 1].date);
      const daysDiff = differenceInCalendarDays(currentDate, previousDate);

      if (daysDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  };

  // Get weekly activity
  const getWeeklyActivity = () => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return daysOfWeek.map((day) => {
      const hasEntry = entries.some((entry) => differenceInDays(parseISO(entry.date), day) === 0);
      return {
        day: format(day, "EEE"),
        date: day,
        hasEntry,
        isToday: isToday(day),
      };
    });
  };

  // Get monthly progress
  const getMonthlyProgress = () => {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    const daysInMonth = differenceInCalendarDays(monthEnd, monthStart) + 1;
    const daysSoFar = differenceInCalendarDays(new Date(), monthStart) + 1;

    const monthlyEntries = entries.filter((entry) => {
      const entryDate = parseISO(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    return {
      monthName: format(new Date(), "MMMM"),
      entriesThisMonth: monthlyEntries.length,
      daysSoFar,
      daysInMonth,
      percentage: Math.round((monthlyEntries.length / daysSoFar) * 100),
    };
  };

  const streak = calculateStreak();
  const longestStreak = calculateLongestStreak();
  const weeklyActivity = getWeeklyActivity();
  const monthlyProgress = getMonthlyProgress();

  if (entries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center animate-[fadeIn_0.3s_ease-out]">
        <div className="bg-white border border-stone-200 rounded-2xl p-8">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp size={24} className="text-stone-400" />
          </div>

          <h2 className="text-xl font-medium text-stone-900 mb-2">No progress to show yet</h2>
          <p className="text-stone-600 mb-6">
            Start your reflection practice to track your journey
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            Begin reflecting
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium text-stone-900 mb-2">Progress</h1>
          <p className="text-stone-600">Your reflection practice over time</p>
        </div>
        {completedYears.length > 0 && (
          <Link
            to="/year-review"
            className="inline-flex items-center gap-2 px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors text-sm font-medium"
          >
            <Calendar size={16} />
            Year in Review
          </Link>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-stone-200 rounded-xl p-6 text-center">
          <div className="text-2xl font-semibold text-stone-900 mb-1">{streak}</div>
          <div className="text-sm text-stone-600">Current streak</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-6 text-center">
          <div className="text-2xl font-semibold text-stone-900 mb-1">{longestStreak}</div>
          <div className="text-sm text-stone-600">Best streak</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-6 text-center">
          <div className="text-2xl font-semibold text-stone-900 mb-1">{entries.length}</div>
          <div className="text-sm text-stone-600">Total days</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-6 text-center">
          <div className="text-2xl font-semibold text-stone-900 mb-1">{entries.length * 3}</div>
          <div className="text-sm text-stone-600">Total reflections</div>
        </div>
      </div>

      {/* Progress & Calendar Layout */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Left Column: This Week + Current Month */}
        <div className="space-y-6">
          {/* This Week */}
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={20} className="text-stone-600" />
              <h3 className="font-medium text-stone-900">This Week</h3>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weeklyActivity.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-stone-500 mb-2">{day.day}</div>
                  <div
                    className={`
                      w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-xs font-medium
                      ${
                        day.hasEntry
                          ? "bg-stone-900 text-white"
                          : day.isToday
                          ? "border-2 border-stone-300 text-stone-600"
                          : "bg-stone-100 text-stone-400"
                      }
                    `}
                  >
                    {format(day.date, "d")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Month Progress */}
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={20} className="text-stone-600" />
              <h3 className="font-medium text-stone-900">{monthlyProgress.monthName}</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">
                  {monthlyProgress.entriesThisMonth} of {monthlyProgress.daysSoFar} days so far
                </span>
                <span className="font-medium text-stone-900">{monthlyProgress.percentage}%</span>
              </div>

              <div className="w-full bg-stone-200 rounded-full h-2">
                <div
                  className="bg-stone-900 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${monthlyProgress.percentage}%` }}
                ></div>
              </div>

              <p className="text-sm text-stone-600">
                {monthlyProgress.percentage >= 90
                  ? "Outstanding consistency this month"
                  : monthlyProgress.percentage >= 70
                  ? "Great progress this month"
                  : monthlyProgress.percentage >= 50
                  ? "Good momentum building"
                  : "Every day counts — keep going"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Calendar */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-stone-600" />
              <h3 className="font-medium text-stone-900">Calendar</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1))
                }
                className="p-1 hover:bg-stone-100 rounded transition-colors"
              >
                ←
              </button>
              <span className="text-sm text-stone-600 min-w-[80px] text-center">
                {format(selectedMonth, "MMM yyyy")}
              </span>
              <button
                onClick={() =>
                  setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1))
                }
                className="p-1 hover:bg-stone-100 rounded transition-colors"
                disabled={isToday(selectedMonth)}
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5 flex-1">
            {/* Day headers */}
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <div
                key={`day-header-${index}`}
                className="text-center text-xs font-medium text-stone-500 py-1"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {(() => {
              const firstDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
              const startDate = new Date(firstDay);
              startDate.setDate(startDate.getDate() - firstDay.getDay());

              const days = [];
              for (let i = 0; i < 35; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + i);

                const hasEntry = entries.some((entry) => {
                  const entryDate = parseISO(entry.date);
                  return differenceInDays(entryDate, currentDate) === 0;
                });

                const isCurrentMonth = currentDate.getMonth() === selectedMonth.getMonth();

                days.push(
                  <div
                    key={i}
                    className={`
                      w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-xs font-medium
                      ${
                        isCurrentMonth
                          ? hasEntry
                            ? "bg-stone-900 text-white"
                            : "text-stone-600"
                          : "text-stone-300"
                      }
                    `}
                  >
                    {currentDate.getDate()}
                  </div>
                );
              }
              return days;
            })()}
          </div>

          <div className="flex items-center justify-center mt-auto pt-4 text-xs text-stone-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-stone-900 rounded"></div>
              <span>Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
