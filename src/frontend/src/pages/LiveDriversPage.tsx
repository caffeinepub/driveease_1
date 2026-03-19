import {
  CheckCircle,
  Clock,
  Languages,
  MapPin,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Link } from "../router";
import { apiGetOnlineDrivers, apiGetRegistrations } from "../utils/backendApi";
import { INDIA_STATES } from "../utils/indiaData";
import { getRegistrations } from "../utils/localStore";

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

async function fetchLive(): Promise<LiveDriver[]> {
  const localStatusMap = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("driveease_driver_status") || "{}",
      );
    } catch {
      return {};
    }
  })();

  const [backendOnline, backendRegs] = await Promise.all([
    apiGetOnlineDrivers().catch(() => []),
    apiGetRegistrations().catch(() => []),
  ]);

  const onlinePhones = new Set<string>();
  for (const s of backendOnline) {
    if (s.status === "online") onlinePhones.add(s.phone);
  }
  for (const [key, val] of Object.entries(localStatusMap)) {
    if (val === "online") onlinePhones.add(key);
  }

  const allRegs = [...backendRegs];
  const backendPhones = new Set(backendRegs.map((r: any) => r.phone));
  for (const r of getRegistrations()) {
    if (!backendPhones.has(r.phone)) allRegs.push(r as any);
  }

  return allRegs
    .filter((r: any) => r.status === "approved" && onlinePhones.has(r.phone))
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
      vehicleType: r.vehicleType || "",
      licenseNumber: r.licenseNumber || "",
      experience: r.experience || "",
      workAreas: r.workAreas || "",
    }));
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

