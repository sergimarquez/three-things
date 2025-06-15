import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/archive', label: 'Journal' },
    { path: '/streak', label: 'Streak' },
    { path: '/review', label: 'Review' },
    { path: '/export', label: 'Export' },
    { path: '/instructions', label: 'Instructions' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-8 py-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="py-8">
        {children}
      </main>
    </div>
  );
}
