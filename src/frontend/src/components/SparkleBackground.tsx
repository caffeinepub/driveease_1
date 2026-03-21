import { useMemo } from "react";

interface SparkleBackgroundProps {
  density?: number;
}

export default function SparkleBackground({
  density = 40,
}: SparkleBackgroundProps) {
  const sparkles = useMemo(() => {
    const colors = [
      "#34d399",
      "#86efac",
      "#ffffff",
      "#67e8f9",
      "#a7f3d0",
      "#6ee7b7",
      "#d1fae5",
    ];
    return Array.from({ length: density }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 3 + Math.random() * 5,
      delay: Math.random() * 4,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, [density]);

  return (
    <>
      <style>{`
        @keyframes sparkleUp {
          0%   { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
          15%  { opacity: var(--sp-opacity); }
          85%  { opacity: var(--sp-opacity); }
          100% { transform: translateY(-80px) scale(0.6) rotate(180deg); opacity: 0; }
        }
        @keyframes sparkleTwink {
          0%, 100% { transform: scale(0.4) rotate(0deg); opacity: 0.2; }
          50%       { transform: scale(1) rotate(45deg); opacity: var(--sp-opacity); }
        }
      `}</style>
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {sparkles.map((s) => (
          <div
            key={s.id}
            style={{
              position: "absolute",
              left: s.left,
              top: s.top,
              width: `${s.size}px`,
              height: `${s.size}px`,
              background: s.color,
              borderRadius: "50%",
              boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
              // @ts-expect-error CSS custom property
              "--sp-opacity": s.opacity,
              animation:
                s.id % 3 === 0
                  ? `sparkleTwink ${s.duration}s ease-in-out ${s.delay}s infinite`
                  : `sparkleUp ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}
