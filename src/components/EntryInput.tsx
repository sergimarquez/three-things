import { useState } from "react";
import { format } from "date-fns";
import { useEntries } from "../hooks/useEntries";
import type { EntryItem } from "../hooks/useEntries";
import { Link } from "react-router-dom";
import { Star, BookOpen, TrendingUp, ArrowRight } from "lucide-react";

const placeholders = [
  "Something you're grateful for today...",
  "A moment of joy or satisfaction you experienced...", 
  "Progress you made or something positive that happened..."
];

const completionMessages = [
  "Your gratitude has been recorded. Thank you for taking this moment.",
      "Today's reflections captured. See you tomorrow for another practice.",
  "Gratitude noted. These moments of appreciation matter.",
  "Your daily reflection is complete. Well done on practicing gratitude.",
  "Another day of mindful gratitude recorded. This practice builds over time."
];

export default function EntryInput() {
  const { saveEntry, hasTodayEntry } = useEntries();
  const [items, setItems] = useState<EntryItem[]>([
    { text: "" },
    { text: "" },
    { text: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pick a message based on today's date (static for the day)
  const getTodayMessage = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
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
    window.dispatchEvent(new CustomEvent('entryAdded'));
    
    // Reset form after successful save
    setTimeout(() => {
      setItems([{ text: "" }, { text: "" }, { text: "" }]);
      setIsSubmitting(false);
    }, 500);
  };

  // Check how many fields are filled
  const filledCount = items.filter(item => item.text.trim().length > 0).length;
  const isFormValid = filledCount === 3;

  if (hasTodayEntry()) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 bg-green-500 rounded-full"></div>
          </div>
          
          <h2 className="text-xl font-medium text-stone-900 mb-2">
            Today's gratitude recorded
          </h2>
          <p className="text-stone-600 mb-8">
            {getTodayMessage()}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/archive"
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
            >
              <BookOpen size={16} />
              View Journal
              <ArrowRight size={14} />
            </Link>
            
            <Link
              to="/streak"
              className="inline-flex items-center gap-2 px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
            >
              <TrendingUp size={16} />
              Check Progress
            </Link>
          </div>
          
          <p className="text-sm text-stone-500 mt-6">
            Come back tomorrow for another reflection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-medium text-stone-900 mb-2">
          What are you grateful for today?
        </h1>
        <p className="text-stone-600 mb-1">
                      Take a moment to notice what you appreciate
        </p>
        <p className="text-sm text-stone-500">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {items.map((item, i) => (
          <div key={i} className="group">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-stone-700">
                Good thing {i + 1}
              </label>
              <button
                onClick={() => toggleFavorite(i)}
                className={`
                  p-1 rounded transition-colors
                  ${item.favorite 
                    ? "text-amber-500" 
                    : "text-stone-300 hover:text-amber-400"
                  }
                `}
              >
                <Star size={16} fill={item.favorite ? "currentColor" : "none"} />
              </button>
            </div>
            
            <div className={`
              border rounded-xl transition-all duration-200
              ${item.favorite 
                ? 'border-amber-200 bg-amber-50' 
                : item.text.trim() 
                  ? 'border-stone-300 bg-white' 
                  : 'border-stone-200 bg-stone-50 group-hover:border-stone-300'
              }
            `}>
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
              ${isFormValid && !isSubmitting
                ? "bg-stone-900 text-white hover:bg-stone-800" 
                : "bg-stone-100 text-stone-400 cursor-not-allowed"
              }
            `}
          >
            {isSubmitting 
              ? "Saving..." 
              : isFormValid 
                ? "Save Today's Gratitude" 
                : `${3 - filledCount} more to complete`
            }
          </button>
        </div>
      </div>
    </div>
  );
}
