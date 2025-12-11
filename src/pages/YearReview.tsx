import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { useEntries } from "../hooks/useEntries";
import { Download, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function YearReview() {
  const {
    getYearsWithEntries,
    getYearSummary,
    getYearlyReview,
    saveYearlyReview,
    isLoading,
  } = useEntries();

  const yearsWithEntries = getYearsWithEntries();
  const currentYear = new Date().getFullYear();
  const defaultYear = yearsWithEntries[0] || String(currentYear);

  const [selectedYear, setSelectedYear] = useState<string>(defaultYear);
  const savedReview = useMemo(() => getYearlyReview(selectedYear), [getYearlyReview, selectedYear]);
  const [reflectionText, setReflectionText] = useState(savedReview?.reflectionText || "");
  const [exporting, setExporting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedYear(defaultYear);
  }, [defaultYear]);

  useEffect(() => {
    const review = getYearlyReview(selectedYear);
    setReflectionText(review?.reflectionText || "");
  }, [selectedYear, getYearlyReview]);

  const summary = getYearSummary(selectedYear);
  const topMoments = summary.topMoments || [];

  const handleSave = () => {
    saveYearlyReview({
      year: selectedYear,
      reflectionText: reflectionText.trim(),
    });
    setSaveMessage("Yearly reflection saved");
    setTimeout(() => setSaveMessage(null), 2500);
  };

  const exportMarkdown = async () => {
    setExporting(true);
    const lines: string[] = [];
    lines.push(`# Year in Review ${selectedYear}`);
    lines.push("");
    lines.push(`- Days practiced: ${summary.daysPracticed}`);
    lines.push(`- Reflections recorded: ${summary.totalReflections}`);
    lines.push(`- Total gratitude items: ${summary.totalItems}`);
    lines.push(`- Longest streak: ${summary.longestStreak}`);
    lines.push(`- Consistency: ${summary.consistency}%`);
    lines.push(`- Starred moments: ${summary.starredCount}`);
    lines.push("");
    lines.push("## Top Moments");
    if (topMoments.length === 0) {
      lines.push("- No moments available");
    } else {
      topMoments.forEach((m) => {
        lines.push(`- ${format(parseISO(m.date), "MMM d")}: ${m.text}`);
      });
    }
    lines.push("");
    lines.push("## Reflection");
    lines.push(reflectionText || "_(none)_");

    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `year-review-${selectedYear}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const exportPdf = () => {
    // Simple print-to-PDF approach for now
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;
    const html = `
      <html>
        <head>
          <title>Year in Review ${selectedYear}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
            h1, h2, h3 { margin: 0 0 12px; }
            .stat { margin-bottom: 8px; }
            .moment { margin-bottom: 8px; padding: 8px; border: 1px solid #e5e7eb; border-radius: 8px; }
            .small { color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Year in Review ${selectedYear}</h1>
          <div class="stat">Days practiced: ${summary.daysPracticed}</div>
          <div class="stat">Reflections recorded: ${summary.totalReflections}</div>
          <div class="stat">Total gratitude items: ${summary.totalItems}</div>
          <div class="stat">Longest streak: ${summary.longestStreak}</div>
          <div class="stat">Consistency: ${summary.consistency}%</div>
          <div class="stat">Starred moments: ${summary.starredCount}</div>
          <h2>Top Moments</h2>
          ${topMoments.length === 0 ? "<p>No moments available.</p>" : topMoments.map(m => `
            <div class="moment">
              <div class="small">${format(parseISO(m.date), "MMM d")}</div>
              <div>${m.text}</div>
            </div>
          `).join("")}
          <h2>Reflection</h2>
          <div>${(reflectionText || "(none)").replace(/\\n/g, "<br/>")}</div>
        </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-[fadeIn_0.3s_ease-out]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-stone-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-[fadeIn_0.3s_ease-out] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-stone-900">Year in Review</h1>
          <p className="text-stone-600">Look back on your practice</p>
        </div>
        <Link
          to="/streak"
          className="inline-flex items-center gap-2 px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors text-sm"
        >
          <BookOpen size={16} />
          Progress
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-600">Select year</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
          >
            {yearsWithEntries.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        {saveMessage && <span className="text-sm text-green-700">{saveMessage}</span>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Days practiced" value={summary.daysPracticed} />
        <StatCard label="Reflections recorded" value={summary.totalReflections} />
        <StatCard label="Total gratitude items" value={summary.totalItems} />
        <StatCard label="Longest streak" value={summary.longestStreak} />
        <StatCard label="Consistency" value={`${summary.consistency}%`} />
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-stone-900">Top moments of {selectedYear}</h3>
          <span classname="text-sm text-stone-500">{topMoments.length} selected</span>
        </div>
        {topMoments.length === 0 ? (
          <p className="text-stone-600">No moments available yet.</p>
        ) : (
          <div className="space-y-3">
            {topMoments.map((m, idx) => (
              <div key={idx} className="border border-stone-200 rounded-lg p-3 bg-stone-50">
                <div className="text-xs text-stone-500 mb-1">{format(parseISO(m.date), "MMM d")}</div>
                <p className="text-stone-900">{m.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-stone-900">Yearly Reflection (optional)</h3>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors text-sm"
          >
            Save Reflection
          </button>
        </div>
        <textarea
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder="What patterns do you notice this year? What stood out most?"
          className="w-full p-4 border border-stone-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
          rows={4}
        />
      </div>

      <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h4 className="font-medium text-stone-900">Export</h4>
          <p className="text-sm text-stone-600">Download your {selectedYear} review</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportMarkdown}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors text-sm"
          >
            <Download size={16} />
            {exporting ? "Preparing..." : "Markdown"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 text-center">
      <div className="text-2xl font-semibold text-stone-900 mb-1">{value}</div>
      <div className="text-sm text-stone-600">{label}</div>
    </div>
  );
}

