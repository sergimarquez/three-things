import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const NOTICE_INTERVAL_DAYS = 30;

function shouldShowNotice(entriesCount: number) {
  if (entriesCount < 5) return false;
  const lastDismissed = localStorage.getItem("localStorageNoticeLastDismissed");
  if (!lastDismissed) return true;
  const daysSince = (Date.now() - Number(lastDismissed)) / (1000 * 60 * 60 * 24);
  return daysSince >= NOTICE_INTERVAL_DAYS;
}

export default function LocalStorageNotice({ entriesCount }: { entriesCount: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (shouldShowNotice(entriesCount)) {
      setVisible(true);
    }
  }, [entriesCount]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("localStorageNoticeLastDismissed", String(Date.now()));
  };

  if (!visible) return null;

  return (
    <div className="max-w-4xl mx-auto mb-6">
      <div className="flex items-center justify-between bg-white border border-yellow-200 rounded-lg shadow-sm px-4 py-3 text-sm text-yellow-900">
        <span>
          <strong className="font-semibold text-yellow-700">Just a heads up:</strong>{" "}
          Your journal is saved only on this device. <br /> To keep your entries safe, <Link to="/export" className="font-semibold text-yellow-700 underline">export a backup</Link> before clearing your browser data or switching devices.
        </span>
        <button
          className="ml-4 px-2 py-1 rounded text-yellow-700 hover:bg-yellow-50 transition"
          onClick={handleDismiss}
          aria-label="Dismiss notice"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
} 