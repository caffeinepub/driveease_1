import { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav";
import ChatbotWidget from "./components/ChatbotWidget";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import PWAInstallBanner from "./components/PWAInstallBanner";
import { useActor } from "./hooks/useActor";
import AdminDashboard from "./pages/AdminDashboard";
import AvailableDriversPage from "./pages/AvailableDriversPage";
import BookingPage from "./pages/BookingPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import DriverLoginPage from "./pages/DriverLoginPage";
import DriverNavPage from "./pages/DriverNavPage";
import DriverRegistrationPage from "./pages/DriverRegistrationPage";
import DriversPage from "./pages/DriversPage";
import HomePage from "./pages/HomePage";
import InsurancePage from "./pages/InsurancePage";
import LiveDriversPage from "./pages/LiveDriversPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import OtpLoginPage from "./pages/OtpLoginPage";
import PaymentFailurePage from "./pages/PaymentFailurePage";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import TrackingPage from "./pages/TrackingPage";
import { RouterProvider, usePath } from "./router";

// ─── Welcome Splash Screen ────────────────────────────────────────────────────
function WelcomeSplash({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2200);
    const doneTimer = setTimeout(() => onDone(), 2700);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.5s ease",
        pointerEvents: fading ? "none" : "all",
      }}
    >
      <style>{`
        @keyframes carDrive {
          0%   { transform: translateX(-140px); }
          100% { transform: translateX(calc(100vw + 140px)); }
        }
        @keyframes speedTrail {
          0%   { opacity: 0; width: 0; }
          30%  { opacity: 0.7; }
          100% { opacity: 0; width: 180px; }
        }
        @keyframes splashLogoIn {
          0%   { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes splashTagIn {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .splash-logo { animation: splashLogoIn 0.6s ease forwards; }
        .splash-tag  { animation: splashTagIn 0.6s ease 0.5s forwards; opacity: 0; }
        .splash-car  {
          animation: carDrive 2s cubic-bezier(0.25, 0.1, 0.25, 1) 0.4s forwards;
          position: absolute;
          bottom: 80px;
          left: 0;
          display: flex;
          align-items: center;
          gap: 0;
        }
        .splash-trail {
          animation: speedTrail 2s ease 0.4s forwards;
          height: 6px;
          background: linear-gradient(to left, transparent, rgba(22,163,74,0.8), rgba(74,222,128,0.4));
          border-radius: 99px;
          width: 0;
          opacity: 0;
          margin-right: -4px;
        }
      `}</style>

      {/* Road line */}
      <div
        style={{
          position: "absolute",
          bottom: 88,
          left: 0,
          right: 0,
          height: 2,
          background:
            "repeating-linear-gradient(90deg, rgba(22,163,74,0.4) 0px, rgba(22,163,74,0.4) 32px, transparent 32px, transparent 64px)",
        }}
      />

      {/* Logo */}
      <div
        className="splash-logo"
        style={{ textAlign: "center", marginBottom: 12 }}
      >
        <div
          style={{
            fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
            fontWeight: 900,
            color: "#4ade80",
            letterSpacing: "0.06em",
            textShadow:
              "2px 2px 0 #065f46, 4px 4px 0 #064e3b, 6px 6px 0 #022c22, 0 0 60px rgba(74,222,128,0.5)",
            lineHeight: 1,
          }}
        >
          🚗 DriveEase
        </div>
      </div>

      {/* Tagline */}
      <div
        className="splash-tag"
        style={{
          color: "#cbd5e1",
          fontSize: "clamp(0.9rem, 3vw, 1.2rem)",
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        India's First Personal Driver Network
      </div>

      {/* Animated car driving across */}
      <div className="splash-car">
        <div className="splash-trail" />
        <span style={{ fontSize: "clamp(2rem, 6vw, 3rem)", lineHeight: 1 }}>
          🚗
        </span>
      </div>
    </div>
  );
}

