import React, { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { useEntries } from "../hooks/useEntries";
import type { EntryItem } from "../hooks/useEntries";
import { Link } from "react-router-dom";

const successMessages = [
  "🎉 Yesterday's reflections saved. Come back tomorrow for a fresh start.",
  "✅ You've logged your 3 good things. Keep the streak going!",
  "🌿 Gratitude captured. See you tomorrow.",
  "💫 Done! One small step toward a brighter outlook.",
  "📘 You've written your story for yesterday. Rest easy.",
  "✨ You noticed the good — and that matters.",
  "📌 Reflections saved. Thanks for showing up."
];

export default function EntryInput() {
  const { saveEntry, hasYesterdayEntry } = useEntries();
  const [items, setItems] = useState<EntryItem[]>([
    { text: "" },
    { text: "" },
    { text: "" },
  ]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);

  // Different placeholders for each input
  const placeholders = [
    "Eg. Had a great coffee with a friend, finished a project I was proud of, enjoyed a beautiful sunset...",
    "Eg. Someone made me laugh, I learned something new, had a delicious meal that hit the spot...",
    "Eg. Felt grateful for my health, enjoyed a cozy moment at home, received an unexpected message..."
  ];

  // Pick a message based on today's date (static for the day)
  const getTodayMessage = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return successMessages[dayOfYear % successMessages.length];
  };

  const handleChange = (i: number, val: string) => {
    const updated = [...items];
    updated[i].text = val;
    setItems(updated);
  };

  const toggleFavorite = (i: number) => {
    setAnimatingIndex(i);
    setTimeout(() => setAnimatingIndex(null), 300);
    
    const updated = [...items];
    updated[i].favorite = !updated[i].favorite;
    setItems(updated);
  };

  const handleSubmit = () => {
    setIsAnimating(true);
    
    // Save with yesterday's date since we're asking about yesterday
    const yesterday = subDays(new Date(), 1);
    const now = new Date();
    const entryData = {
      date: format(yesterday, "yyyy-MM-dd"), // Save with yesterday's date
      time: format(now, "HH:mm"), // Current time for when it was recorded
      items: items as [EntryItem, EntryItem, EntryItem],
    };
    
    saveEntry(entryData);
    
    // Reset form after successful save
    setTimeout(() => {
      setItems([{ text: "" }, { text: "" }, { text: "" }]);
      setIsAnimating(false);
    }, 100);
  };

  // Check how many fields are filled
  const filledCount = items.filter(item => item.text.trim().length > 0).length;
  const remainingCount = 3 - filledCount;
  const isFormValid = filledCount === 3;

  const getSubmitButtonText = () => {
    if (isFormValid) {
      return "✨ Record Your Good Moments";
    } else if (remainingCount === 1) {
      return "1 thing left to complete";
    } else {
      return `${remainingCount} things left to complete`;
    }
  };

  if (hasYesterdayEntry()) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center shadow-lg">
          <div className="text-6xl mb-4 animate-bounce">🎯</div>
          <div className="text-green-700 font-medium text-xl mb-2">
            ✨ Yesterday's reflections captured!
          </div>
          <div className="text-green-600 text-lg mb-6">
            Your gratitude practice is building momentum. What's next?
          </div>
          
          {/* Navigation buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/archive"
              className="group bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              📖 View Your Journal
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
            
            <Link
              to="/streak"
              className="group bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              🔥 Check Your Streak
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </div>
          
          <div className="mt-6 text-green-600 text-sm">
            Come back tomorrow to reflect on today's good moments
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 leading-tight">
          ✨ What was good yesterday? ✨
        </h1>
        <p className="text-base text-gray-600 font-medium mb-1">
          Write 3 good things that happened yesterday
        </p>
        <p className="text-sm text-gray-500">
          {format(subDays(new Date(), 1), 'EEEE, d MMMM yyyy')}
        </p>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        {items.map((item, i) => (
          <div 
            key={i}
            className={`group relative transition-all duration-300 ${
              animatingIndex === i ? 'scale-105' : 'scale-100'
            }`}
          >
            <div className={`
              rounded-2xl p-4 shadow-lg border transition-all duration-300 hover:shadow-xl
              ${item.favorite 
                ? 'bg-yellow-100 border-yellow-300 ring-2 ring-yellow-200' 
                : item.text.trim() 
                  ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' 
                  : 'bg-white border-gray-100 hover:border-blue-200'
              }
            `}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-500">
                  Good thing #{i + 1}
                  {item.text.trim() && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Complete
                    </span>
                  )}
                </label>
                <button
                  onClick={() => toggleFavorite(i)}
                  className={`
                    text-2xl transition-all duration-300 transform hover:scale-125
                    ${item.favorite 
                      ? "text-orange-600 animate-pulse drop-shadow-lg" 
                      : "text-gray-300 hover:text-yellow-400"
                    }
                  `}
                >
                  ★
                </button>
              </div>
              
              <textarea
                value={item.text}
                onChange={(e) => handleChange(i, e.target.value)}
                className="
                  w-full p-2 text-base border-0 bg-transparent rounded-xl resize-none
                  focus:outline-none focus:ring-0 focus:bg-white
                  transition-all duration-300 placeholder-gray-400
                  min-h-[60px]
                "
                placeholder={placeholders[i]}
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Submit Section */}
      <div className="mt-6 text-center">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`
            group relative px-8 py-4 text-lg font-semibold rounded-2xl
            transition-all duration-300 transform
            ${isFormValid
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 hover:from-blue-700 hover:to-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          <span className="relative z-10">
            {getSubmitButtonText()}
          </span>
          {isFormValid && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          )}
        </button>
        
        {!isFormValid && (
          <p className="mt-3 text-sm text-gray-500">
            Fill in all 3 things to capture your gratitude
          </p>
        )}
      </div>

      {/* Floating Progress */}
      <div className="fixed bottom-6 right-6">
        <div className="bg-white rounded-full p-3 shadow-lg border border-gray-200">
          <div className="flex space-x-1">
            {items.map((item, i) => (
              <div
                key={i}
                className={`
                  w-3 h-3 rounded-full transition-all duration-500
                  ${item.text.trim() 
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse' 
                    : 'bg-gray-200'
                  }
                `}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
