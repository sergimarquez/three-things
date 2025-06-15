import { format, parseISO, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, subDays, startOfYear, differenceInCalendarDays, startOfMonth, endOfMonth } from "date-fns";
import { useEntries } from "../hooks/useEntries";
import { TrendingUp, Calendar, Star, Target } from "lucide-react";
import { Link } from "react-router-dom";

export default function Progress() {
  const { entries } = useEntries();

  // Calculate streak
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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

  // Calculate days since first entry
  const getDaysSinceStart = () => {
    if (entries.length === 0) return 0;
    const firstEntry = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    return differenceInCalendarDays(new Date(), parseISO(firstEntry.date));
  };

  // Calculate longest gap between entries
  const getLongestGap = () => {
    if (entries.length < 2) return 0;
    
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let maxGap = 0;
    
    for (let i = 1; i < sortedEntries.length; i++) {
      const currentDate = parseISO(sortedEntries[i].date);
      const previousDate = parseISO(sortedEntries[i - 1].date);
      const gap = differenceInCalendarDays(currentDate, previousDate) - 1;
      maxGap = Math.max(maxGap, gap);
    }
    
    return maxGap;
  };

  // Get weekly activity
  const getWeeklyActivity = () => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return daysOfWeek.map(day => {
      const hasEntry = entries.some(entry => 
        differenceInDays(parseISO(entry.date), day) === 0
      );
      return {
        day: format(day, 'EEE'),
        date: day,
        hasEntry,
        isToday: isToday(day)
      };
    });
  };

  // Get recent activity
  const getRecentActivity = () => {
    return entries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);
  };

  // Get monthly progress
  const getMonthlyProgress = () => {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    const daysInMonth = differenceInCalendarDays(monthEnd, monthStart) + 1;
    const daysSoFar = differenceInCalendarDays(new Date(), monthStart) + 1;
    
    const monthlyEntries = entries.filter(entry => {
      const entryDate = parseISO(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });
    
    return {
      monthName: format(new Date(), 'MMMM'),
      entriesThisMonth: monthlyEntries.length,
      daysSoFar,
      daysInMonth,
      percentage: Math.round((monthlyEntries.length / daysSoFar) * 100)
    };
  };

  // Get year progress
  const getYearProgress = () => {
    const yearStart = startOfYear(new Date());
    const daysSinceYearStart = differenceInCalendarDays(new Date(), yearStart) + 1;
    const entriesThisYear = entries.filter(entry => {
      const entryDate = parseISO(entry.date);
      return entryDate.getFullYear() === new Date().getFullYear();
    }).length;
    
    return {
      daysSinceYearStart,
      entriesThisYear,
      percentage: Math.round((entriesThisYear / daysSinceYearStart) * 100)
    };
  };

  const streak = calculateStreak();
  const longestStreak = calculateLongestStreak();
  const daysSinceStart = getDaysSinceStart();
  const longestGap = getLongestGap();
  const weeklyActivity = getWeeklyActivity();
  const recentActivity = getRecentActivity();
  const monthlyProgress = getMonthlyProgress();
  const yearProgress = getYearProgress();
  const totalStarred = entries.reduce((sum, entry) => sum + entry.items.filter(item => item.favorite).length, 0);
  const totalItems = entries.reduce((sum, entry) => sum + entry.items.length, 0);

  if (entries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white border border-stone-200 rounded-2xl p-8">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp size={24} className="text-stone-400" />
          </div>
          
          <h2 className="text-xl font-medium text-stone-900 mb-2">
            No progress to show yet
          </h2>
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-stone-900 mb-2">Progress</h1>
        <p className="text-stone-600">
          Your reflection practice over time
        </p>
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
          <div className="text-2xl font-semibold text-stone-900 mb-1">{totalStarred}</div>
          <div className="text-sm text-stone-600">Starred moments</div>
        </div>
      </div>

      {/* This Week */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-8">
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
                  ${day.hasEntry 
                    ? 'bg-stone-900 text-white' 
                    : day.isToday 
                      ? 'border-2 border-stone-300 text-stone-600' 
                      : 'bg-stone-100 text-stone-400'
                  }
                `}
              >
                {format(day.date, 'd')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Progress */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={20} className="text-stone-600" />
          <h3 className="font-medium text-stone-900">{monthlyProgress.monthName}</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-stone-600">
              {monthlyProgress.entriesThisMonth} of {monthlyProgress.daysSoFar} days so far
            </span>
            <span className="font-medium text-stone-900">
              {monthlyProgress.percentage}%
            </span>
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
                  : "Every day counts — keep going"
            }
          </p>
        </div>
      </div>

      {/* Year Progress */}
      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target size={20} className="text-stone-600" />
          <h3 className="font-medium text-stone-900">This Year</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-stone-600">
              {yearProgress.entriesThisYear} of {yearProgress.daysSinceYearStart} days
            </span>
            <span className="font-medium text-stone-900">
              {yearProgress.percentage}%
            </span>
          </div>
          
          <div className="w-full bg-stone-200 rounded-full h-2">
            <div 
              className="bg-stone-900 h-2 rounded-full transition-all duration-500"
              style={{ width: `${yearProgress.percentage}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-stone-600">
            {yearProgress.percentage >= 80 
              ? "Excellent consistency in your practice"
              : yearProgress.percentage >= 50
                ? "Good progress — keep building the habit"
                : "Every reflection counts — stay consistent"
            }
          </p>
        </div>
      </div>
    </div>
  );
} 