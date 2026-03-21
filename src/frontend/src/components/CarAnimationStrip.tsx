export default function CarAnimationStrip() {
  return (
    <div
      style={{
        width: "100%",
        height: "76px",
        background: "#0a0f0a",
        position: "relative",
        overflow: "hidden",
        borderTop: "2px solid #1a2e1a",
        borderBottom: "2px solid #1a2e1a",
        flexShrink: 0,
      }}
    >
      <style>{`
        @keyframes carStrip1 {
          0% { transform: translateX(-200px); }
          100% { transform: translateX(calc(100vw + 200px)); }
        }
        @keyframes carStrip2 {
          0% { transform: translateX(-260px); }
          100% { transform: translateX(calc(100vw + 260px)); }
        }
        @keyframes carStrip3 {
          0% { transform: translateX(-220px); }
          100% { transform: translateX(calc(100vw + 220px)); }
        }
        @keyframes roadDash {
          0% { background-position: 0 0; }
          100% { background-position: 80px 0; }
        }
      `}</style>

      {/* Road dashes center line */}
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

      {/* Car 1 - green, fastest */}
      <div
        style={{
          position: "absolute",
          top: "8px",
          animation: "carStrip1 3.8s linear infinite",
        }}
      >
        <svg
          width="90"
          height="36"
          viewBox="0 0 90 36"
          fill="none"
          aria-label="car 1"
        >
          <title>Car 1</title>
          <rect x="8" y="14" width="74" height="16" rx="4" fill="#16a34a" />
          <path d="M24 14 L34 4 L60 4 L70 14Z" fill="#15803d" />
          <rect
            x="36"
            y="5"
            width="20"
            height="7"
            rx="1"
            fill="#86efac"
            opacity="0.8"
          />
          <circle cx="22" cy="30" r="5" fill="#111" />
          <circle cx="22" cy="30" r="2.5" fill="#555" />
          <circle cx="68" cy="30" r="5" fill="#111" />
          <circle cx="68" cy="30" r="2.5" fill="#555" />
          <rect
            x="72"
            y="18"
            width="8"
            height="4"
            rx="1"
            fill="#fbbf24"
            opacity="0.9"
          />
          <rect
            x="0"
            y="18"
            width="8"
            height="4"
            rx="1"
            fill="#ef4444"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Car 2 - blue, medium speed */}
      <div
        style={{
          position: "absolute",
          top: "8px",
          animation: "carStrip2 5.2s linear infinite",
          animationDelay: "0.9s",
        }}
      >
        <svg
          width="90"
          height="36"
          viewBox="0 0 90 36"
          fill="none"
          aria-label="car 2"
        >
          <title>Car 2</title>
          <rect x="8" y="14" width="74" height="16" rx="4" fill="#2563eb" />
          <path d="M24 14 L34 4 L60 4 L70 14Z" fill="#1d4ed8" />
          <rect
            x="36"
            y="5"
            width="20"
            height="7"
            rx="1"
            fill="#93c5fd"
            opacity="0.8"
          />
          <circle cx="22" cy="30" r="5" fill="#111" />
          <circle cx="22" cy="30" r="2.5" fill="#555" />
          <circle cx="68" cy="30" r="5" fill="#111" />
          <circle cx="68" cy="30" r="2.5" fill="#555" />
          <rect
            x="72"
            y="18"
            width="8"
            height="4"
            rx="1"
            fill="#fbbf24"
            opacity="0.9"
          />
          <rect
            x="0"
            y="18"
            width="8"
            height="4"
            rx="1"
            fill="#ef4444"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Car 3 - red, slower */}
      <div
        style={{
          position: "absolute",
          top: "8px",
          animation: "carStrip3 6.6s linear infinite",
          animationDelay: "2.1s",
        }}
      >
        <svg
          width="90"
          height="36"
          viewBox="0 0 90 36"
          fill="none"
          aria-label="car 3"
        >
          <title>Car 3</title>
          <rect x="8" y="14" width="74" height="16" rx="4" fill="#dc2626" />
          <path d="M24 14 L34 4 L60 4 L70 14Z" fill="#b91c1c" />
          <rect
            x="36"
            y="5"
            width="20"
            height="7"
            rx="1"
            fill="#fca5a5"
            opacity="0.8"
          />
          <circle cx="22" cy="30" r="5" fill="#111" />
          <circle cx="22" cy="30" r="2.5" fill="#555" />
          <circle cx="68" cy="30" r="5" fill="#111" />
          <circle cx="68" cy="30" r="2.5" fill="#555" />
          <rect
            x="72"
            y="18"
            width="8"
            height="4"
            rx="1"
            fill="#fbbf24"
            opacity="0.9"
          />
          <rect
            x="0"
            y="18"
            width="8"
            height="4"
            rx="1"
            fill="#fbbf24"
            opacity="0.6"
          />
        </svg>
      </div>
    </div>
  );
}
