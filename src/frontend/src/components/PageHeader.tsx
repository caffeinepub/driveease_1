export default function PageHeader({ subtitle }: { subtitle?: string }) {
  return (
    <div
      style={{
        width: "100%",
        background: "linear-gradient(135deg, #020b02 0%, #0a1f0a 100%)",
        padding: "18px 24px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <style>{`
        @keyframes pageLogoFloat {
          0%, 100% { transform: translateY(0px) drop-shadow(0 0 18px #22c55e); }
          50% { transform: translateY(-8px) drop-shadow(0 0 30px #4ade80); }
        }
        .page-logo-anim {
          animation: pageLogoFloat 3.5s ease-in-out infinite;
          filter: drop-shadow(0 0 18px #22c55e);
        }
      `}</style>
      <img
        src="/assets/generated/driveease-logo-3d-transparent.dim_400x200.png"
        alt="DriveEase Logo"
        className="page-logo-anim"
        style={{ height: "52px", width: "auto", objectFit: "contain" }}
      />
      {subtitle && (
        <p
          style={{
            fontFamily: "Exo 2, sans-serif",
            color: "#4ade80",
            fontSize: "0.8rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            margin: "4px 0 0",
          }}
        >
          {subtitle}
        </p>
      )}
      {/* Neon gradient bar */}
      <div
        style={{
          marginTop: "14px",
          width: "100%",
          height: "3px",
          background:
            "linear-gradient(90deg, transparent 0%, #16a34a 30%, #4ade80 50%, #16a34a 70%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "neonDividerShimmer 3s linear infinite",
        }}
      />
    </div>
  );
}
