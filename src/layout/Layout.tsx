import { Link } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="p-4 bg-gray-100 shadow">
        <nav className="flex gap-4">
          <Link to="/">Home</Link>
          <Link to="/archive">Archive</Link>
          <Link to="/streak">Streak</Link>
          <Link to="/review">Review</Link>
          <Link to="/export">Export</Link>
          <Link to="/instructions">Help</Link>
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
