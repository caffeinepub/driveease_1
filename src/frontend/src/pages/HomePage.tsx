import {
  CheckCircle,
  Copy,
  CreditCard,
  Eye,
  Phone,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import AnimatedLogo from "../components/AnimatedLogo";
import SparkleBackground from "../components/SparkleBackground";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Link } from "../router";

const differentiators = [
  {
    icon: <Shield className="text-primary" size={32} />,
    title: "Assigned Driver System",
    desc: "Same trusted driver for office, parents, kids, and medical visits.",
  },
  {
    icon: <Users className="text-primary" size={32} />,
    title: "Family Account",
    desc: "One account, multiple family members. SOS alerts go directly to family.",
  },
  {
    icon: <CreditCard className="text-primary" size={32} />,
    title: "Subscription Plans",
    desc: "Monthly plans with predictable pricing and total peace of mind.",
  },
  {
    icon: <Eye className="text-primary" size={32} />,
    title: "Trust Transparency",
    desc: "See police verification, training, medical fitness, and experience upfront.",
  },
];

const familyFeatures = [
  "Choose who can book and who can only track",
  "Spending limits per family member",
  "Live tracking shared with family",
  "SOS alerts go directly to family members",
  "One trusted driver for the entire family",
  "NRI-friendly: manage from anywhere",
];

const trustIndicators = [
  { icon: "⭐", value: "4.8 Rating" },
  { icon: "🚗", value: "5000+ Drivers" },
  { icon: "👥", value: "10,000+ Customers" },
  { icon: "✅", value: "Aadhaar Verified" },
];

// Neon divider component
function NeonDivider() {
  return (
    <div
      style={{
        height: "2px",
        background:
          "linear-gradient(90deg, transparent 0%, #34d399 30%, #059669 50%, #34d399 70%, transparent 100%)",
        backgroundSize: "200% 100%",
        animation: "dividerShimmer 3s linear infinite",
        margin: 0,
      }}
    />
  );
}

