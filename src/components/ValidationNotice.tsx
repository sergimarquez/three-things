import { AlertTriangle, X, Download } from "lucide-react";
import { Link } from "react-router-dom";
import type { ValidationError } from "../utils/validation";

interface Props {
  errors: ValidationError[];
  onDismiss: () => void;
}

/**
 * Component to display data validation errors
 * Shows when corrupted/invalid data is detected and filtered out
 */
export default function ValidationNotice({ errors, onDismiss }: Props) {
  if (errors.length === 0) return null;

  const entryErrors = errors.filter((e) => e.type === "invalid_entry").length;
  const reflectionErrors = errors.filter((e) => e.type === "invalid_reflection").length;
  const reviewErrors = errors.filter((e) => e.type === "invalid_review").length;

  const totalErrors = errors.length;
  const errorSummary = [
    entryErrors > 0 && `${entryErrors} entr${entryErrors === 1 ? "y" : "ies"}`,
    reflectionErrors > 0 &&
      `${reflectionErrors} monthly reflection${reflectionErrors === 1 ? "" : "s"}`,
    reviewErrors > 0 && `${reviewErrors} yearly review${reviewErrors === 1 ? "" : "s"}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-4xl mx-auto mb-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-yellow-900 mb-1">
              Some data was invalid and has been filtered out
            </h3>
            <p className="text-sm text-yellow-800 mb-3">
              We found {totalErrors} invalid {totalErrors === 1 ? "item" : "items"} ({errorSummary}
              ). These have been skipped to prevent errors. Your valid data is safe.
            </p>
            <div className="flex items-center gap-2">
              <Link
                to="/export"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                <Download size={14} />
                Export Backup
              </Link>
              <button
                onClick={onDismiss}
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm"
              >
                <X size={14} />
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
