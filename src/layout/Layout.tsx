import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Circle, BookOpen, Settings, TrendingUp, Download, Info } from "lucide-react";
import { DATA_VERSION, useEntries } from "../hooks/useEntries";
import ValidationNotice from "../components/ValidationNotice";

export default function Layout() {
  const location = useLocation();
  const [forceUpdate, setForceUpdate] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { validationErrors, clearValidationErrors } = useEntries();

  const mainNavItems = [
    { name: "Reflect", path: "/", icon: Circle },
    { name: "Journal", path: "/archive", icon: BookOpen },
  ];

  const menuItems = [
    { name: "Progress", path: "/streak", icon: TrendingUp },
    { name: "Export", path: "/export", icon: Download },
    { name: "About", path: "/instructions", icon: Info },
  ];

  useEffect(() => {
    const handleEntryAdded = () => setForceUpdate((prev) => prev + 1);
    window.addEventListener("entryAdded", handleEntryAdded);
    return () => window.removeEventListener("entryAdded", handleEntryAdded);
  }, [forceUpdate]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="group">
              <h1 className="text-lg font-medium text-stone-900 group-hover:text-stone-700 transition-colors">
                3Good
              </h1>
            </Link>

            <nav className="flex items-center gap-1">
              {mainNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                      transition-all duration-200 hover:bg-stone-100
                      ${isActive ? "text-stone-900 bg-stone-100" : "text-stone-600 hover:text-stone-900"}
                    `}
                  >
                    <Icon size={16} />
                    {item.name}
                  </Link>
                );
              })}

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  aria-label="Settings and more"
                  className="flex items-center justify-center p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
                >
                  <Settings size={18} />
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 py-1.5 w-44 bg-white border border-stone-200 rounded-xl shadow-lg z-50"
                    role="menu"
                  >
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          role="menuitem"
                          onClick={() => setMenuOpen(false)}
                          className={`
                            flex items-center gap-2.5 px-3 py-2 text-sm font-medium
                            ${isActive ? "text-stone-900 bg-stone-50" : "text-stone-700 hover:bg-stone-50"}
                          `}
                        >
                          <Icon size={16} className="text-stone-500" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <ValidationNotice errors={validationErrors} onDismiss={clearValidationErrors} />
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white/50">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <p className="text-center text-sm text-stone-500">
            Built with <span className="italic text-stone-600">intention</span> — by{" "}
            <a
              href="https://github.com/sergimarquez"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 hover:text-stone-700 transition-colors"
            >
              sergimarquez
            </a>{" "}
            <span className="mx-2 text-stone-300">|</span>v{DATA_VERSION}{" "}
            <span className="mx-2 text-stone-300">|</span>© {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
