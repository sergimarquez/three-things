import { useState, useEffect } from "react";
import { Cloud, Mail, Check, Loader2 } from "lucide-react";
import { safeGetItem, safeSetItem } from "../utils/storage";

const CLOUD_ENABLED_KEY = "three-things-cloud-backup-enabled";
const CLOUD_EMAIL_KEY = "three-things-cloud-backup-email";

function getCloudEnabled(): boolean {
  return safeGetItem(CLOUD_ENABLED_KEY) === "true";
}

function getCloudEmail(): string | null {
  return safeGetItem(CLOUD_EMAIL_KEY);
}

export default function Settings() {
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [cloudEmail, setCloudEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [sendingLink, setSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  useEffect(() => {
    setCloudEnabled(getCloudEnabled());
    setCloudEmail(getCloudEmail());
  }, []);

  const handleCloudToggle = (on: boolean) => {
    setCloudEnabled(on);
    safeSetItem(CLOUD_ENABLED_KEY, String(on));
    window.dispatchEvent(new Event("cloudBackupChanged"));
    if (!on) {
      setCloudEmail(null);
      safeSetItem(CLOUD_EMAIL_KEY, "");
      setLinkSent(false);
      setEmailInput("");
    }
  };

  const handleSendLink = () => {
    if (!emailInput.trim()) return;
    setSendingLink(true);
    setTimeout(() => {
      setSendingLink(false);
      setLinkSent(true);
      setCloudEmail(emailInput.trim());
      safeSetItem(CLOUD_EMAIL_KEY, emailInput.trim());
    }, 1500);
  };

  const handleSignOut = () => {
    setCloudEmail(null);
    safeSetItem(CLOUD_EMAIL_KEY, "");
    setLinkSent(false);
    setEmailInput("");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-stone-900 mb-2">Settings</h1>
        <p className="text-stone-600">Preferences and backup options</p>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
            Coming soon
          </span>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
            <Cloud size={24} className="text-stone-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-medium text-stone-900 mb-1">Cloud backup</h2>
            <p className="text-sm text-stone-600 mb-6">
              Save your journal to the cloud and access it from any device. Your data stays private
              and encrypted.
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <span className="text-sm text-stone-700">
                {cloudEnabled ? "Cloud backup is on" : "Cloud backup is off"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={cloudEnabled}
                onClick={() => handleCloudToggle(!cloudEnabled)}
                className={`
                  relative inline-flex h-7 w-12 flex-shrink-0 rounded-full transition-colors
                  focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2
                  ${cloudEnabled ? "bg-stone-900" : "bg-stone-200"}
                `}
              >
                <span
                  className={`
                    pointer-events-none absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow
                    transition-transform duration-200
                    ${cloudEnabled ? "translate-x-5" : "translate-x-0"}
                  `}
                />
              </button>
            </div>

            {cloudEnabled && !cloudEmail && (
              <div className="border border-stone-200 rounded-xl p-5 bg-stone-50">
                <p className="text-sm text-stone-700 mb-4">
                  Sign in with your email. We’ll send you a link — no password needed.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendLink()}
                      disabled={sendingLink || linkSent}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200
                        text-stone-900 placeholder:text-stone-400 focus:outline-none
                        focus:ring-2 focus:ring-stone-400 focus:border-transparent
                        disabled:bg-stone-100 disabled:text-stone-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendLink}
                    disabled={!emailInput.trim() || sendingLink}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5
                      rounded-lg font-medium bg-stone-900 text-white hover:bg-stone-800
                      disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed
                      transition-colors"
                  >
                    {sendingLink ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Sending…
                      </>
                    ) : linkSent ? (
                      <>
                        <Check size={18} />
                        Sent
                      </>
                    ) : (
                      "Send link"
                    )}
                  </button>
                </div>
                {linkSent && (
                  <p className="text-sm text-stone-500 mt-3">
                    Check your inbox and click the link to finish signing in.
                  </p>
                )}
              </div>
            )}

            {cloudEnabled && cloudEmail && (
              <div className="border border-stone-200 rounded-xl p-5 bg-stone-50 flex flex-wrap
                items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-stone-700">
                      {cloudEmail.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">Signed in</p>
                    <p className="text-sm text-stone-600">{cloudEmail}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-sm text-stone-600 hover:text-stone-900 underline"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
