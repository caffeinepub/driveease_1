import {
  CheckCircle,
  Clock,
  Copy,
  Languages,
  MapPin,
  RefreshCw,
  Search,
  Star,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { getApiKey } from "../config/apiConfig";
import { Link } from "../router";
import { apiGetOnlineDrivers, apiGetRegistrations } from "../utils/backendApi";
import { INDIA_STATES } from "../utils/indiaData";

interface LiveDriver {
  id: string | number;
  name: string;
  phone: string;
  city: string;
  state: string;
  rating: number;
  experienceYears: number;
  pricePerDay: number;
  languages: string[];
  isVerified: boolean;
  isOnline: boolean;
  vehicleType?: string;
  licenseNumber?: string;
  experience?: string;
  workAreas?: string;
}

function parseExp(exp: string): number {
  if (exp?.includes("10+")) return 10;
  if (exp?.includes("5-10")) return 7;
  if (exp?.includes("3-5")) return 4;
  if (exp?.includes("1-2")) return 2;
  return 1;
}

async function fetchAllDrivers(): Promise<LiveDriver[]> {
  const [backendOnline, backendRegs] = await Promise.all([
    apiGetOnlineDrivers().catch(() => []),
    apiGetRegistrations().catch(() => []),
  ]);

  const onlinePhones = new Set<string>();
  for (const s of backendOnline) {
    if (s.status === "online") onlinePhones.add(s.phone);
  }

  return backendRegs
    .filter((r: any) => r.status === "approved")
    .map((r: any) => ({
      id: `reg-${r.id}`,
      name: r.name,
      phone: r.phone,
      city: r.city || "",
      state: r.state || "",
      rating: 4.5,
      experienceYears: parseExp(r.experience || ""),
      pricePerDay: 1200,
      languages: r.languages
        ? r.languages.split(",").map((l: string) => l.trim())
        : ["Hindi"],
      isVerified: true,
      isOnline: onlinePhones.has(r.phone),
      vehicleType: r.vehicleType || "",
      licenseNumber: r.licenseNumber || "",
      experience: r.experience || "",
      workAreas: r.workAreas || "",
    }))
    .sort((a, b) => Number(b.isOnline) - Number(a.isOnline));
}

function getCustomerCity(): string {
  try {
    const s = localStorage.getItem("otp_customer");
    if (!s) return "";
    const c = JSON.parse(s);
    return c?.city || "";
  } catch {
    return "";
  }
}

function ShareLinkButton() {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#/live-drivers`;
    navigator.clipboard.writeText(url).catch(() => {
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      type="button"
      onClick={copyLink}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono font-semibold border transition-all ${
        copied
          ? "bg-[#00ff88]/20 border-[#00ff88]/50 text-[#00ff88]"
          : "bg-black/40 border-[#00ff88]/20 text-[#00ff88] hover:border-[#00ff88]/60 hover:shadow-[0_0_12px_rgba(0,255,136,0.2)]"
      }`}
      data-ocid="live_drivers.share_button"
    >
      <Copy size={14} />
      {copied ? "LINK COPIED" : "SHARE LINK"}
    </button>
  );
}

export default function LiveDriversPage() {
  const [drivers, setDrivers] = useState<LiveDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online">("all");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [selected, setSelected] = useState<LiveDriver | null>(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [secsAgo, setSecsAgo] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const live = await fetchAllDrivers();
      setDrivers(live);
      setLastUpdated(Date.now());
      setSecsAgo(0);
    } catch {
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const customerCity = getCustomerCity();
    if (customerCity) setCityFilter(customerCity);
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  useEffect(() => {
    const autoRefresh = setInterval(() => refresh(), 30000);
    return () => clearInterval(autoRefresh);
  }, [refresh]);

  useEffect(() => {
    timerRef.current = setInterval(
      () => setSecsAgo(Math.floor((Date.now() - lastUpdated) / 1000)),
      1000,
    );
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lastUpdated]);

  const customerCity = getCustomerCity();

  const filtered = drivers.filter((d) => {
    const matchCity =
      !cityFilter || d.city.toLowerCase().includes(cityFilter.toLowerCase());
    const matchState =
      !stateFilter ||
      (d.state || "").toLowerCase().includes(stateFilter.toLowerCase());
    const matchStatus = statusFilter === "all" || d.isOnline;
    return matchCity && matchState && matchStatus;
  });

  const detectCity = () => {
    if (!navigator.geolocation) return;
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&key=${getApiKey()}`,
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "";
          if (city) setCityFilter(city);
        } catch {
          /* ignore */
        } finally {
          setDetectingLocation(false);
        }
      },
      () => setDetectingLocation(false),
    );
  };

  const onlineCount = drivers.filter((d) => d.isOnline).length;

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: "#000a05",
        backgroundImage:
          "linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      {/* Ambient glow orbs */}
      <div
        className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #00ff88 0%, transparent 70%)",
          filter: "blur(60px)",
          transform: "translate(-50%, -30%)",
        }}
      />
      <div
        className="pointer-events-none absolute top-40 right-0 w-64 h-64 rounded-full opacity-8"
        style={{
          background: "radial-gradient(circle, #00d4ff 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Hero Header */}
      <div className="relative overflow-hidden">
        {/* Scanline animation */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(0,255,136,0.015) 50%, transparent 100%)",
            backgroundSize: "100% 4px",
            animation: "scanline 8s linear infinite",
          }}
        />
        <style>{`
          @keyframes scanline {
            0% { background-position: 0 -100vh; }
            100% { background-position: 0 100vh; }
          }
          @keyframes neon-pulse {
            0%, 100% { opacity: 1; text-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 40px #00ff88; }
            50% { opacity: 0.85; text-shadow: 0 0 5px #00ff88, 0 0 10px #00ff88; }
          }
          @keyframes blink-dot {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.2; }
          }
        `}</style>

        <div
          className="py-16 px-4 text-center"
          style={{
            background: "linear-gradient(180deg, #001208 0%, #000a05 100%)",
            borderBottom: "1px solid rgba(0,255,136,0.1)",
          }}
        >
          {/* LIVE badge */}
          <div className="inline-flex items-center gap-2 mb-6">
            <span
              className="text-xs font-mono font-black px-3 py-1 rounded border"
              style={{
                background: "rgba(0,255,136,0.1)",
                border: "1px solid #00ff88",
                color: "#00ff88",
                animation: "neon-pulse 2s ease-in-out infinite",
              }}
            >
              ● LIVE FEED
            </span>
          </div>

          <h1
            className="text-5xl md:text-6xl font-black font-mono mb-3 tracking-tight"
            style={{
              color: "#ffffff",
              textShadow: "0 0 30px rgba(0,255,136,0.3)",
              letterSpacing: "-0.02em",
            }}
          >
            LIVE DRIVER
            <span
              style={{
                display: "block",
                color: "#00ff88",
                textShadow: "0 0 20px #00ff88, 0 0 40px #00ff88",
              }}
            >
              NETWORK
            </span>
          </h1>

          <p className="text-sm font-mono mb-6" style={{ color: "#4ade80" }}>
            ALL VERIFIED DRIVEEASE DRIVERS ACROSS INDIA
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div
              className="font-mono text-sm px-4 py-2 rounded border"
              style={{
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(0,255,136,0.2)",
                color: "#86efac",
              }}
            >
              <span className="text-white font-bold text-lg">
                {drivers.length}
              </span>{" "}
              TOTAL
            </div>
            <div
              className="font-mono text-sm px-4 py-2 rounded border flex items-center gap-2"
              style={{
                background: "rgba(0,255,136,0.05)",
                border: "1px solid rgba(0,255,136,0.4)",
                color: "#00ff88",
              }}
            >
              <span
                className="w-2 h-2 rounded-full bg-[#00ff88]"
                style={{ animation: "blink-dot 1s ease-in-out infinite" }}
              />
              <span className="font-bold text-lg">{onlineCount}</span> ONLINE
            </div>
            <div
              className="font-mono text-xs px-4 py-2 rounded border"
              style={{
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(0,255,136,0.15)",
                color: "#4ade80",
              }}
            >
              SYNC: {secsAgo}s AGO
            </div>
          </div>

          {customerCity && (
            <p className="mt-4 font-mono text-sm" style={{ color: "#00d4ff" }}>
              ◈ LOCATION LOCKED: <strong>{customerCity.toUpperCase()}</strong>
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter tabs */}
        <div className="flex gap-3 mb-5 flex-wrap items-center">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className="px-4 py-2 rounded text-sm font-mono font-semibold transition-all"
            style={{
              background:
                statusFilter === "all" ? "#00ff88" : "rgba(0,255,136,0.05)",
              border:
                statusFilter === "all"
                  ? "1px solid #00ff88"
                  : "1px solid rgba(0,255,136,0.2)",
              color: statusFilter === "all" ? "#000" : "#00ff88",
              boxShadow:
                statusFilter === "all"
                  ? "0 0 20px rgba(0,255,136,0.4)"
                  : "none",
            }}
            data-ocid="live_drivers.tab"
          >
            ALL ({drivers.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("online")}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-mono font-semibold transition-all"
            style={{
              background:
                statusFilter === "online" ? "#00ff88" : "rgba(0,255,136,0.05)",
              border:
                statusFilter === "online"
                  ? "1px solid #00ff88"
                  : "1px solid rgba(0,255,136,0.2)",
              color: statusFilter === "online" ? "#000" : "#00ff88",
              boxShadow:
                statusFilter === "online"
                  ? "0 0 20px rgba(0,255,136,0.4)"
                  : "none",
            }}
            data-ocid="live_drivers.tab"
          >
            <span
              className="w-2 h-2 rounded-full bg-[#00ff88]"
              style={{ animation: "blink-dot 1s ease-in-out infinite" }}
            />
            ONLINE ({onlineCount})
          </button>
          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={refresh}
              disabled={loading}
              size="sm"
              className="font-mono text-xs"
              style={{
                background: "rgba(0,255,136,0.1)",
                border: "1px solid rgba(0,255,136,0.3)",
                color: "#00ff88",
              }}
              data-ocid="live_drivers.primary_button"
            >
              <RefreshCw
                size={14}
                className={`mr-1 ${loading ? "animate-spin" : ""}`}
              />
              REFRESH
            </Button>
            <ShareLinkButton />
          </div>
        </div>

        {/* Filters */}
        <div
          className="rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center"
          style={{
            background: "rgba(0,255,136,0.03)",
            border: "1px solid rgba(0,255,136,0.1)",
          }}
        >
          <select
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setCityFilter("");
            }}
            className="flex-1 min-w-[160px] px-3 py-2 rounded text-sm font-mono focus:outline-none"
            style={{
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(0,255,136,0.2)",
              color: "#86efac",
            }}
            data-ocid="live_drivers.select"
          >
            <option value="">ALL STATES</option>
            {INDIA_STATES.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[160px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#00ff88" }}
            />
            <Input
              placeholder="Search city..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="pl-8 font-mono text-sm"
              style={{
                background: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(0,255,136,0.2)",
                color: "#86efac",
              }}
              data-ocid="live_drivers.search_input"
            />
          </div>

          <button
            type="button"
            onClick={detectCity}
            disabled={detectingLocation}
            className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-mono transition-all"
            style={{
              background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.3)",
              color: "#00d4ff",
            }}
            data-ocid="live_drivers.toggle"
          >
            {detectingLocation ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              "◈"
            )}
            LOCATE
          </button>

          {cityFilter && (
            <button
              type="button"
              onClick={() => setCityFilter("")}
              className="text-xs font-mono underline"
              style={{ color: "#4ade80" }}
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div
            className="text-center py-24"
            data-ocid="live_drivers.loading_state"
          >
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{
                border: "2px solid #00ff88",
                boxShadow: "0 0 20px rgba(0,255,136,0.3)",
              }}
            >
              <RefreshCw
                size={28}
                style={{ color: "#00ff88" }}
                className="animate-spin"
              />
            </div>
            <p className="font-mono text-sm" style={{ color: "#00ff88" }}>
              SCANNING NETWORK...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-24"
            data-ocid="live_drivers.empty_state"
          >
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{
                background: "rgba(0,255,136,0.05)",
                border: "1px solid rgba(0,255,136,0.2)",
              }}
            >
              <MapPin size={32} style={{ color: "#00ff88" }} />
            </div>
            <h3 className="text-xl font-mono font-bold text-white mb-2">
              {statusFilter === "online"
                ? "NO DRIVERS ONLINE"
                : "NO DRIVERS FOUND"}
            </h3>
            <p className="font-mono text-sm" style={{ color: "#4ade80" }}>
              {cityFilter
                ? `No drivers in ${cityFilter.toUpperCase()}. Try clearing filter.`
                : statusFilter === "online"
                  ? "Switch to ALL to see everyone registered."
                  : "Drivers appear once registered and approved."}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((d, i) => {
                const isSameCity =
                  customerCity &&
                  d.city.toLowerCase() === customerCity.toLowerCase();
                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    data-ocid={`live_drivers.item.${i + 1}`}
                  >
                    <div
                      className="rounded-xl overflow-hidden transition-all duration-300 group cursor-pointer"
                      style={{
                        background: "rgba(5,14,7,0.8)",
                        border: "1px solid rgba(0,255,136,0.15)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.border =
                          "1px solid rgba(0,255,136,0.6)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow =
                          "0 0 20px rgba(0,255,136,0.12)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.border =
                          "1px solid rgba(0,255,136,0.15)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow =
                          "none";
                      }}
                    >
                      {/* City match banner */}
                      {isSameCity && (
                        <div
                          className="px-4 py-1.5 flex items-center gap-2 text-xs font-mono"
                          style={{
                            background: "rgba(0,212,255,0.08)",
                            borderBottom: "1px solid rgba(0,212,255,0.2)",
                            color: "#00d4ff",
                          }}
                        >
                          <CheckCircle size={11} />
                          CITY MATCHED
                        </div>
                      )}

                      {/* Card header */}
                      <div
                        className="p-4"
                        style={{ background: "rgba(0,18,8,0.6)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className="w-14 h-14 rounded-full flex items-center justify-center font-black text-xl"
                              style={{
                                background: "rgba(0,255,136,0.1)",
                                border: "2px solid rgba(0,255,136,0.4)",
                                color: "#00ff88",
                                fontFamily: "monospace",
                              }}
                            >
                              {d.name.charAt(0)}
                            </div>
                            <span
                              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                              style={{
                                borderColor: "#000a05",
                                background: d.isOnline ? "#00ff88" : "#4b5563",
                                boxShadow: d.isOnline
                                  ? "0 0 8px rgba(0,255,136,0.8)"
                                  : "none",
                                animation: d.isOnline
                                  ? "blink-dot 1.5s ease-in-out infinite"
                                  : "none",
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className="text-white font-bold">
                                {d.name}
                              </span>
                              {d.isVerified && (
                                <span
                                  className="text-xs font-mono px-1.5 py-0.5 rounded"
                                  style={{
                                    background: "rgba(0,255,136,0.1)",
                                    border: "1px solid rgba(0,255,136,0.3)",
                                    color: "#00ff88",
                                  }}
                                >
                                  ✓ VRF
                                </span>
                              )}
                            </div>
                            {d.isOnline ? (
                              <span
                                className="inline-flex items-center gap-1 text-xs font-mono font-bold"
                                style={{ color: "#00ff88" }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"
                                  style={{
                                    animation:
                                      "blink-dot 1s ease-in-out infinite",
                                    boxShadow: "0 0 4px #00ff88",
                                  }}
                                />
                                ONLINE
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-xs font-mono"
                                style={{ color: "#6b7280" }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-600 inline-block" />
                                OFFLINE
                              </span>
                            )}
                            <div
                              className="flex items-center gap-1 text-xs mt-0.5 font-mono"
                              style={{ color: "#4ade80" }}
                            >
                              <MapPin size={10} />
                              {d.city}
                              {d.state ? `, ${d.state}` : ""}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={11}
                                className={
                                  s <= Math.round(d.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-700"
                                }
                              />
                            ))}
                            <span
                              className="text-xs font-mono ml-1"
                              style={{ color: "#6b7280" }}
                            >
                              {d.rating.toFixed(1)}
                            </span>
                          </div>
                          <span
                            className="text-sm font-mono font-bold"
                            style={{ color: "#00ff88" }}
                          >
                            ₹{d.pricePerDay.toLocaleString()}/day
                          </span>
                        </div>

                        <div
                          className="flex items-center gap-3 text-xs font-mono"
                          style={{ color: "#4ade80" }}
                        >
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {d.experienceYears}yr exp
                          </span>
                          {d.vehicleType && <span>🚗 {d.vehicleType}</span>}
                        </div>

                        {d.languages.length > 0 && (
                          <div
                            className="flex items-center gap-1 text-xs font-mono"
                            style={{ color: "#4ade80" }}
                          >
                            <Languages size={10} />
                            {d.languages.join(", ")}
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setSelected(d)}
                            className="flex-1 py-2 rounded text-xs font-mono font-semibold transition-all"
                            style={{
                              background: "rgba(0,255,136,0.05)",
                              border: "1px solid rgba(0,255,136,0.2)",
                              color: "#86efac",
                            }}
                            data-ocid="live_drivers.secondary_button"
                          >
                            DETAILS
                          </button>
                          <a
                            href={`#/book/${d.id}`}
                            className="flex-1 py-2 rounded text-xs font-mono font-black text-center transition-all"
                            style={{
                              background: "#00ff88",
                              color: "#000",
                              boxShadow: "0 0 12px rgba(0,255,136,0.4)",
                              display: "block",
                            }}
                            data-ocid="live_drivers.primary_button"
                          >
                            BOOK NOW
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{
                background: "#020c05",
                border: "1px solid rgba(0,255,136,0.3)",
                boxShadow: "0 0 40px rgba(0,255,136,0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
              data-ocid="live_drivers.modal"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">
                  {selected.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-gray-500 hover:text-white font-mono"
                  data-ocid="live_drivers.close_button"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                {selected.isOnline ? (
                  <span
                    className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded"
                    style={{
                      background: "rgba(0,255,136,0.1)",
                      border: "1px solid rgba(0,255,136,0.4)",
                      color: "#00ff88",
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full bg-[#00ff88]"
                      style={{ boxShadow: "0 0 6px #00ff88" }}
                    />
                    AVAILABLE NOW
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded"
                    style={{
                      background: "rgba(107,114,128,0.1)",
                      border: "1px solid rgba(107,114,128,0.3)",
                      color: "#6b7280",
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-gray-600 inline-block" />
                    OFFLINE
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {[
                  { l: "CITY", v: selected.city },
                  { l: "STATE", v: selected.state },
                  { l: "VEHICLE", v: selected.vehicleType || "Any" },
                  {
                    l: "EXPERIENCE",
                    v:
                      selected.experience ||
                      `${selected.experienceYears} years`,
                  },
                  { l: "LANGUAGES", v: selected.languages.join(", ") },
                  { l: "WORK AREAS", v: selected.workAreas || selected.city },
                ]
                  .filter((row) => row.v)
                  .map((row) => (
                    <div
                      key={row.l}
                      className="flex justify-between items-start gap-4 text-sm"
                    >
                      <span
                        className="font-mono text-xs"
                        style={{ color: "#4ade80" }}
                      >
                        {row.l}
                      </span>
                      <span className="text-white text-right font-mono text-xs">
                        {row.v}
                      </span>
                    </div>
                  ))}
              </div>

              {customerCity &&
                selected.city.toLowerCase() === customerCity.toLowerCase() && (
                  <div
                    className="mb-4 px-3 py-2 rounded text-xs font-mono flex items-center gap-2"
                    style={{
                      background: "rgba(0,212,255,0.08)",
                      border: "1px solid rgba(0,212,255,0.3)",
                      color: "#00d4ff",
                    }}
                  >
                    <CheckCircle size={12} />
                    DRIVER IN YOUR CITY
                  </div>
                )}

              <a
                href={`#/book/${selected.id}`}
                className="block w-full text-center py-3 rounded-xl font-mono font-black text-sm transition-all"
                style={{
                  background: "#00ff88",
                  color: "#000",
                  boxShadow: "0 0 20px rgba(0,255,136,0.4)",
                }}
                data-ocid="live_drivers.primary_button"
              >
                BOOK THIS DRIVER
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer spacer */}
      <div className="h-12" />
    </div>
  );
}
