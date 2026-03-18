import { X } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISSED_KEY = "driveease_pwa_banner_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PWAInstallBanner() {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem(DISMISSED_KEY) === "true";
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!isMobile || dismissed || !promptEvent) return null;

  const handleInstall = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const result = await promptEvent.userChoice;
    if (result.outcome === "accepted") {
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
      className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white px-4 py-2 flex items-center gap-3 shadow-lg md:hidden"
      data-ocid="pwa_install.panel"
    >
      <div className="flex-1 text-sm font-medium leading-tight">
        📱 <span className="font-semibold">Install DriveEase App</span> — Add to
        your home screen for the best experience
      </div>
      <button
        type="button"
        onClick={handleInstall}
        className="shrink-0 bg-white text-green-700 text-xs font-bold px-3 py-1 rounded-full hover:bg-green-50 transition-colors"
        data-ocid="pwa_install.primary_button"
      >
        Install
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 p-1 rounded-full hover:bg-green-500 transition-colors"
        data-ocid="pwa_install.close_button"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
