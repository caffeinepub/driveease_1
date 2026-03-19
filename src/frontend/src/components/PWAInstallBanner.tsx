import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISSED_KEY = "driveease_pwa_banner_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let globalPromptEvent: BeforeInstallPromptEvent | null = null;
const listeners: Set<() => void> = new Set();

window.addEventListener("beforeinstallprompt", (e: Event) => {
  e.preventDefault();
  globalPromptEvent = e as BeforeInstallPromptEvent;
  for (const fn of listeners) fn();
});

export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(globalPromptEvent);

  useEffect(() => {
    const update = () => setPromptEvent(globalPromptEvent);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const triggerInstall = async () => {
    if (!promptEvent) return false;
    await promptEvent.prompt();
    const result = await promptEvent.userChoice;
    if (result.outcome === "accepted") {
      globalPromptEvent = null;
      setPromptEvent(null);
    }
    return result.outcome === "accepted";
  };

  return { canInstall: !!promptEvent, triggerInstall };
}

export default function PWAInstallBanner() {
  const { canInstall, triggerInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem(DISMISSED_KEY) === "true";
  });

  if (dismissed || !canInstall) return null;

  const handleInstall = async () => {
    const accepted = await triggerInstall();
    if (accepted) {
      setDismissed(true);
      localStorage.setItem(DISMISSED_KEY, "true");
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-green-700 text-white px-4 py-2.5 flex items-center gap-3 shadow-lg"
      data-ocid="pwa_install.panel"
    >
      <Download className="w-4 h-4 shrink-0" />
      <div className="flex-1 text-sm font-medium leading-tight">
        <span className="font-semibold">Install DriveEase App</span>
        <span className="hidden sm:inline text-green-200">
          {" "}
          — Add to your home screen for the best experience
        </span>
      </div>
      <button
        type="button"
        onClick={handleInstall}
        className="shrink-0 bg-white text-green-700 text-xs font-bold px-4 py-1.5 rounded-full hover:bg-green-50 transition-colors"
        data-ocid="pwa_install.primary_button"
      >
        Install Free
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 p-1 rounded-full hover:bg-green-600 transition-colors"
        data-ocid="pwa_install.close_button"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