export default function HomePage() {
  const [copied, setCopied] = useState("");
  const [showWelcome, setShowWelcome] = useState(() => {
    return !sessionStorage.getItem("de_welcomed");
  });

  useEffect(() => {
    if (showWelcome) {
      const t = setTimeout(() => {
        sessionStorage.setItem("de_welcomed", "1");
        setShowWelcome(false);
      }, 4500);
      return () => clearTimeout(t);
    }
  }, [showWelcome]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="bg-white">
      <SparkleBackground density={30} />
      <style>{`
        @keyframes sparkleFloat {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-30px) scale(1.2); opacity: 0.9; }
          100% { transform: translateY(-60px) scale(0.8); opacity: 0; }
        }
        @keyframes sparkleTwinkle {
          0%, 100% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1); opacity: 0.8; }
        }
        @keyframes bubbleOrbit {
          from { transform: rotate(0deg) translateX(180px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(180px) rotate(-360deg); }
        }
        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 8px 0 #78350f, 0 14px 24px rgba(0,0,0,0.5), 0 0 0 0 rgba(253,186,116,0); }
          50% { box-shadow: 0 8px 0 #78350f, 0 14px 24px rgba(0,0,0,0.5), 0 0 24px 6px rgba(253,186,116,0.35); }
        }
        @keyframes heroImgGlow {
          0%, 100% { box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 2px rgba(22,163,74,0.4), 0 0 30px rgba(22,163,74,0.15); }
          50% { box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 2px rgba(22,163,74,0.7), 0 0 60px rgba(22,163,74,0.3); }
        }
        .anim-hero-badge { animation: fadeSlideUp 0.6s ease forwards; opacity: 0; animation-delay: 0.1s; }
        .anim-hero-h1 { animation: fadeSlideUp 0.7s ease forwards; opacity: 0; animation-delay: 0.25s; }
        .anim-hero-sub { animation: fadeSlideUp 0.7s ease forwards; opacity: 0; animation-delay: 0.4s; }
        .anim-hero-btns { animation: fadeSlideUp 0.7s ease forwards; opacity: 0; animation-delay: 0.55s; }
        .anim-hero-trust { animation: fadeSlideUp 0.7s ease forwards; opacity: 0; animation-delay: 0.7s; }
        .anim-hero-img { animation: fadeSlideUp 0.9s ease forwards; opacity: 0; animation-delay: 0.3s; }
        .hero-img-glow {
          animation: heroImgGlow 3s ease-in-out infinite;
          border-radius: 20px;
        }
        /* bubble buttons */
        .bubble-btn-green {
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 60%, #4ade80 100%);
          color: white;
          border-radius: 9999px;
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          padding: 16px 36px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          cursor: pointer;
          font-family: 'Exo 2', sans-serif;
          position: relative;
          animation: bubblePulse 2s infinite;
          transition: transform 0.15s ease, filter 0.15s ease;
          box-shadow: 0 4px 15px rgba(34,197,94,0.5);
        }
        .bubble-btn-green:hover { transform: scale(1.06); filter: brightness(1.1); }
        .bubble-btn-green:active { transform: scale(0.97); }
        .bubble-btn-white {
          background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
          color: #064e3b;
          border-radius: 9999px;
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          padding: 16px 36px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 2px solid #22c55e;
          cursor: pointer;
          font-family: 'Exo 2', sans-serif;
          position: relative;
          animation: bubblePulse 2s infinite 0.5s;
          transition: transform 0.15s ease, filter 0.15s ease;
          box-shadow: 0 4px 15px rgba(34,197,94,0.3);
        }
        .bubble-btn-white:hover { transform: scale(1.06); filter: brightness(1.05); }
        .bubble-btn-white:active { transform: scale(0.97); }
        .text-3d-green {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(1.6rem, 4vw, 3rem);
          font-weight: 900;
          letter-spacing: 0.08em;
          text-shadow: 2px 2px 0px #065f46, 4px 4px 0px #064e3b, 6px 6px 0px #022c22, 0 0 40px rgba(34,197,94,0.4);
          line-height: 1;
        }
        .section-heading {
          font-family: 'Exo 2', sans-serif;
        }
        .brand-text {
          font-family: 'Orbitron', sans-serif;
        }
        .shimmer-text {
          background: linear-gradient(90deg, #16a34a 0%, #4ade80 40%, #86efac 50%, #4ade80 60%, #16a34a 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* ===== WELCOME SCREEN OVERLAY ===== */}
      {showWelcome && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background:
              "linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #ecfdf5 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            animation: "welcomeFadeOut 0.7s ease 2.3s forwards",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          {/* Subtle top accent bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #059669, #34d399, #059669)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s linear infinite",
            }}
          />

          {/* Logo */}
          <div
            style={{
              animation:
                "welcomeLogoIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both",
              textAlign: "center",
            }}
          >
            <img
              src="/assets/generated/driveease-logo-3d-transparent.dim_400x200.png"
              alt="DriveEase"
              style={{
                height: "80px",
                width: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 4px 16px rgba(234,88,12,0.3))",
              }}
            />
          </div>

          {/* Brand name */}
          <div
            style={{
              fontFamily: "Exo 2, sans-serif",
              fontSize: "clamp(2rem, 7vw, 3.5rem)",
              fontWeight: 900,
              letterSpacing: "0.12em",
              marginTop: "16px",
              background:
                "linear-gradient(135deg, #059669 0%, #34d399 50%, #047857 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "welcomeLogoIn 0.7s ease 0.35s both",
            }}
          >
            DRIVEEASE
          </div>

          {/* Tagline */}
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.95rem",
              color: "#6b7280",
              letterSpacing: "0.05em",
              marginTop: "10px",
              animation: "welcomeTagIn 0.6s ease 0.6s both",
            }}
          >
            India's First Personal Driver Network
          </p>

          {/* Loading bar */}
          <div
            style={{
              width: "160px",
              height: "3px",
              background: "#bbf7d0",
              borderRadius: "999px",
              overflow: "hidden",
              marginTop: "32px",
              animation: "welcomeTagIn 0.4s ease 0.8s both",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #059669, #34d399)",
                animation: "welcomeBarFill 2s ease 0.85s forwards",
                width: "0%",
              }}
            />
          </div>
        </div>
      )}

      {/* ===== FLOATING CAR WIDGET (Desktop Only) =====

      {/* ===== FLOATING CAR WIDGET (Desktop Only) ===== */}
      <div
        className="hidden md:block"
        style={{
          position: "fixed",
          bottom: "80px",
          right: "20px",
          zIndex: 40,
          animation: "floatUp 3s ease-in-out infinite",
          cursor: "pointer",
          filter: "drop-shadow(0 4px 12px rgba(22,163,74,0.4))",
        }}
        title="DriveEase - Book a Driver"
      >
        <svg
          width="60"
          height="35"
          viewBox="0 0 60 35"
          fill="none"
          aria-label="DriveEase floating car"
        >
          <title>DriveEase Floating Car</title>
          <rect x="5" y="12" width="50" height="16" rx="4" fill="#16a34a" />
          <path d="M15 12 L22 4 L40 4 L47 12Z" fill="#15803d" />
          <rect
            x="24"
            y="5"
            width="14"
            height="6"
            rx="1"
            fill="#bfdbfe"
            opacity="0.9"
          />
          <ellipse cx="53" cy="20" rx="4" ry="3" fill="#fef9c3" />
          <circle cx="18" cy="28" r="6" fill="#111827" />
          <circle cx="18" cy="28" r="3" fill="#6b7280" />
          <circle cx="44" cy="28" r="6" fill="#111827" />
          <circle cx="44" cy="28" r="3" fill="#6b7280" />
          <line
            x1="0"
            y1="16"
            x2="4"
            y2="16"
            stroke="#4ade80"
            strokeWidth="1.5"
          />
          <line
            x1="0"
            y1="20"
            x2="3"
            y2="20"
            stroke="#4ade80"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
        {/* Subtle decorative circles for clean light theme */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <div
            style={{
              position: "absolute",
              top: "10%",
              right: "5%",
              width: "320px",
              height: "320px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(234,88,12,0.06) 0%, transparent 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "20%",
              right: "15%",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(234,88,12,0.04) 0%, transparent 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "2%",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-16 md:py-0 flex flex-col md:flex-row items-center gap-10 md:gap-0 min-h-screen">
          <div className="flex-1 flex flex-col items-center md:items-start justify-center text-center md:text-left md:pr-10">
            <div className="anim-hero-badge">
              <Badge className="bg-green-100 text-green-700 border border-green-200 mb-5 text-xs tracking-widest uppercase px-3 py-1">
                India's First Personal Driver Network
              </Badge>
            </div>
            {/* DriveEase logo */}
            <div
              className="mb-4"
              style={{ animation: "floatUpDown 3s ease-in-out infinite" }}
            >
              <AnimatedLogo size="lg" />
            </div>
            <h1
              style={{ fontFamily: "Exo 2, sans-serif" }}
              className="anim-hero-h1 text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-5"
            >
              Book a Professional Driver
              <br />
              <span className="text-primary">Anytime, Anywhere</span>
            </h1>
            <p className="anim-hero-sub text-lg text-gray-600 mb-8 max-w-lg">
              Verified drivers across India. Safe, reliable, and affordable
              rides at your fingertips.
            </p>
            <div className="anim-hero-btns mb-10">
              <div className="flex items-center gap-6">
                {/* Icon-only bubble: Driver Login */}
                <div className="flex flex-col items-center gap-2 group">
                  <Link
                    to="/driver-login"
                    data-ocid="hero.primary_button"
                    className="hover:scale-110 active:scale-95"
                  >
                    <div
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #059669 0%, #34d399 100%)",
                        boxShadow:
                          "0 6px 0 #047857, 0 10px 24px rgba(5,150,105,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.8rem",
                        transition: "transform 0.15s ease",
                      }}
                    >
                      🎛️
                    </div>
                  </Link>
                  <span className="text-xs font-semibold text-gray-500 group-hover:text-primary transition-colors">
                    Captain Login
                  </span>
                </div>

                <div className="text-gray-300 text-2xl font-light select-none">
                  ·
                </div>

                {/* Icon-only bubble: Book Driver */}
                <div className="flex flex-col items-center gap-2 group">
                  <Link
                    to="/drivers"
                    data-ocid="hero.secondary_button"
                    className="hover:scale-110 active:scale-95"
                  >
                    <div
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
                        boxShadow:
                          "0 6px 0 #111827, 0 10px 24px rgba(0,0,0,0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.8rem",
                        transition: "transform 0.15s ease",
                      }}
                    >
                      📍
                    </div>
                  </Link>
                  <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-800 transition-colors">
                    Book Driver
                  </span>
                </div>

                <div className="text-gray-300 text-2xl font-light select-none">
                  ·
                </div>

                {/* Text CTA */}
                <Link
                  to="/drivers"
                  data-ocid="hero.primary_button"
                  className="px-6 py-3.5 rounded-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold text-sm tracking-wide transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30"
                >
                  Book Now →
                </Link>
              </div>
            </div>
            <div className="anim-hero-trust flex flex-wrap justify-center md:justify-start gap-3">
              {trustIndicators.map((t) => (
                <div
                  key={t.value}
                  className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-700 font-medium"
                >
                  <span>{t.icon}</span>
                  <span>{t.value}</span>
                </div>
              ))}
            </div>
            {/* Mobile car bubble sticker */}
            <div
              className="md:hidden mt-8 flex items-center justify-center"
              style={{ animation: "floatUpDown 3s ease-in-out infinite" }}
            >
              <div
                style={{
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 35% 30%, #1a4a2a 0%, #0a2010 40%, #050f08 100%)",
                  border: "3px solid rgba(74,222,128,0.5)",
                  boxShadow:
                    "0 0 40px rgba(34,197,94,0.4), inset 0 0 20px rgba(34,197,94,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "12%",
                    left: "15%",
                    width: "55%",
                    height: "35%",
                    background:
                      "radial-gradient(ellipse at 40% 40%, rgba(255,255,255,0.22) 0%, transparent 70%)",
                    borderRadius: "50%",
                  }}
                />
                <svg
                  width="140"
                  height="56"
                  viewBox="0 0 200 80"
                  fill="none"
                  aria-label="Mobile car bubble"
                >
                  <title>Mobile Car Bubble</title>
                  <rect
                    x="20"
                    y="30"
                    width="160"
                    height="35"
                    rx="8"
                    fill="#16a34a"
                  />
                  <path d="M55 30 L75 10 L130 10 L150 30Z" fill="#15803d" />
                  <rect
                    x="80"
                    y="13"
                    width="45"
                    height="14"
                    rx="2"
                    fill="#93c5fd"
                    opacity="0.8"
                  />
                  <ellipse cx="178" cy="47" rx="8" ry="5" fill="#fef9c3" />
                  <circle cx="60" cy="65" r="13" fill="#111827" />
                  <circle cx="60" cy="65" r="7" fill="#374151" />
                  <circle cx="145" cy="65" r="13" fill="#111827" />
                  <circle cx="145" cy="65" r="7" fill="#374151" />
                </svg>
                <div
                  style={{
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "0.55rem",
                    fontWeight: 900,
                    letterSpacing: "0.2em",
                    color: "#4ade80",
                    textShadow: "0 0 8px rgba(74,222,128,0.8)",
                    marginTop: "4px",
                  }}
                >
                  DRIVEEASE
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-center md:justify-end">
            <div
              className="anim-hero-img relative"
              style={{ animation: "floatUpDown 3s ease-in-out infinite" }}
            >
              {/* Driver + Car photo */}
              <div style={{ position: "relative" }}>
                <img
                  src="/assets/generated/driveease-driver-car.dim_800x600.png"
                  alt="DriveEase Driver"
                  style={{
                    width: "100%",
                    maxWidth: "420px",
                    borderRadius: "24px",
                    boxShadow:
                      "0 32px 80px rgba(0,0,0,0.25), 0 0 0 2px rgba(52,211,153,0.4), 0 0 40px rgba(16,185,129,0.15)",
                    display: "block",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "16px",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    background: "rgba(5,150,105,0.9)",
                    backdropFilter: "blur(8px)",
                    color: "#fff",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    letterSpacing: "0.2em",
                    padding: "6px 0",
                    textTransform: "uppercase",
                    borderRadius: "0 0 24px 24px",
                  }}
                >
                  DRIVEEASE — VERIFIED CAPTAIN
                </div>
              </div>
              {/* Floating stats bubbles */}
              <div
                style={{
                  position: "absolute",
                  top: "5%",
                  right: "-10px",
                  background: "#fff",
                  borderRadius: "999px",
                  padding: "8px 16px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  border: "1px solid #f3f4f6",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#1f2937",
                  whiteSpace: "nowrap",
                }}
              >
                ⭐ 4.8 Rating
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "10%",
                  left: "-10px",
                  background: "#fff",
                  borderRadius: "999px",
                  padding: "8px 16px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  border: "1px solid #f3f4f6",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#1f2937",
                  whiteSpace: "nowrap",
                }}
              >
                ✅ Verified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEON DIVIDER ===== */}
      <NeonDivider />

      {/* ===== 3D LOGO SHOWCASE ===== */}
      <section
        style={{
          background: "linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 100%)",
          padding: "40px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <style>{`
          @keyframes logoFloat {
            0%, 100% { transform: translateY(0px); filter: drop-shadow(0 0 20px #22c55e) drop-shadow(0 0 40px #16a34a); }
            50% { transform: translateY(-15px); filter: drop-shadow(0 0 30px #4ade80) drop-shadow(0 0 60px #22c55e); }
          }
          @keyframes badgeRotate {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "40px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <AnimatedLogo size="lg" />
          <img
            src="/assets/generated/driveease-badge-transparent.dim_200x200.png"
            alt="DriveEase Trusted Badge"
            style={{
              height: "90px",
              width: "90px",
              objectFit: "contain",
              animation: "badgeRotate 10s linear infinite",
            }}
          />
        </div>
        <p
          style={{
            fontFamily: "Orbitron, sans-serif",
            color: "#4ade80",
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          India's First Personal Driver Network
        </p>
      </section>

      {/* ===== CAR BANNER ===== */}
      <div style={{ width: "100%", overflow: "hidden", maxHeight: "220px" }}>
        <img
          src="/assets/generated/driveease-car-banner.dim_1200x400.jpg"
          alt="DriveEase car banner"
          style={{
            width: "100%",
            height: "220px",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            opacity: 0.9,
          }}
        />
      </div>

      {/* ===== ANIMATED CAR STRIP ===== */}
      <div
        style={{
          background: "#0f1a0f",
          overflow: "hidden",
          height: "120px",
          position: "relative",
          borderTop: "2px solid #16a34a33",
          borderBottom: "2px solid #16a34a33",
        }}
      >
        {/* Road */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            left: 0,
            right: 0,
            height: "60px",
            background: "#1c1c1c",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              left: 0,
              right: 0,
              height: "3px",
              backgroundImage:
                "repeating-linear-gradient(90deg, #fbbf24 0px, #fbbf24 30px, transparent 30px, transparent 60px)",
              animation: "roadScroll 0.3s linear infinite",
            }}
          />
        </div>

        {/* Car 1 - green, drives left to right */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-60%)",
            animation: "carDrive 6s linear infinite",
          }}
        >
          <svg
            width="140"
            height="55"
            viewBox="0 0 140 55"
            fill="none"
            aria-label="Car 1"
          >
            <title>Car 1</title>
            <rect x="15" y="22" width="110" height="24" rx="6" fill="#16a34a" />
            <path d="M38 22 L52 8 L90 8 L105 22Z" fill="#15803d" />
            <rect
              x="56"
              y="10"
              width="30"
              height="10"
              rx="2"
              fill="#bfdbfe"
              opacity="0.9"
            />
            <ellipse cx="124" cy="34" rx="6" ry="4" fill="#fef3c7" />
            <rect x="15" y="29" width="9" height="6" rx="1" fill="#fca5a5" />
            <circle cx="42" cy="46" r="9" fill="#111827" />
            <circle cx="42" cy="46" r="5" fill="#374151" />
            <circle cx="100" cy="46" r="9" fill="#111827" />
            <circle cx="100" cy="46" r="5" fill="#374151" />
          </svg>
        </div>

        {/* Car 2 - blue, offset timing */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-60%)",
            animation: "carDrive 8s linear 3s infinite",
          }}
        >
          <svg
            width="120"
            height="50"
            viewBox="0 0 120 50"
            fill="none"
            aria-label="Car 2"
          >
            <title>Car 2</title>
            <rect x="10" y="20" width="100" height="22" rx="5" fill="#1d4ed8" />
            <path d="M32 20 L46 7 L78 7 L94 20Z" fill="#1e40af" />
            <rect
              x="50"
              y="9"
              width="25"
              height="9"
              rx="2"
              fill="#bfdbfe"
              opacity="0.9"
            />
            <ellipse cx="108" cy="31" rx="5" ry="3" fill="#fef3c7" />
            <circle cx="36" cy="42" r="8" fill="#111827" />
            <circle cx="36" cy="42" r="4" fill="#374151" />
            <circle cx="88" cy="42" r="8" fill="#111827" />
            <circle cx="88" cy="42" r="4" fill="#374151" />
          </svg>
        </div>

        {/* Car 3 - red, another offset */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-60%)",
            animation: "carDrive 7s linear 5s infinite",
          }}
        >
          <svg
            width="130"
            height="52"
            viewBox="0 0 130 52"
            fill="none"
            aria-label="Car 3"
          >
            <title>Car 3</title>
            <rect x="12" y="21" width="106" height="23" rx="6" fill="#dc2626" />
            <path d="M35 21 L49 8 L85 8 L99 21Z" fill="#b91c1c" />
            <rect
              x="53"
              y="10"
              width="28"
              height="9"
              rx="2"
              fill="#bfdbfe"
              opacity="0.9"
            />
            <ellipse cx="116" cy="33" rx="6" ry="4" fill="#fef3c7" />
            <rect x="12" y="28" width="9" height="6" rx="1" fill="#fca5a5" />
            <circle cx="38" cy="44" r="8" fill="#111827" />
            <circle cx="38" cy="44" r="4" fill="#374151" />
            <circle cx="95" cy="44" r="8" fill="#111827" />
            <circle cx="95" cy="44" r="4" fill="#374151" />
          </svg>
        </div>
      </div>

      {/* ===== NEON DIVIDER ===== */}
      <NeonDivider />

      {/* ===== DIFFERENTIATORS ===== */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2
            style={{ fontFamily: "Exo 2, sans-serif" }}
            className="text-3xl font-bold text-center mb-2 text-gray-900"
          >
            The DriveEase Difference
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Built for families, not just commuters.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {differentiators.map((p) => (
              <Card
                key={p.title}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6 text-center">
                  <div className="mb-3 flex justify-center">{p.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-500">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEON DIVIDER ===== */}
      <NeonDivider />

      {/* ===== SAMPLE DRIVER CARD ===== */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2
            style={{ fontFamily: "Exo 2, sans-serif" }}
            className="text-3xl font-bold text-center mb-2 text-gray-900"
          >
            Know Your Driver Before They Arrive
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Full transparency. Full trust.
          </p>
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            <Card className="w-full max-w-sm shadow-lg border border-green-100">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Santosh"
                    alt="Driver"
                    className="w-16 h-16 rounded-full bg-gray-100"
                  />
                  <div>
                    <div className="font-bold text-gray-900">Santosh Pawar</div>
                    <div className="text-sm text-gray-500">
                      Pune, Maharashtra
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className="fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">5.0</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {(
                    [
                      {
                        label: "Police Verification",
                        value: "Verified",
                        color: "text-primary",
                      },
                      {
                        label: "Background Check",
                        value: "Complete",
                        color: "text-primary",
                      },
                      {
                        label: "Grooming & Etiquette",
                        value: "Certified",
                        color: "text-primary",
                      },
                      {
                        label: "Medical Fitness",
                        value: "Fit",
                        color: "text-primary",
                      },
                      {
                        label: "Experience",
                        value: "15 Years",
                        color: "text-gray-700",
                      },
                      {
                        label: "Languages",
                        value: "Marathi, Hindi, English",
                        color: "text-gray-700",
                      },
                    ] as const
                  ).map((r) => (
                    <div key={r.label} className="flex justify-between">
                      <span className="text-gray-500">{r.label}</span>
                      <span className={`font-medium ${r.color}`}>
                        {r.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 mt-4">
                  {["Family Driver", "Senior Care", "Etiquette Pro"].map(
                    (b) => (
                      <Badge
                        key={b}
                        className="bg-green-100 text-green-700 text-xs"
                      >
                        {b}
                      </Badge>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
            <div className="max-w-xs text-center md:text-left">
              <p className="text-gray-600 text-lg leading-relaxed italic">
                "My parents feel safer now. The same driver comes every day."
              </p>
              <p className="text-sm text-gray-400 mt-2">
                — Verified Family User, Pune
              </p>
              <p className="text-sm text-green-700 mt-4 font-medium">
                Trusted by families across the city
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAMILY SECTION ===== */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            style={{ fontFamily: "Exo 2, sans-serif" }}
            className="text-3xl font-bold mb-3 text-gray-900"
          >
            One Family. One Account. Total Peace of Mind.
          </h2>
          <p className="text-gray-600 mb-8">
            Son in Delhi, parents in Pune — manage everything from one place.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {familyFeatures.map((f) => (
              <div
                key={f}
                className="flex items-start gap-2 bg-white rounded-lg p-3 shadow-sm"
              >
                <CheckCircle
                  size={16}
                  className="text-green-600 mt-0.5 shrink-0"
                />
                <span className="text-gray-700">{f}</span>
              </div>
            ))}
          </div>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-green-600 hover:bg-green-500 text-white"
          >
            <Link to="/subscriptions">Set Up Family Account</Link>
          </Button>
        </div>
      </section>

      {/* ===== NEON DIVIDER ===== */}
      <NeonDivider />

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2
            style={{ fontFamily: "Exo 2, sans-serif" }}
            className="text-3xl font-bold text-center mb-10 text-gray-900"
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(
              [
                {
                  step: "01",
                  title: "Choose a Plan",
                  desc: "Pick a subscription or request a trusted driver for your trip.",
                },
                {
                  step: "02",
                  title: "Get Your Driver",
                  desc: "We assign a trained, background-verified personal driver.",
                },
                {
                  step: "03",
                  title: "Build Trust",
                  desc: "Your driver becomes a long-term trusted partner for your family.",
                },
              ] as const
            ).map((s) => (
              <div key={s.step} className="text-center">
                <div
                  className="text-5xl font-black text-green-100 mb-2"
                  style={{ fontFamily: "Orbitron, sans-serif" }}
                >
                  {s.step}
                </div>
                <h3
                  style={{ fontFamily: "Exo 2, sans-serif" }}
                  className="text-lg font-bold text-gray-900 mb-2"
                >
                  {s.title}
                </h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BRAND AMBASSADOR ===== */}
      <section className="py-16 px-4" style={{ background: "#1f2937" }}>
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="bg-green-600/20 text-green-400 border border-green-600/40 mb-4 text-xs tracking-widest uppercase px-3 py-1">
            Brand Ambassador
          </Badge>
          <h2
            style={{ fontFamily: "Exo 2, sans-serif" }}
            className="text-3xl font-bold text-white mb-8"
          >
            Our Brand Ambassador
          </h2>
          <Card className="bg-gray-800 border-gray-700 shadow-2xl max-w-sm mx-auto">
            <CardContent className="pt-8 pb-6 text-center">
              <img
                src="/assets/uploads/image-1.png"
                alt="Himanshu Thakur"
                className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-600 border-4 border-green-600/40 object-cover"
              />
              <Badge className="bg-green-600 text-white text-xs mb-3 px-3 py-1">
                Official Brand Ambassador
              </Badge>
              <h3 className="text-xl font-bold text-white mb-1">
                Himanshu Thakur
              </h3>
              <p className="text-green-400 text-sm mb-4">
                Brand Ambassador - DriveEase
              </p>
              <blockquote className="text-gray-300 text-sm italic leading-relaxed border-l-2 border-green-600 pl-4 text-left">
                "DriveEase is transforming how India connects with trusted
                professional drivers."
              </blockquote>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===== CUSTOMER SUPPORT ===== */}
      <section className="py-12 px-4 bg-green-50">
        <div className="max-w-2xl mx-auto text-center">
          <Badge className="bg-green-600 text-white mb-4 text-xs px-3 py-1">
            24/7 Support
          </Badge>
          <h2
            style={{ fontFamily: "Exo 2, sans-serif" }}
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            Need Help? Contact Us Directly
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Our support team is available around the clock for any query
          </p>
          <Card className="shadow-md border border-green-200 max-w-sm mx-auto">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-7 h-7 text-primary"
                    aria-label="IT Support"
                  >
                    <title>IT Support</title>
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                    <path d="M9 8l2 2-2 2M13 10h2" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Krishna Pandey</p>
                  <p className="text-xs text-green-600 font-medium">
                    Customer Support Lead
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Available 24/7 for any query
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <a
                  href="tel:+917836887228"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                  data-ocid="support.primary_button"
                >
                  <Phone size={15} />
                  Call Now
                </a>
                <a
                  href="https://wa.me/917836887228"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b558] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                  data-ocid="support.secondary_button"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                    aria-label="WhatsApp"
                  >
                    <title>WhatsApp</title>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
              <p className="text-xs text-center text-gray-400 mt-3">
                +91-7836887228
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===== HOW WE CREATE VALUE ===== */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="bg-green-100 text-green-700 mb-3 text-xs px-3 py-1">
              Business Model
            </Badge>
            <h2
              style={{ fontFamily: "Exo 2, sans-serif" }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              How We Create Value
            </h2>
            <p className="text-gray-500">
              A sustainable platform built for drivers and customers alike
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: "💸",
                title: "Commission per Trip",
                desc: "We take a 15–20% cut from every booking. Scales with your usage.",
                highlight: "15–20%",
                label: "per booking",
              },
              {
                icon: "📅",
                title: "Subscription Plans",
                desc: "Monthly plans like ₹999/month for Priority Booking & Zero Surge.",
                highlight: "₹999/mo",
                label: "starting from",
              },
              {
                icon: "🏢",
                title: "Corporate Contracts",
                desc: "Partner with companies for executive daily commutes. High-volume, stable revenue.",
                highlight: "B2B",
                label: "partnerships",
              },
              {
                icon: "🪪",
                title: "Driver Onboarding Fee",
                desc: "One-time ₹150 background verification & training fee for serious drivers.",
                highlight: "₹150",
                label: "one-time",
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="border border-green-100 hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6 pb-5">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span
                      className="text-2xl font-black text-primary"
                      style={{ fontFamily: "Orbitron, sans-serif" }}
                    >
                      {item.highlight}
                    </span>
                    <span className="text-xs text-gray-400">{item.label}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1.5 text-sm">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEON DIVIDER ===== */}
      <NeonDivider />

      {/* ===== WHY TRUST DRIVEEASE ===== */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="bg-green-600/20 text-green-400 border border-green-600/40 mb-3 text-xs px-3 py-1">
              Safety First
            </Badge>
            <h2
              style={{ fontFamily: "Exo 2, sans-serif" }}
              className="text-3xl font-bold text-white mb-2"
            >
              Why Trust DriveEase?
            </h2>
            <p className="text-gray-400">
              Built with your safety and peace of mind at the core
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                icon: "🛡️",
                title: "Background Verification",
                desc: "Every driver undergoes thorough police verification, Aadhaar check, and criminal background screening. A green 'Verified' badge means you can trust your driver completely.",
                badge: "# 1 Safety Priority",
              },
              {
                icon: "⭐",
                title: "Rating System",
                desc: "Two-way ratings keep quality high. Rate your driver after every trip, and drivers rate passengers too — maintaining a respectful community for everyone.",
                badge: "Quality Control",
              },
              {
                icon: "🆘",
                title: "SOS Safety Button",
                desc: "One tap connects you to 112 (Emergency), 108 (Ambulance), and 100 (Police). Critical for solo travelers, female passengers, and late-night trips.",
                badge: "2026 Safety Standard",
              },
              {
                icon: "🗺️",
                title: "Multiple Booking Types",
                desc: "Book by the Hour for short errands, Daily for office use, or Outstation for long trips. Flexible plans that fit your lifestyle — not the other way around.",
                badge: "Flexible",
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="bg-gray-800 border-gray-700 hover:border-green-600/40 transition-all"
              >
                <CardContent className="pt-6 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">{item.icon}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3
                          style={{ fontFamily: "Exo 2, sans-serif" }}
                          className="font-bold text-white text-base"
                        >
                          {item.title}
                        </h3>
                        <Badge className="bg-green-600/20 text-green-400 border border-green-600/30 text-xs px-2 py-0">
                          {item.badge}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PAYMENT SECTION ===== */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2
              style={{ fontFamily: "Exo 2, sans-serif" }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Easy Payment Options
            </h2>
            <p className="text-gray-500">
              Pay securely via bank transfer or PhonePe scan
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank Transfer Card */}
            <Card className="shadow-md border border-blue-100">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <div>
                    <p className="font-bold text-blue-800">Axis Bank</p>
                    <p className="text-xs text-gray-500">Bank Transfer</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Account Holder</span>
                    <span className="font-semibold text-gray-800">
                      KRISHNA KANT PANDEY
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Account No.</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">
                        922010062230782
                      </span>
                      <button
                        type="button"
                        onClick={() => copyText("922010062230782", "home_acc")}
                        className="text-green-600 hover:text-green-700 p-1 rounded"
                        title="Copy account number"
                        data-ocid="payment.secondary_button"
                      >
                        <Copy size={14} />
                      </button>
                      {copied === "home_acc" && (
                        <span className="text-xs text-primary">Copied!</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">IFSC Code</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">
                        UTIB0004620
                      </span>
                      <button
                        type="button"
                        onClick={() => copyText("UTIB0004620", "home_ifsc")}
                        className="text-green-600 hover:text-green-700 p-1 rounded"
                        title="Copy IFSC"
                        data-ocid="payment.secondary_button"
                      >
                        <Copy size={14} />
                      </button>
                      {copied === "home_ifsc" && (
                        <span className="text-xs text-primary">Copied!</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">Bank</span>
                    <span className="font-semibold">Axis Bank</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PhonePe QR Card */}
            <Card className="shadow-md border border-purple-100">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-purple-800">PhonePe / UPI</p>
                    <p className="text-xs text-gray-500">
                      Scan &amp; Pay instantly
                    </p>
                  </div>
                </div>
                <img
                  src="/assets/uploads/WhatsApp-Image-2026-03-09-at-5.36.30-PM-1.jpeg"
                  alt="PhonePe QR Code"
                  className="mx-auto rounded-xl border border-gray-200 shadow-sm mb-3"
                  style={{ maxWidth: "220px" }}
                />
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Scan &amp; Pay via PhonePe
                </p>
                <p className="text-xs text-gray-500">
                  After payment, send screenshot to WhatsApp for confirmation
                </p>
                <a
                  href="https://wa.me/917836887228"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm text-green-700 font-semibold underline"
                >
                  WhatsApp Confirmation →
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== EMERGENCY BANNER ===== */}
      <section className="bg-red-600 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Phone size={24} />
            <div>
              <div className="font-bold">Emergency? We've Got You.</div>
              <div className="text-sm text-red-100">
                Our rides include emergency SOS and insurance support
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href="tel:108"
              className="bg-white text-red-600 font-bold px-4 py-2 rounded hover:bg-red-50 transition"
            >
              Call 108 Ambulance
            </a>
            <Link
              to="/insurance"
              className="border border-white text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Insurance Details
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
