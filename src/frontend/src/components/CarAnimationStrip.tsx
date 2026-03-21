export default function CarAnimationStrip() {
  return (
    <div
      style={{
        width: "100%",
        height: "80px",
        background: "#0d0d0d",
        position: "relative",
        overflow: "hidden",
        borderTop: "2px solid #1a3a1a",
        borderBottom: "2px solid #1a3a1a",
        flexShrink: 0,
      }}
    >
      <style>{`
        @keyframes carStrip1 {
          0% { transform: translateX(-200px); }
          100% { transform: translateX(calc(100vw + 200px)); }
        }
        @keyframes carStrip2 {
          0% { transform: translateX(-240px); }
          100% { transform: translateX(calc(100vw + 240px)); }
        }
        @keyframes carStrip3 {
          0% { transform: translateX(-180px); }
          100% { transform: translateX(calc(100vw + 180px)); }
        }
        @keyframes carStrip4 {
          0% { transform: translateX(-220px); }
          100% { transform: translateX(calc(100vw + 220px)); }
        }
        @keyframes carStrip5 {
          0% { transform: translateX(-260px); }
          100% { transform: translateX(calc(100vw + 260px)); }
        }
        @keyframes roadDash {
          0% { background-position: 0 0; }
          100% { background-position: 80px 0; }
        }
      `}</style>

      {/* Road texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #111 0%, #1a1a1a 50%, #111 100%)",
        }}
      />

      {/* Road center dashes */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          left: 0,
          right: 0,
          height: "3px",
          backgroundImage:
            "repeating-linear-gradient(90deg, #fbbf24 0px, #fbbf24 40px, transparent 40px, transparent 80px)",
          animation: "roadDash 0.4s linear infinite",
        }}
      />

      {/* Car 1 - green, fastest 3.2s */}
      <div
        style={{
          position: "absolute",
          top: "8px",
          animation: "carStrip1 3.2s linear infinite",
        }}
      >
        <svg
          width="80"
          height="32"
          viewBox="0 0 80 32"
          fill="none"
          aria-label="Car 1"
        >
          <title>Car 1</title>
          <rect x="10" y="14" width="60" height="14" rx="4" fill="#16a34a" />
          <path d="M22 14 L30 5 L52 5 L60 14Z" fill="#15803d" />
          <rect
            x="32"
            y="6"
            width="18"
            height="7"
            rx="1"
            fill="#bfdbfe"
            opacity="0.9"
          />
          <circle cx="25" cy="28" r="5" fill="#222" />
          <circle cx="25" cy="28" r="2.5" fill="#555" />
          <circle cx="57" cy="28" r="5" fill="#222" />
          <circle cx="57" cy="28" r="2.5" fill="#555" />
          <ellipse cx="70" cy="21" rx="4" ry="2.5" fill="#fef3c7" />
        </svg>
      </div>

      {/* Car 2 - sports red, 4s */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          animation: "carStrip2 4.0s linear 1s infinite",
        }}
      >
        <svg
          width="90"
          height="28"
          viewBox="0 0 90 28"
          fill="none"
          aria-label="Car 2"
        >
          <title>Car 2</title>
          <rect x="5" y="12" width="80" height="12" rx="3" fill="#dc2626" />
          <path d="M20 12 L30 3 L65 3 L75 12Z" fill="#b91c1c" />
          <rect
            x="33"
            y="4"
            width="28"
            height="7"
            rx="1"
            fill="#93c5fd"
            opacity="0.85"
          />
          <circle cx="22" cy="24" r="4.5" fill="#222" />
          <circle cx="22" cy="24" r="2" fill="#555" />
          <circle cx="68" cy="24" r="4.5" fill="#222" />
          <circle cx="68" cy="24" r="2" fill="#555" />
          <ellipse cx="83" cy="18" rx="4" ry="2" fill="#fef3c7" />
        </svg>
      </div>

      {/* Car 3 - blue taxi, 5s */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          animation: "carStrip3 5.0s linear 2s infinite",
        }}
      >
        <svg
          width="85"
          height="30"
          viewBox="0 0 85 30"
          fill="none"
          aria-label="Car 3"
        >
          <title>Car 3</title>
          <rect x="8" y="14" width="70" height="13" rx="4" fill="#fbbf24" />
          <path d="M22 14 L32 4 L55 4 L65 14Z" fill="#f59e0b" />
          <rect
            x="34"
            y="5"
            width="20"
            height="8"
            rx="1"
            fill="#bfdbfe"
            opacity="0.9"
          />
          <rect x="8" y="18" width="7" height="4" rx="1" fill="#fca5a5" />
          <circle cx="24" cy="27" r="5" fill="#222" />
          <circle cx="24" cy="27" r="2.5" fill="#555" />
          <circle cx="63" cy="27" r="5" fill="#222" />
          <circle cx="63" cy="27" r="2.5" fill="#555" />
          <ellipse cx="76" cy="21" rx="4" ry="2.5" fill="#fef3c7" />
          <rect
            x="30"
            y="6"
            width="12"
            height="3"
            rx="1"
            fill="#000"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Car 4 - police white, 6s */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          animation: "carStrip4 6.0s linear 0.5s infinite",
        }}
      >
        <svg
          width="75"
          height="26"
          viewBox="0 0 75 26"
          fill="none"
          aria-label="Car 4"
        >
          <title>Car 4</title>
          <rect x="5" y="10" width="65" height="12" rx="3" fill="#e5e7eb" />
          <path d="M18 10 L26 3 L50 3 L58 10Z" fill="#d1d5db" />
          <rect
            x="28"
            y="4"
            width="16"
            height="5"
            rx="1"
            fill="#bfdbfe"
            opacity="0.9"
          />
          <rect x="5" y="14" width="6" height="4" rx="1" fill="#ef4444" />
          <circle cx="20" cy="22" r="4" fill="#222" />
          <circle cx="20" cy="22" r="2" fill="#555" />
          <circle cx="56" cy="22" r="4" fill="#222" />
          <circle cx="56" cy="22" r="2" fill="#555" />
          <ellipse cx="68" cy="16" rx="3.5" ry="2" fill="#fef3c7" />
        </svg>
      </div>

      {/* Car 5 - purple premium, 3.8s */}
      <div
        style={{
          position: "absolute",
          top: "6px",
          animation: "carStrip5 3.8s linear 3s infinite",
        }}
      >
        <svg
          width="95"
          height="35"
          viewBox="0 0 95 35"
          fill="none"
          aria-label="Car 5"
        >
          <title>Car 5</title>
          <rect x="8" y="16" width="79" height="15" rx="5" fill="#7c3aed" />
          <path d="M24 16 L36 5 L62 5 L74 16Z" fill="#6d28d9" />
          <rect
            x="38"
            y="6"
            width="22"
            height="8"
            rx="2"
            fill="#c4b5fd"
            opacity="0.9"
          />
          <circle cx="28" cy="31" r="6" fill="#111" />
          <circle cx="28" cy="31" r="3" fill="#444" />
          <circle cx="70" cy="31" r="6" fill="#111" />
          <circle cx="70" cy="31" r="3" fill="#444" />
          <ellipse cx="85" cy="24" rx="5" ry="3" fill="#fef3c7" />
        </svg>
      </div>
    </div>
  );
}
