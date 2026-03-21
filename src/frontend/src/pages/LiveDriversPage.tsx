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
import PageHeader from "../components/PageHeader";
import SparkleBackground from "../components/SparkleBackground";
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
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
        copied
          ? "bg-green-50 border-green-400 text-green-700"
          : "bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700"
      }`}
      data-ocid="live_drivers.share_button"
    >
      <Copy size={14} />
      {copied ? "Link Copied!" : "Share Link"}
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
    const autoRefresh = setInterval(() => refresh(), 15000);
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
    <div className="min-h-screen bg-white" style={{ position: "relative" }}>
      <SparkleBackground />
      {/* Sparkle background */}
      <style>{`
        @keyframes sparkleFloat {
          0% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-40px) scale(0.8); opacity: 0; }
        }
        @keyframes sparkleTwinkle {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 1; }
        }
      `}</style>
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {Array.from({ length: 25 }, (_, i) => i).map((i) => {
          const colors = [
            "#22c55e",
            "#4ade80",
            "#facc15",
            "#38bdf8",
            "#f472b6",
            "#ffffff",
          ];
          const color = colors[i % colors.length];
          const isStar = i % 3 === 0;
          const size = isStar ? 16 : i % 2 === 0 ? 3 : 2;
          const left = ((i * 37 + 11) % 97) + 1;
          const top = ((i * 19 + 7) % 90) + 5;
          const delay = (i * 0.3) % 5;
          const duration = 3 + (i % 5);
          return (
            <div
              key={`sparkle-${i}`}
              style={{
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                color: isStar ? color : undefined,
                width: isStar ? undefined : `${size}px`,
                height: isStar ? undefined : `${size}px`,
                fontSize: isStar ? `${size}px` : undefined,
                background: isStar ? undefined : color,
                borderRadius: isStar ? undefined : "50%",
                opacity: 0.4 + (i % 3) * 0.15,
                animation:
                  i % 5 === 0
                    ? `sparkleTwinkle ${duration}s ease-in-out ${delay}s infinite`
                    : `sparkleFloat ${duration}s ease-in ${delay}s infinite`,
              }}
            >
              {isStar ? "✦" : ""}
            </div>
          );
        })}
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <PageHeader subtitle="Live Drivers" />
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-green-50 to-white border-b border-green-100">
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            {/* LIVE badge */}
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                <span
                  className="w-2 h-2 rounded-full bg-green-500"
                  style={{ animation: "blink-dot 1.2s ease-in-out infinite" }}
                />
                LIVE
              </span>
            </div>

            <style>{`
            @keyframes blink-dot {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.2; }
            }
          `}</style>

            <h1
              className="text-4xl md:text-5xl font-black text-gray-900 mb-3"
              style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
            >
              Live Driver Network
            </h1>
            <p className="text-gray-500 text-base mb-6">
              All verified DriveEase drivers across India
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
                <span className="text-xl font-bold text-gray-900">
                  {drivers.length}
                </span>
                <span className="text-sm text-gray-500">Total Drivers</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
                <span
                  className="w-2.5 h-2.5 rounded-full bg-green-500"
                  style={{ animation: "blink-dot 1.2s ease-in-out infinite" }}
                />
                <span className="text-xl font-bold text-green-700">
                  {onlineCount}
                </span>
                <span className="text-sm text-green-600">Online Now</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
                <Zap size={14} className="text-yellow-500" />
                <span className="text-sm text-gray-500">
                  Updated {secsAgo < 5 ? "just now" : `${secsAgo}s ago`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Filter bar */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                statusFilter === "all"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
              }`}
              data-ocid="live_drivers.tab"
            >
              All ({drivers.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("online")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                statusFilter === "online"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
              }`}
              data-ocid="live_drivers.tab"
            >
              <span
                className="w-2 h-2 rounded-full bg-green-400"
                style={
                  statusFilter === "online"
                    ? { animation: "blink-dot 1s ease-in-out infinite" }
                    : {}
                }
              />
              Online ({onlineCount})
            </button>
            <div className="ml-auto flex items-center gap-2">
              <Button
                onClick={refresh}
                disabled={loading}
                size="sm"
                variant="outline"
                className="text-green-700 border-green-200 hover:bg-green-50"
                data-ocid="live_drivers.primary_button"
              >
                <RefreshCw
                  size={14}
                  className={`mr-1 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <ShareLinkButton />
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setCityFilter("");
              }}
              className="flex-1 min-w-[160px] px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-green-400"
              data-ocid="live_drivers.select"
            >
              <option value="">All States</option>
              {INDIA_STATES.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            <div className="relative flex-1 min-w-[160px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Search city..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="pl-8 bg-white border-gray-200 text-gray-700"
                data-ocid="live_drivers.search_input"
              />
            </div>

            <button
              type="button"
              onClick={detectCity}
              disabled={detectingLocation}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 transition-all"
              data-ocid="live_drivers.toggle"
            >
              {detectingLocation ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <MapPin size={12} />
              )}
              Locate Me
            </button>

            {cityFilter && (
              <button
                type="button"
                onClick={() => setCityFilter("")}
                className="text-xs text-green-600 underline hover:text-green-800"
              >
                Clear
              </button>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div
              className="text-center py-24"
              data-ocid="live_drivers.loading_state"
            >
              <div className="w-16 h-16 rounded-full border-2 border-green-200 mx-auto mb-4 flex items-center justify-center">
                <RefreshCw size={28} className="text-green-600 animate-spin" />
              </div>
              <p className="text-gray-500 text-sm">Loading drivers...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-24"
              data-ocid="live_drivers.empty_state"
            >
              <div className="w-20 h-20 rounded-full bg-green-50 border border-green-100 mx-auto mb-4 flex items-center justify-center">
                <MapPin size={32} className="text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {statusFilter === "online"
                  ? "No Drivers Online"
                  : "No Drivers Found"}
              </h3>
              <p className="text-gray-500 text-sm">
                {cityFilter
                  ? `No drivers in ${cityFilter}. Try clearing the filter.`
                  : statusFilter === "online"
                    ? "Switch to All to see everyone registered."
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
                      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-green-300 hover:shadow-md transition-all duration-200">
                        {/* City match banner */}
                        {isSameCity && (
                          <div className="px-4 py-1.5 flex items-center gap-2 text-xs font-semibold bg-blue-50 border-b border-blue-100 text-blue-700">
                            <CheckCircle size={11} />
                            Matches your city
                          </div>
                        )}

                        {/* Card header */}
                        <div className="p-4 bg-gradient-to-r from-green-50 to-white">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-14 h-14 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center font-bold text-xl text-green-700">
                                {d.name.charAt(0)}
                              </div>
                              <span
                                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                                style={{
                                  background: d.isOnline
                                    ? "#22c55e"
                                    : "#9ca3af",
                                  animation: d.isOnline
                                    ? "blink-dot 1.5s ease-in-out infinite"
                                    : "none",
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className="text-gray-900 font-bold">
                                  {d.name}
                                </span>
                                {d.isVerified && (
                                  <Badge className="text-xs bg-green-50 text-green-700 border border-green-200 font-normal px-1.5">
                                    ✓ Verified
                                  </Badge>
                                )}
                              </div>
                              {d.isOnline ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                                  <span
                                    className="w-1.5 h-1.5 rounded-full bg-green-500"
                                    style={{
                                      animation:
                                        "blink-dot 1s ease-in-out infinite",
                                    }}
                                  />
                                  Online
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
                                  Offline
                                </span>
                              )}
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
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
                                      : "text-gray-200"
                                  }
                                />
                              ))}
                              <span className="text-xs text-gray-400 ml-1">
                                {d.rating.toFixed(1)}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-green-700">
                              ₹{d.pricePerDay.toLocaleString()}/day
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {d.experienceYears}yr exp
                            </span>
                            {d.vehicleType && <span>🚗 {d.vehicleType}</span>}
                          </div>

                          {d.languages.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Languages size={10} />
                              {d.languages.join(", ")}
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setSelected(d)}
                              className="flex-1 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-all"
                              data-ocid="live_drivers.secondary_button"
                            >
                              Details
                            </button>
                            <a
                              href={`#/book/${d.id}`}
                              className="flex-1 py-2 rounded-lg text-xs font-bold text-center bg-green-600 hover:bg-green-700 text-white transition-all"
                              style={{ display: "block" }}
                              data-ocid="live_drivers.primary_button"
                            >
                              Book Now
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
              style={{ background: "rgba(0,0,0,0.5)" }}
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-gray-100"
                onClick={(e) => e.stopPropagation()}
                data-ocid="live_drivers.modal"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900 font-bold text-lg">
                    {selected.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="text-gray-400 hover:text-gray-700 text-xl font-bold"
                    data-ocid="live_drivers.close_button"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-4">
                  {selected.isOnline ? (
                    <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700">
                      <span
                        className="w-2 h-2 rounded-full bg-green-500"
                        style={{
                          animation: "blink-dot 1s ease-in-out infinite",
                        }}
                      />
                      Available Now
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-500">
                      <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                      Offline
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {[
                    { l: "City", v: selected.city },
                    { l: "State", v: selected.state },
                    { l: "Vehicle", v: selected.vehicleType || "Any" },
                    {
                      l: "Experience",
                      v:
                        selected.experience ||
                        `${selected.experienceYears} years`,
                    },
                    { l: "Languages", v: selected.languages.join(", ") },
                    { l: "Work Areas", v: selected.workAreas || selected.city },
                  ]
                    .filter((row) => row.v)
                    .map((row) => (
                      <div
                        key={row.l}
                        className="flex justify-between items-start gap-4 text-sm py-1.5 border-b border-gray-50"
                      >
                        <span className="text-gray-500 text-xs">{row.l}</span>
                        <span className="text-gray-900 text-right text-xs font-medium">
                          {row.v}
                        </span>
                      </div>
                    ))}
                </div>

                {customerCity &&
                  selected.city.toLowerCase() ===
                    customerCity.toLowerCase() && (
                    <div className="mb-4 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs flex items-center gap-2">
                      <CheckCircle size={12} />
                      Driver is in your city
                    </div>
                  )}

                <a
                  href={`#/book/${selected.id}`}
                  className="block w-full text-center py-3 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-700 text-white transition-all"
                  data-ocid="live_drivers.primary_button"
                >
                  Book This Driver
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer spacer */}
        <div className="h-12" />
      </div>
    </div>
  );
}
