import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useEntries } from "../hooks/useEntries";
import { Circle, BookOpen, TrendingUp, Download, Info } from "lucide-react";

export default function Layout() {
  const location = useLocation();
  const { hasTodayEntry } = useEntries();
  const [forceUpdate, setForceUpdate] = useState(0);

  // Listen for entry additions to force re-render
  useEffect(() => {
    const handleEntryAdded = () => {
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('entryAdded', handleEntryAdded);
    return () => window.removeEventListener('entryAdded', handleEntryAdded);
  }, []);

  const navItems = [
    { name: "Reflect", path: "/", icon: Circle },
    { name: "Journal", path: "/archive", icon: BookOpen },
    { name: "Progress", path: "/streak", icon: TrendingUp },
    { name: "Export", path: "/export", icon: Download },
    { name: "About", path: "/instructions", icon: Info },
  ];



  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="group">
              <h1 className="text-lg font-medium text-stone-900 group-hover:text-stone-700 transition-colors">
                3Good
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


    </div>
  );
}