export default function LiveDriversPage() {
  const [drivers, setDrivers] = useState<LiveDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [selected, setSelected] = useState<LiveDriver | null>(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [secsAgo, setSecsAgo] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const live = await fetchLive();
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
    // Auto-set city filter from customer city
    const customerCity = getCustomerCity();
    if (customerCity) {
      setCityFilter(customerCity);
    }
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  // Auto-refresh every 30 seconds for real-time cross-device sync
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
    return matchCity && matchState;
  });
  const bg = "#0a0f0d";

  const detectCity = () => {
    if (!navigator.geolocation) return;
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`,
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

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div
        className="py-12 px-4 text-center"
        style={{
          background: "linear-gradient(180deg,#0d1a0d 0%,#0a0f0d 100%)",
        }}
      >
        <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          LIVE
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Live Drivers</h1>
        <p className="text-[#86efac]">
          Real-time driver availability across India
        </p>
        {customerCity && (
          <p className="text-green-400 text-sm mt-2">
            Showing drivers near <strong>{customerCity}</strong>
          </p>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-3 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setCityFilter("");
              }}
              className="flex-1 min-w-[160px] px-3 py-2 bg-[#111a14] border border-[#1a2e1a] text-[#f0fdf4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86efac]"
              />
              <Input
                placeholder="Filter by city..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="pl-9 bg-[#111a14] border-[#1a2e1a] text-[#f0fdf4] placeholder:text-[#86efac]/50"
                data-ocid="live_drivers.search_input"
              />
            </div>
            <button
              type="button"
              onClick={detectCity}
              disabled={detectingLocation}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#111a14] border border-[#1a2e1a] text-[#86efac] rounded-lg text-sm hover:border-green-600 transition-colors"
              data-ocid="live_drivers.toggle"
            >
              {detectingLocation ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                "📍"
              )}
              Detect My City
            </button>
            {cityFilter && (
              <button
                type="button"
                onClick={() => setCityFilter("")}
                className="text-[#86efac] text-sm hover:text-white underline"
              >
                Clear city
              </button>
            )}
            <Button
              onClick={refresh}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold gap-2"
              disabled={loading}
              data-ocid="live_drivers.primary_button"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />{" "}
              Refresh
            </Button>
          </div>
          <span className="text-[#86efac] text-sm">
            <Clock size={12} className="inline mr-1" />
            Updated {secsAgo}s ago
            {stateFilter && (
              <span className="ml-2 text-green-400">· {stateFilter}</span>
            )}
          </span>
        </div>

        {loading ? (
          <div
            className="text-center py-20"
            data-ocid="live_drivers.loading_state"
          >
            <RefreshCw
              size={40}
              className="text-[#22c55e] mx-auto mb-3 animate-spin"
            />
            <p className="text-[#86efac]">Loading live drivers...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-20"
            data-ocid="live_drivers.empty_state"
          >
            <div className="w-20 h-20 bg-[#111a14] border border-[#1a2e1a] rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-[#86efac]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No drivers online
            </h3>
            <p className="text-[#86efac]">
              {cityFilter
                ? `No drivers are currently online in ${cityFilter}. Try clearing the city filter.`
                : "No drivers are currently online. Check back soon."}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Drivers need to be registered, approved, and toggled online to
              appear here.
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
                    <Card className="bg-[#111a14] border border-[#1a2e1a] rounded-2xl overflow-hidden hover:border-[#22c55e]/50 transition-colors">
                      <CardContent className="p-0">
                        {isSameCity && (
                          <div className="bg-green-500/20 border-b border-green-500/30 px-4 py-1.5 flex items-center gap-2">
                            <CheckCircle size={12} className="text-green-400" />
                            <span className="text-green-400 text-xs font-semibold">
                              Matches your city
                            </span>
                          </div>
                        )}
                        <div
                          className="p-4"
                          style={{
                            background:
                              "linear-gradient(135deg,#0d1a0d 0%,#111a14 100%)",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-14 h-14 rounded-full bg-[#22c55e]/20 border-2 border-[#22c55e]/40 flex items-center justify-center text-[#22c55e] font-bold text-xl">
                                {d.name.charAt(0)}
                              </div>
                              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0f0d] animate-pulse" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-semibold">
                                  {d.name}
                                </span>
                                {d.isVerified && (
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                    ✓ Verified
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[#86efac] text-xs mt-0.5">
                                <MapPin size={10} />
                                {d.city}
                                {d.state ? `, ${d.state}` : ""}
                              </div>
                              <div className="flex items-center gap-0.5 mt-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    size={10}
                                    className={
                                      s <= Math.round(d.rating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-600"
                                    }
                                  />
                                ))}
                                <span className="text-xs text-gray-400 ml-1">
                                  {d.rating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#86efac] flex items-center gap-1">
                              <Clock size={12} />
                              {d.experienceYears} yrs exp
                            </span>
                            <span className="text-[#22c55e] font-bold">
                              ₹{d.pricePerDay.toLocaleString()}/day
                            </span>
                          </div>
                          {d.vehicleType && (
                            <div className="text-xs text-[#86efac]">
                              🚗 {d.vehicleType}
                            </div>
                          )}
                          {d.languages.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-[#86efac]">
                              <Languages size={10} />
                              {d.languages.join(", ")}
                            </div>
                          )}
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              onClick={() => setSelected(d)}
                              variant="outline"
                              className="flex-1 border-[#1a2e1a] text-[#86efac] hover:bg-[#1a2e1a] text-xs"
                              data-ocid="live_drivers.secondary_button"
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              asChild
                              className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold text-xs"
                              data-ocid="live_drivers.primary_button"
                            >
                              <Link to={`/book/${d.id}`}>Book Now</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)" }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-[#111a14] border border-[#1a2e1a] rounded-2xl p-6 w-full max-w-sm"
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
                  className="text-[#86efac] hover:text-white"
                  data-ocid="live_drivers.close_button"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 text-sm">
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
                  {
                    l: "Phone",
                    v: selected.phone.replace(
                      /^(\d{2})(\d{4})(\d{4})$/,
                      "$1****$3",
                    ),
                  },
                ]
                  .filter((row) => row.v)
                  .map((row) => (
                    <div
                      key={row.l}
                      className="flex justify-between items-start gap-4"
                    >
                      <span className="text-[#86efac] flex-shrink-0">
                        {row.l}
                      </span>
                      <span className="text-white text-right">{row.v}</span>
                    </div>
                  ))}
              </div>
              {customerCity &&
                selected.city.toLowerCase() === customerCity.toLowerCase() && (
                  <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 text-green-400 text-xs flex items-center gap-2">
                    <CheckCircle size={12} />
                    This driver is in your city ({customerCity})
                  </div>
                )}
              <Button
                asChild
                className="w-full mt-4 bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold"
                data-ocid="live_drivers.primary_button"
              >
                <Link to={`/book/${selected.id}`}>Book This Driver</Link>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
