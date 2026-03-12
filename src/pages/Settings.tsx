import { useState, useEffect } from "react";
import { Cloud, Mail, Check, Loader2 } from "lucide-react";
import { safeGetItem, safeSetItem } from "../utils/storage";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../lib/firebase";

const CLOUD_ENABLED_KEY = "three-things-cloud-backup-enabled";
const EMAIL_FOR_LINK_KEY = "three-things-email-for-signin";

function getCloudEnabled(): boolean {
  return safeGetItem(CLOUD_ENABLED_KEY) === "true";
}

export default function Settings() {
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [sendingLink, setSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [completingLink, setCompletingLink] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync UI with Firebase auth when configured
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;
    const unsub = auth.onAuthStateChanged((user) => {
      setAuthEmail(user?.email ?? null);
      if (user) setLinkSent(false);
    });
    return unsub;
  }, []);

  // Persist cloud toggle preference
  useEffect(() => {
    setCloudEnabled(getCloudEnabled());
  }, []);

  // Complete sign-in when user lands from email link
  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !isSignInWithEmailLink(auth, window.location.href)) return;
    const email = safeGetItem(EMAIL_FOR_LINK_KEY);
    if (!email) {
      setAuthError("Open the link on the same device where you requested it, or enter your email below.");
      return;
    }
    setCompletingLink(true);
    setAuthError(null);
    signInWithEmailLink(auth, email, window.location.href)
      .then(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        safeSetItem(EMAIL_FOR_LINK_KEY, "");
        setCloudEnabled(true);
        safeSetItem(CLOUD_ENABLED_KEY, "true");
        window.dispatchEvent(new Event("cloudBackupChanged"));
      })
      .catch((err) => {
        setAuthError(err instanceof Error ? err.message : "Sign-in failed");
      })
      .finally(() => setCompletingLink(false));
  }, []);

  const handleCloudToggle = (on: boolean) => {
    setCloudEnabled(on);
    safeSetItem(CLOUD_ENABLED_KEY, String(on));
    window.dispatchEvent(new Event("cloudBackupChanged"));
    if (!on && isFirebaseConfigured && auth) {
      signOut(auth).catch(() => {});
      setAuthEmail(null);
      setLinkSent(false);
      setEmailInput("");
    } else if (!on) {
      setAuthEmail(null);
      setLinkSent(false);
      setEmailInput("");
    }
  };

  const handleSendLink = async () => {
    const email = emailInput.trim();
    if (!email || !isFirebaseConfigured || !auth) return;
    setSendingLink(true);
    setAuthError(null);
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/settings`,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      safeSetItem(EMAIL_FOR_LINK_KEY, email);
      setLinkSent(true);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Failed to send link");
    } finally {
      setSendingLink(false);
    }
  };

  const handleSignOut = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch {
        // ignore
      }
    }
    setAuthEmail(null);
    setLinkSent(false);
    setEmailInput("");
    setCloudEnabled(false);
    safeSetItem(CLOUD_ENABLED_KEY, "false");
    window.dispatchEvent(new Event("cloudBackupChanged"));
  };

  const signedIn = isFirebaseConfigured && authEmail;
  const showComingSoon = !isFirebaseConfigured;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-stone-900 mb-2">Settings</h1>
        <p className="text-stone-600">Preferences and backup options</p>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-8">
        {showComingSoon && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
              Coming soon
            </span>
          </div>
        )}
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
                {cloudEnabled || signedIn ? "Cloud backup is on" : "Cloud backup is off"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(cloudEnabled || signedIn)}
                onClick={() => handleCloudToggle(!(cloudEnabled || signedIn))}
                disabled={showComingSoon}
                className={`
                  relative inline-flex h-7 w-12 flex-shrink-0 rounded-full transition-colors
                  focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2
                  disabled:opacity-60 disabled:cursor-not-allowed
                  ${cloudEnabled || signedIn ? "bg-stone-900" : "bg-stone-200"}
                `}
              >
                <span
                  className={`
                    pointer-events-none absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow
                    transition-transform duration-200
                    ${cloudEnabled || signedIn ? "translate-x-5" : "translate-x-0"}
                  `}
                />
              </button>
            </div>

            {completingLink && (
              <p className="text-sm text-stone-600 mb-4 flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Completing sign-in…
              </p>
            )}

            {authError && (
              <p className="text-sm text-red-600 mb-4" role="alert">
                {authError}
              </p>
            )}

            {(cloudEnabled || signedIn) && !signedIn && !showComingSoon && (
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
                    onClick={() => handleSendLink()}
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
                    Check your inbox (and spam) and click the link to finish signing in.
                  </p>
                )}
              </div>
            )}

            {(cloudEnabled || signedIn) && signedIn && (
              <div className="border border-emerald-200 rounded-xl p-5 bg-emerald-50/70 flex flex-wrap
                items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <span className="text-sm font-medium">
                      {(authEmail ?? "").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">Signed in</p>
                    <p className="text-sm text-stone-600">{authEmail}</p>
                    <p className="text-xs text-emerald-700 mt-0.5">Your journal is backed up to the cloud</p>
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
