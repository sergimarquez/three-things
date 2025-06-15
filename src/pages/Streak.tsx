import { useEntries } from "../hooks/useEntries";
import { format, subDays, parseISO } from "date-fns";

export default function Streak() {
  const { entries } = useEntries();

  // Calculate current streak (consecutive days from today backwards)
  const calculateCurrentStreak = () => {
    if (entries.length === 0) return 0;

    const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    const entryDates = sortedEntries.map(entry => entry.date);
    
    let streak = 0;
    let currentDate = new Date();
    
    // Check if there's an entry for today
    const today = format(currentDate, "yyyy-MM-dd");
    if (!entryDates.includes(today)) {
      // If no entry today, check if there's one yesterday to start counting
      const yesterday = format(subDays(currentDate, 1), "yyyy-MM-dd");
      if (!entryDates.includes(yesterday)) {
        return 0; // No streak if neither today nor yesterday has an entry
      }
      currentDate = subDays(currentDate, 1); // Start from yesterday
    }
    
    // Count consecutive days backwards
    while (true) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      if (entryDates.includes(dateStr)) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Calculate longest streak ever
  const calculateLongestStreak = () => {
    if (entries.length === 0) return 0;

    const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const entryDates = sortedEntries.map(entry => entry.date);
    
    let maxStreak = 0;
    let currentStreak = 0;
    let previousDate: Date | null = null;

    for (const dateStr of entryDates) {
      const currentDate = parseISO(dateStr);
      
      if (previousDate) {
        const daysDiff = Math.round((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day
          currentStreak++;
        } else {
          // Gap found, reset streak
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      
      previousDate = currentDate;
    }
    
    return Math.max(maxStreak, currentStreak);
  };

  const currentStreak = calculateCurrentStreak();
  const longestStreak = calculateLongestStreak();
  const totalDays = entries.length;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Streak Tracker</h1>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{currentStreak}</div>
          <div className="text-sm text-gray-600">Current Streak</div>
          <div className="text-xs text-gray-500 mt-1">
            {currentStreak === 1 ? 'day' : 'days'} in a row
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{longestStreak}</div>
          <div className="text-sm text-gray-600">Longest Streak</div>
          <div className="text-xs text-gray-500 mt-1">
            Best streak ever
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{totalDays}</div>
          <div className="text-sm text-gray-600">Total Days</div>
          <div className="text-xs text-gray-500 mt-1">
            Entries logged
          </div>
        </div>
      </div>

      {/* Motivation Message */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-8">
        {currentStreak === 0 ? (
          <div className="text-center">
            <p className="text-blue-800 font-medium mb-2">🌱 Ready to start your streak?</p>
            <p className="text-blue-600 text-sm">Head to Home and log today's three things to begin!</p>
          </div>
        ) : currentStreak === 1 ? (
          <div className="text-center">
            <p className="text-blue-800 font-medium mb-2">🎉 Great start!</p>
            <p className="text-blue-600 text-sm">You've got 1 day logged. Keep it going tomorrow!</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-blue-800 font-medium mb-2">🔥 You're on fire!</p>
            <p className="text-blue-600 text-sm">
              {currentStreak} days in a row! Keep the momentum going.
            </p>
          </div>
        )}
      </div>

      {/* Calendar Placeholder */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Calendar View</h2>
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">📅</div>
          <p>Calendar view coming soon!</p>
          <p className="text-sm mt-2">This will show your entries with visual dots for each day.</p>
        </div>
      </div>
    </div>
  );
} 