// ─── Car Driving Strip (Home page only) ──────────────────────────────────────
function CarDrivingStrip() {
  return (
    <>
      <style>{`
        @keyframes carLoop {
          0%   { transform: translateX(-120px); }
          100% { transform: translateX(calc(100vw + 120px)); }
        }
        @keyframes carLoopTrail {
          0%   { opacity: 0; transform: scaleX(0); transform-origin: right; }
          20%  { opacity: 0.6; }
          80%  { opacity: 0.6; }
          100% { opacity: 0; }
        }
        .car-strip-car {
          animation: carLoop 8s linear infinite;
          position: absolute;
          bottom: 8px;
          left: 0;
          display: flex;
          align-items: center;
        }
        .car-strip-trail {
          width: 80px;
          height: 4px;
          background: linear-gradient(to left, transparent, rgba(74,222,128,0.6));
          border-radius: 99px;
          margin-right: -4px;
          animation: carLoopTrail 8s linear infinite;
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          bottom: 56,
          left: 0,
          right: 0,
          height: 60,
          zIndex: 30,
          background: "rgba(15,23,42,0.92)",
          backdropFilter: "blur(4px)",
          borderTop: "1px solid rgba(22,163,74,0.25)",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {/* Road dashes */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 2,
            marginTop: 8,
            background:
              "repeating-linear-gradient(90deg, rgba(22,163,74,0.35) 0px, rgba(22,163,74,0.35) 24px, transparent 24px, transparent 48px)",
          }}
        />
        <div className="car-strip-car">
          <div className="car-strip-trail" />
          <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>🚗</span>
        </div>
      </div>
    </>
  );
}

// ─── Car Sidebar Poster (every non-admin page, desktop only) ─────────────────
function CarSidebarPoster() {
  return (
    <>
      <style>{`
        @keyframes carBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes sidebarFadeIn {
          from { opacity: 0; transform: translateY(-50%) translateX(20px); }
          to   { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
        .car-sidebar-emoji {
          animation: carBounce 1.8s ease-in-out infinite;
          display: inline-block;
        }
        .car-sidebar {
          animation: sidebarFadeIn 0.6s ease 1s forwards;
          opacity: 0;
        }
      `}</style>
      <div
        className="car-sidebar hidden md:flex"
        style={{
          position: "fixed",
          right: 16,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 25,
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          background: "rgba(5,46,22,0.9)",
          border: "1px solid rgba(22,163,74,0.4)",
          borderRadius: 99,
          padding: "14px 8px",
          width: 48,
          boxShadow:
            "0 4px 24px rgba(0,0,0,0.4), 0 0 12px rgba(22,163,74,0.15)",
          backdropFilter: "blur(8px)",
          pointerEvents: "none",
        }}
      >
        <span className="car-sidebar-emoji" style={{ fontSize: "1.4rem" }}>
          🚗
        </span>
        <span
          style={{
            fontSize: "0.5rem",
            fontWeight: 800,
            color: "#4ade80",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
          }}
        >
          DRIVE
        </span>
      </div>
    </>
  );
}

// ─── Main App Content ─────────────────────────────────────────────────────────
function AppContent() {
  const rawPath = usePath();
  const path = rawPath.split("?")[0];
  const { actor } = useActor();
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem("driveease_welcomed");
  });

  useEffect(() => {
    if (actor) {
      actor.initializeApp().catch(() => {});
    }
  }, [actor]);

  const handleSplashDone = () => {
    sessionStorage.setItem("driveease_welcomed", "1");
    setShowSplash(false);
  };

  if (path === "/admin") {
    return <AdminDashboard />;
  }

  // Standalone full-page routes (no navbar/footer)
  if (path === "/payment-success") return <PaymentSuccessPage />;
  if (path === "/payment-failure") return <PaymentFailurePage />;

  const isHome = path === "/";

  return (
    <>
      {showSplash && <WelcomeSplash onDone={handleSplashDone} />}
      <div className="min-h-screen flex flex-col">
        <PWAInstallBanner />
        <Navbar />
        <main className="flex-1 pb-20 md:pb-0">
          {path === "/" && <HomePage />}
          {path === "/drivers" && <DriversPage />}
          {path === "/live-drivers" && <LiveDriversPage />}
          {path.startsWith("/book/") && <BookingPage />}
          {path === "/register-driver" && <DriverRegistrationPage />}
          {path === "/subscriptions" && <SubscriptionsPage />}
          {path === "/insurance" && <InsurancePage />}
          {path === "/my-bookings" && <MyBookingsPage />}
          {path === "/login" && <OtpLoginPage />}
          {path === "/payment" && <PaymentPage />}
          {path === "/driver-nav" && <DriverNavPage />}
          {path === "/driver-login" && <DriverLoginPage />}
          {path === "/profile" && <CustomerProfilePage />}
          {path === "/available-drivers" && <AvailableDriversPage />}
          {path.startsWith("/track/") && <TrackingPage />}
          {![
            "/",
            "/drivers",
            "/live-drivers",
            "/register-driver",
            "/subscriptions",
            "/insurance",
            "/my-bookings",
            "/login",
            "/payment",
            "/driver-nav",
            "/profile",
            "/available-drivers",
          ].includes(path) &&
            !path.startsWith("/book/") &&
            !path.startsWith("/track/") &&
            path !== "/driver-login" && <HomePage />}
        </main>
        <Footer />
        <BottomNav />
        {/* Car driving strip — home page only */}
        {isHome && <CarDrivingStrip />}
        {/* Car sidebar poster — all non-admin pages, desktop only */}
        <CarSidebarPoster />
        {/* Floating WhatsApp Button */}
        <a
          href="https://wa.me/917836887228"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 bg-[#25D366] hover:bg-[#20b558] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl transition-transform hover:scale-110"
          title="Chat on WhatsApp"
          data-ocid="whatsapp.button"
          aria-label="Chat with us on WhatsApp"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-7 h-7"
            role="img"
            aria-label="WhatsApp"
          >
            <title>WhatsApp</title>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
        {/* AI Chatbot Widget */}
        <ChatbotWidget />
      </div>
    </>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}
