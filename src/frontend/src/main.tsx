import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const queryClient = new QueryClient();

// Register service worker and handle automatic updates
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");

      // When a new service worker takes control, reload to get the latest version
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });

      // Listen for SW_UPDATED message from the new service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "SW_UPDATED") {
          window.location.reload();
        }
      });

      // Check for updates every 60 seconds
      setInterval(() => {
        registration.update().catch(() => {});
      }, 60 * 1000);
    } catch (err) {
      console.warn("Service worker registration failed:", err);
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <App />
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
