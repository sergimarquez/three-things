import { useEffect, useState, useMemo } from "react";
import type { ReactElement } from "react";
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
    monthlyReflections,
  } = useEntries();

  const allYearsWithEntries = getYearsWithEntries();
  const currentYear = new Date().getFullYear();
  const today = new Date();
  const isJanuary = today.getMonth() === 0;
  const dayOfMonth = today.getDate();

  // Memoize years with entries - only recalculate when allYearsWithEntries, currentYear, or monthlyReflections change
  const yearsWithEntries = useMemo(
    () =>
      allYearsWithEntries
        .filter((year) => Number(year) < currentYear)
        .filter((year) => {
          // Check if this year has at least one monthly reflection
          return monthlyReflections.some((reflection) => reflection.month.startsWith(year));
        }),
    [allYearsWithEntries, currentYear, monthlyReflections]
  );

  // If we're in the first week of January, default to previous year for yearly review
  const previousYear = String(currentYear - 1);
  const shouldDefaultToPreviousYear =
    isJanuary && dayOfMonth <= 7 && yearsWithEntries.includes(previousYear);

  const defaultYear = shouldDefaultToPreviousYear
    ? previousYear
    : yearsWithEntries[0] || String(currentYear - 1);

  const [selectedYear, setSelectedYear] = useState<string>(defaultYear);
  const [reflectionText, setReflectionText] = useState("");
  const [exporting, setExporting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedYear(defaultYear);
  }, [defaultYear]);

  // Update reflection text when year changes
  useEffect(() => {
    const review = getYearlyReview(selectedYear);
    setReflectionText(review?.reflectionText || "");
  }, [selectedYear]);

  const summary = getYearSummary(selectedYear);
  const topMoments = summary.topMoments || [];

  // Check if selected year has monthly reviews
  const hasMonthlyReviews = monthlyReflections.some((reflection) =>
    reflection.month.startsWith(selectedYear)
  );

  // Memoize grouping and sorting - only recalculate when topMoments change
  const { momentsByMonth, sortedMonths } = useMemo(() => {
    const grouped = topMoments.reduce((acc, moment) => {
      const monthKey = format(parseISO(moment.date), "MMMM yyyy");
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(moment);
      return acc;
    }, {} as Record<string, typeof topMoments>);

    const sorted = Object.keys(grouped).sort((a, b) => {
      return (
        parseISO(grouped[a][0].date).getTime() - parseISO(grouped[b][0].date).getTime()
      );
    });

    return { momentsByMonth: grouped, sortedMonths: sorted };
  }, [topMoments]);

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

  const exportPdf = async () => {
    setExporting(true);
    // Create a print-friendly version
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setExporting(false);
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Year in Review ${selectedYear} - 3Good</title>
          <style>
            @media print {
              @page { margin: 1.5cm; }
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
              padding: 40px; 
              color: #1f2937; 
              max-width: 800px;
              margin: 0 auto;
              line-height: 1.6;
            }
            h1 { 
              font-size: 32px; 
              margin: 0 0 8px 0; 
              color: #111827;
              border-bottom: 3px solid #1f2937;
              padding-bottom: 12px;
            }
            h2 { 
              font-size: 20px; 
              margin: 32px 0 16px 0; 
              color: #374151;
            }
            h3 {
              font-size: 18px;
              font-weight: 600;
              color: #374151;
              margin: 24px 0 12px 0;
              padding-bottom: 8px;
              border-bottom: 2px solid #e5e7eb;
            }
            .stats {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              margin: 24px 0;
            }
            .stat-item {
              padding: 16px;
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
            }
            .stat-value {
              font-size: 24px;
              font-weight: 600;
              color: #111827;
              margin-bottom: 4px;
            }
            .stat-label {
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .moment { 
              margin-bottom: 12px; 
              padding: 12px; 
              border-left: 3px solid #d97706;
              background: #fffbeb;
              border-radius: 4px;
            }
            .moment-date { 
              color: #92400e; 
              font-size: 11px; 
              font-weight: 600;
              margin-bottom: 4px;
              text-transform: uppercase;
            }
            .moment-text {
              color: #1f2937;
            }
            .reflection {
              margin-top: 24px;
              padding: 20px;
              background: #f9fafb;
              border-radius: 8px;
              white-space: pre-wrap;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>Year in Review ${selectedYear}</h1>
          <p style="color: #6b7280; margin: 0 0 24px 0;">Your gratitude practice journey</p>
          
          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">${summary.daysPracticed}</div>
              <div class="stat-label">Days Practiced</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${summary.totalReflections}</div>
              <div class="stat-label">Reflections</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${summary.totalItems}</div>
              <div class="stat-label">Gratitude Items</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${summary.longestStreak}</div>
              <div class="stat-label">Longest Streak</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${summary.consistency}%</div>
              <div class="stat-label">Consistency</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${summary.starredCount}</div>
              <div class="stat-label">Starred Moments</div>
            </div>
          </div>

          <h2>Top Moments of ${selectedYear}</h2>
          ${
            topMoments.length === 0
              ? "<p style='color: #6b7280; font-style: italic;'>No moments available.</p>"
              : (() => {
                  // Group moments by month
                  const pdfMomentsByMonth: Record<string, typeof topMoments> = {};
                  topMoments.forEach((moment) => {
                    const monthKey = format(parseISO(moment.date), "MMMM yyyy");
                    if (!pdfMomentsByMonth[monthKey]) {
                      pdfMomentsByMonth[monthKey] = [];
                    }
                    pdfMomentsByMonth[monthKey].push(moment);
                  });

                  // Sort months chronologically
                  const pdfSortedMonths = Object.keys(pdfMomentsByMonth).sort((a, b) => {
                    return (
                      parseISO(pdfMomentsByMonth[a][0].date).getTime() -
                      parseISO(pdfMomentsByMonth[b][0].date).getTime()
                    );
                  });

                  // Build HTML with month groupings
                  let globalIndex = 0;
                  return pdfSortedMonths
                    .map((monthKey) => {
                      const monthMoments = pdfMomentsByMonth[monthKey];
                      const monthHtml = `
                        <h3>${monthKey}</h3>
                        ${monthMoments
                          .map((m) => {
                            globalIndex++;
                            return `
                              <div class="moment">
                                <div class="moment-date">${format(
                                  parseISO(m.date),
                                  "MMMM d, yyyy"
                                )} • #${globalIndex}</div>
                                <div class="moment-text">${m.text}</div>
                              </div>
                            `;
                          })
                          .join("")}
                      `;
                      return monthHtml;
                    })
                    .join("");
                })()
          }
          
          ${
            reflectionText
              ? `
            <h2>Reflection</h2>
            <div class="reflection">${reflectionText.replace(/\n/g, "<br/>")}</div>
          `
              : ""
          }
          
          <div class="footer">
            Generated by 3Good on ${format(new Date(), "MMMM d, yyyy")}<br/>
            <a href="https://3good.app" style="color: #6b7280; text-decoration: none;">3good.app</a>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      setExporting(false);
    }, 250);
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

  // If there are no completed years with entries, show a message
  if (yearsWithEntries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto animate-[fadeIn_0.3s_ease-out]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-medium text-stone-900 mb-2">No Year in Review Available</h2>
            <p className="text-stone-600 mb-6">
              You need to complete monthly reviews for a completed year to create a year in review.
            </p>
            <Link
              to="/archive"
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
            >
              <BookOpen size={16} />
              View Journal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If selected year doesn't have monthly reviews, show a message
  if (!hasMonthlyReviews) {
    return (
      <div className="max-w-4xl mx-auto animate-[fadeIn_0.3s_ease-out]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-medium text-stone-900 mb-2">
              Complete Monthly Reviews First
            </h2>
            <p className="text-stone-600 mb-6">
              To create a year in review for {selectedYear}, you need to complete at least one
              monthly review from that year. Monthly reviews help you select your favorite moments.
            </p>
            <Link
              to="/archive"
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
            >
              <BookOpen size={16} />
              Go to Archive
            </Link>
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

      {/* Stats Grid - 3 columns on desktop, 2 on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Days practiced" value={summary.daysPracticed} />
        <StatCard label="Reflections recorded" value={summary.totalReflections} />
        <StatCard label="Total gratitude items" value={summary.totalItems} />
        <StatCard label="Longest streak" value={summary.longestStreak} />
        <StatCard label="Consistency" value={`${summary.consistency}%`} />
        <StatCard label="Starred moments" value={summary.starredCount} />
      </div>

      {/* Top Moments Section */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-1">
              Top Moments of {selectedYear}
            </h2>
            <p className="text-sm text-stone-600">
              {topMoments.length === 0
                ? "No moments available yet"
                : `${topMoments.length} special ${
                    topMoments.length === 1 ? "moment" : "moments"
                  } from your monthly reviews`}
            </p>
          </div>
        </div>
        {topMoments.length > 0 && (
          <div className="space-y-6">
            {sortedMonths.reduce((acc, monthKey, monthGroupIdx) => {
              const monthMoments = momentsByMonth[monthKey];
              const startIndex =
                monthGroupIdx === 0
                  ? 0
                  : sortedMonths
                      .slice(0, monthGroupIdx)
                      .reduce((sum, key) => sum + momentsByMonth[key].length, 0);

              acc.push(
                <div key={monthKey} className="space-y-3">
                  <h3 className="text-lg font-semibold text-stone-800 mb-3 pb-2 border-b border-amber-200">
                    {monthKey}
                  </h3>
                  {monthMoments.map((m, monthIdx) => {
                    const currentIndex = startIndex + monthIdx;
                    return (
                      <div
                        key={`${m.entryId}-${m.itemIndex}`}
                        className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-semibold text-sm">
                            {currentIndex + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-amber-700 mb-1.5">
                              {format(parseISO(m.date), "MMMM d, yyyy")}
                            </div>
                            <p className="text-stone-900 leading-relaxed">{m.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
              return acc;
            }, [] as ReactElement[])}
          </div>
        )}
      </div>

      {/* Yearly Reflection Section */}
      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-stone-900 mb-1">Yearly Reflection</h3>
            <p className="text-sm text-stone-600">Optional: Share your thoughts about this year</p>
          </div>
          <button
            onClick={handleSave}
            disabled={!reflectionText.trim()}
            className={`
              px-4 py-2 rounded-lg transition-colors text-sm font-medium
              ${
                reflectionText.trim()
                  ? "bg-stone-900 text-white hover:bg-stone-800"
                  : "bg-stone-100 text-stone-400 cursor-not-allowed"
              }
            `}
          >
            Save Reflection
          </button>
        </div>
        <textarea
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder="What patterns do you notice this year? What stood out most? How has your gratitude practice evolved?"
          className="w-full p-4 border border-stone-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent text-stone-900 placeholder-stone-400"
          rows={6}
        />
        {saveMessage && (
          <div className="mt-3 text-sm text-green-700 flex items-center gap-2">
            <span>✓</span>
            <span>{saveMessage}</span>
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="font-medium text-stone-900 mb-1">Export Your Review</h4>
            <p className="text-sm text-stone-600">Download your {selectedYear} year in review</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportMarkdown}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Download size={16} />
              {exporting ? "Preparing..." : "Markdown"}
            </button>
            <button
              onClick={exportPdf}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Download size={16} />
              {exporting ? "Preparing..." : "PDF"}
            </button>
          </div>
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
