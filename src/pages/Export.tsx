import { useState } from "react";
import { format, parseISO } from "date-fns";
import { useEntries, DATA_VERSION } from "../hooks/useEntries";
import { Download, FileText, Table, File, FileCode } from "lucide-react";
import { Link } from "react-router-dom";

export default function Export() {
  const { entries, monthlyReflections, yearlyReviews } = useEntries();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "txt" | "markdown">("json");

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsJSON = () => {
    const exportData = {
      version: DATA_VERSION,
      exportDate: new Date().toISOString(),
      totalEntries: entries.length,
      totalMonthlyReflections: monthlyReflections.length,
      totalYearlyReviews: yearlyReviews.length,
      entries: entries.map((entry) => ({
        id: entry.id,
        date: entry.date,
        time: entry.time,
        items: entry.items.map((item) => ({
          text: item.text,
          favorite: item.favorite || false,
        })),
      })),
      monthlyReflections: monthlyReflections.map((reflection) => ({
        id: reflection.id,
        month: reflection.month,
        selectedFavorites: reflection.selectedFavorites,
        reflectionText: reflection.reflectionText,
        createdAt: reflection.createdAt,
      })),
      yearlyReviews: yearlyReviews.map((review) => ({
        id: review.id,
        year: review.year,
        reflectionText: review.reflectionText,
        createdAt: review.createdAt,
      })),
    };

    const content = JSON.stringify(exportData, null, 2);
    const filename = `three-things-${format(new Date(), "yyyy-MM-dd")}.json`;
    downloadFile(content, filename, "application/json");
  };

  const exportAsCSV = () => {
    const headers = [
      "Date",
      "Time",
      "Item 1",
      "Item 1 Starred",
      "Item 2",
      "Item 2 Starred",
      "Item 3",
      "Item 3 Starred",
    ];
    const rows = entries.map((entry) => [
      entry.date,
      entry.time,
      entry.items[0]?.text || "",
      entry.items[0]?.favorite ? "Yes" : "No",
      entry.items[1]?.text || "",
      entry.items[1]?.favorite ? "Yes" : "No",
      entry.items[2]?.text || "",
      entry.items[2]?.favorite ? "Yes" : "No",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const filename = `three-things-${format(new Date(), "yyyy-MM-dd")}.csv`;
    downloadFile(csvContent, filename, "text/csv");
  };

  const exportAsText = () => {
    const content = entries
      .map((entry) => {
        const date = format(parseISO(entry.date), "EEEE, MMMM d, yyyy");
        const items = entry.items
          .map((item, index) => `${index + 1}. ${item.text}${item.favorite ? " ★" : ""}`)
          .join("\n   ");

        return `${date} at ${entry.time}\n   ${items}\n`;
      })
      .join("\n");

    const header = `3Good - Reflection Journal\nExported: ${format(
      new Date(),
      "EEEE, MMMM d, yyyy 'at' HH:mm"
    )}\nTotal entries: ${entries.length}\n\n${"=".repeat(50)}\n\n`;

    const filename = `three-things-${format(new Date(), "yyyy-MM-dd")}.txt`;
    downloadFile(header + content, filename, "text/plain");
  };

  const exportAsMarkdown = () => {
    const content = entries
      .map((entry) => {
        const date = format(parseISO(entry.date), "EEEE, MMMM d, yyyy");
        const items = entry.items
          .map((item, index) => `${index + 1}. ${item.text}${item.favorite ? " ★" : ""}`)
          .join("\n");

        return `## ${date} at ${entry.time}\n\n${items}\n`;
      })
      .join("\n");

    const header = `# 3Good - Reflection Journal\n\n**Exported:** ${format(
      new Date(),
      "EEEE, MMMM d, yyyy 'at' HH:mm"
    )}  \n**Total entries:** ${entries.length}\n\n---\n\n`;

    const filename = `three-things-${format(new Date(), "yyyy-MM-dd")}.md`;
    downloadFile(header + content, filename, "text/markdown");
  };

  const handleExport = async () => {
    setIsExporting(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    switch (exportFormat) {
      case "json":
        exportAsJSON();
        break;
      case "csv":
        exportAsCSV();
        break;
      case "txt":
        exportAsText();
        break;
      case "markdown":
        exportAsMarkdown();
        break;
    }

    setIsExporting(false);
  };

  const formatOptions = [
    {
      value: "json",
      label: "JSON",
      icon: FileCode,
      description: "Structured data format for backup and import",
    },
    {
      value: "csv",
      label: "CSV",
      icon: Table,
      description: "Spreadsheet format for analysis and visualization",
    },
    {
      value: "txt",
      label: "Text",
      icon: FileText,
      description: "Simple text format for reading and sharing",
    },
    {
      value: "markdown",
      label: "Markdown",
      icon: File,
      description: "Formatted text with headers and styling",
    },
  ];

  if (entries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white border border-stone-200 rounded-2xl p-8">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Download size={24} className="text-stone-400" />
          </div>

          <h2 className="text-xl font-medium text-stone-900 mb-2">Nothing to export yet</h2>
          <p className="text-stone-600 mb-6">
            Start your reflection practice to create exportable content
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            Begin reflecting
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-stone-900 mb-2">Export</h1>
        <p className="text-stone-600">
          Download your {entries.length} {entries.length === 1 ? "reflection" : "reflections"}
          {monthlyReflections.length > 0 &&
            `, ${monthlyReflections.length} ${
              monthlyReflections.length === 1 ? "monthly review" : "monthly reviews"
            }`}
          {yearlyReviews.length > 0 &&
            `, and ${yearlyReviews.length} ${
              yearlyReviews.length === 1 ? "yearly review" : "yearly reviews"
            }`}{" "}
          in your preferred format
        </p>
      </div>

      {/* Format Selection */}
      <div className="bg-white border border-stone-200 rounded-2xl p-8 mb-8">
        <h2 className="font-medium text-stone-900 mb-6">Choose Format</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formatOptions.map((format) => {
            const Icon = format.icon;
            return (
              <label
                key={format.value}
                className={`
                  flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-200
                  ${
                    exportFormat === format.value
                      ? "border-stone-900 bg-stone-50"
                      : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }
                `}
              >
                <input
                  type="radio"
                  name="format"
                  value={format.value}
                  checked={exportFormat === format.value}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (
                      value === "json" ||
                      value === "csv" ||
                      value === "txt" ||
                      value === "markdown"
                    ) {
                      setExportFormat(value);
                    }
                  }}
                  className="sr-only"
                />

                <div
                  className={`
                  w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                  ${exportFormat === format.value ? "bg-stone-900" : "bg-stone-100"}
                `}
                >
                  <Icon
                    size={18}
                    className={exportFormat === format.value ? "text-white" : "text-stone-600"}
                  />
                </div>

                <div className="flex-1">
                  <div className="font-medium text-stone-900 mb-1">{format.label}</div>
                  <div className="text-sm text-stone-600">{format.description}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Export Action */}
      <div className="bg-stone-50 rounded-2xl p-8 text-center">
        <h3 className="font-medium text-stone-900 mb-2">Ready to Export</h3>
        <p className="text-stone-600 mb-6 text-sm">
          Your reflections will be downloaded as a {exportFormat.toUpperCase()} file
        </p>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`
            inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
            ${
              isExporting
                ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                : "bg-stone-900 text-white hover:bg-stone-800"
            }
          `}
        >
          <Download size={18} />
          {isExporting ? "Preparing download..." : "Download Export"}
        </button>

        <p className="text-xs text-stone-500 mt-4">
          Your data stays private — exports are generated locally on your device
        </p>
      </div>
    </div>
  );
}
