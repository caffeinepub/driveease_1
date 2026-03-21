interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "32px",
  md: "48px",
  lg: "64px",
};

export default function AnimatedLogo({
  size = "md",
  className = "",
}: AnimatedLogoProps) {
  const h = sizeMap[size];
  return (
    <>
      <style>{`
        @keyframes logoShimmer {
          0%   { left: -100%; }
          100% { left: 200%; }
        }
        @keyframes logoGlow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(52,211,153,0.5)) drop-shadow(0 0 10px rgba(16,185,129,0.3)); }
          50%       { filter: drop-shadow(0 0 8px rgba(52,211,153,0.9)) drop-shadow(0 0 20px rgba(16,185,129,0.6)); }
        }
        .animated-logo-img {
          animation: logoGlow 2.5s ease-in-out infinite;
        }
        .animated-logo-shimmer {
          animation: logoShimmer 2.5s linear infinite;
        }
      `}</style>
      <div
        className={`relative inline-block overflow-hidden ${className}`}
        style={{ height: h }}
      >
        <img
          src="/assets/generated/driveease-logo-hd.dim_600x200.png"
          alt="DriveEase"
          className="animated-logo-img"
          style={{
            height: h,
            width: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
        {/* Shimmer sweep */}
        <div
          className="animated-logo-shimmer"
          style={{
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "40%",
            height: "100%",
            background:
              "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      </div>
    </>
  );
}
