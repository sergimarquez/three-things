import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useEntries } from "../hooks/useEntries";
import { Circle, BookOpen, TrendingUp, Download, Info, X } from "lucide-react";

export default function Layout() {
  const location = useLocation();
  const { hasTodayEntry } = useEntries();
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationDismissed, setNotificationDismissed] = useState(false);

  // Listen for entry additions to force re-render
  useEffect(() => {
    const handleEntryAdded = () => {
      setForceUpdate(prev => prev + 1);
      setShowNotification(false); // Hide notification when entry is added
    };

    window.addEventListener('entryAdded', handleEntryAdded);
    return () => window.removeEventListener('entryAdded', handleEntryAdded);
  }, []);

  // Show notification logic
  useEffect(() => {
    const shouldShow = !hasTodayEntry() && !notificationDismissed && location.pathname !== '/';
    setShowNotification(shouldShow);
  }, [hasTodayEntry(), notificationDismissed, location.pathname, forceUpdate]);

  const navItems = [
    { name: "Reflect", path: "/", icon: Circle },
    { name: "Journal", path: "/archive", icon: BookOpen },
    { name: "Progress", path: "/streak", icon: TrendingUp },
    { name: "Export", path: "/export", icon: Download },
    { name: "About", path: "/instructions", icon: Info },
  ];

  const handleDismissNotification = () => {
    setNotificationDismissed(true);
    setShowNotification(false);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="group">
              <h1 className="text-lg font-medium text-stone-900 group-hover:text-stone-700 transition-colors">
                Noticing
              </h1>
            </Link>
            
            <nav className="flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                      transition-all duration-200 hover:bg-stone-100
                      ${isActive 
                        ? "text-stone-900 bg-stone-100" 
                        : "text-stone-600 hover:text-stone-900"
                      }
                    `}
                  >
                    <Icon size={16} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white/50 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <p className="text-center text-sm text-stone-500">
            Built with intention — a tool for mindful reflection
          </p>
        </div>
      </footer>

      {/* Bottom-right notification */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white border border-stone-200 rounded-xl shadow-lg p-4 max-w-sm animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-medium text-stone-900 mb-1">
                  Time to reflect
                </h3>
                <p className="text-sm text-stone-600 mb-3">
                  Take a moment to notice what you're grateful for today
                </p>
                <Link
                  to="/"
                  onClick={() => setShowNotification(false)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-900 text-white text-sm rounded-lg hover:bg-stone-800 transition-colors"
                >
                  <Circle size={14} />
                  Reflect now
                </Link>
              </div>
              <button
                onClick={handleDismissNotification}
                className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
