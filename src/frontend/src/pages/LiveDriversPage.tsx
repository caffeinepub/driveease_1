import {
  CheckCircle,
  Clock,
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
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { indianCities, seedDrivers } from "../data/drivers";
import { Link } from "../router";
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
  trustBadges: string[];
  photoUrl: string;
  isVerified: boolean;
  isRegistered?: boolean;
}

function getOnlineDriverIds(): Set<string> {
  try {
    const status = JSON.parse(
      localStorage.getItem("driveease_driver_status") || "{}",
    );
    return new Set(
      Object.entries(status)
        .filter(([, v]) => v === "online")
        .map(([k]) => k),
    );
  } catch {
    return new Set();
  }
}

function buildLiveDrivers(): LiveDriver[] {
  const onlineIds = getOnlineDriverIds();

  // Seed drivers that are available
  const seedLive: LiveDriver[] = seedDrivers
    .filter((d) => d.isAvailable || onlineIds.has(String(d.id)))
    .map((d) => ({
      id: d.id,
      name: d.name,
      phone: d.phone ?? "",
      city: d.city,
      state: d.state,
      rating: d.rating,
      experienceYears: d.experienceYears,
      pricePerDay: d.pricePerDay,
      languages: d.languages,
      trustBadges: d.trustBadges,
      photoUrl: d.photoUrl,
      isVerified: d.isVerified,
    }));

  // Registered drivers (approved or online)
  const regs = getRegistrations();
  const registeredLive: LiveDriver[] = regs
    .filter(
      (r) =>
        r.status === "approved" ||
        onlineIds.has(String(r.id)) ||
        onlineIds.has(r.phone),
    )
    .map((r) => ({
      id: `reg-${r.id}`,
      name: r.name,
      phone: r.phone,
      city: r.city,
      state: r.state,
      rating: 4.5,
      experienceYears: 2,
      pricePerDay: 1200,
      languages: ["Hindi", "English"],
      trustBadges: ["Background Verified"],
      photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=16a34a&color=fff&size=128`,
      isVerified: r.status === "approved",
      isRegistered: true,
    }));

  // Merge, avoiding duplicates by phone
  const phones = new Set(seedLive.map((d) => d.phone));
  const merged = [
    ...seedLive,
    ...registeredLive.filter((d) => !phones.has(d.phone)),
  ];
  return merged;
}

export default function LiveDriversPage() {
  const [citySearch, setCitySearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [liveDrivers, setLiveDrivers] = useState<LiveDriver[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(() => {
    setLiveDrivers(buildLiveDrivers());
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    reload();
    const iv = setInterval(reload, 10000);
    return () => clearInterval(iv);
  }, [reload]);

  const suggestions = citySearch.trim()
    ? indianCities
        .filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()))
        .slice(0, 8)
    : [];

  const filteredDrivers = selectedCity
    ? liveDrivers.filter(
        (d) => d.city.toLowerCase() === selectedCity.toLowerCase(),
      )
    : liveDrivers;

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setCitySearch(city);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setSelectedCity("");
    setCitySearch("");
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current
          .closest(".city-search-wrapper")
          ?.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const renderStars = (rating: number) => (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={11}
          className={
            s <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-600"
          }
        />
      ))}
      <span className="text-xs font-semibold text-gray-300 ml-1">
        {rating.toFixed(1)}
      </span>
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500" />
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Live Drivers Near You
            </h1>
          </div>
          <p className="text-gray-400 mb-2">
            Browse available drivers right now — filtered by city in real time
          </p>
          <div
            className="inline-flex items-center gap-2 bg-green-900/40 border border-green-700/50 text-green-300 rounded-full px-5 py-2 text-sm font-semibold mt-1"
            data-ocid="live_drivers.success_state"
          >
            <Zap size={14} className="fill-green-400 text-green-400" />
            {liveDrivers.length} drivers available right now across India
          </div>
        </div>
      </div>

      {/* City Search */}
      <div className="bg-gray-900 px-4 pb-8 pt-6">
        <div className="max-w-xl mx-auto">
          <div className="relative city-search-wrapper">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
            <Input
              ref={inputRef}
              placeholder="Type a city name (e.g. Mumbai, Delhi, Bangalore...)"
              value={citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value);
                setSelectedCity("");
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="pl-9 pr-20 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-green-500"
              data-ocid="live_drivers.search_input"
            />
            {citySearch && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
                data-ocid="live_drivers.cancel_button"
              >
                Clear
              </button>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                {suggestions.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onMouseDown={() => handleCitySelect(city)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                    data-ocid="live_drivers.button"
                  >
                    <MapPin size={12} className="text-green-500" />
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              {selectedCity ? (
                <span className="text-green-400 font-medium">
                  Showing live drivers in{" "}
                  <span className="text-white">{selectedCity}</span>
                </span>
              ) : (
                <span>Showing all available drivers across India</span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={reload}
              className="border-gray-700 text-gray-400 hover:text-white hover:border-green-600 gap-1.5"
              data-ocid="live_drivers.secondary_button"
            >
              <RefreshCw size={13} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Driver Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {filteredDrivers.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
              data-ocid="live_drivers.empty_state"
            >
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No live drivers{selectedCity ? ` in ${selectedCity}` : ""}
              </h3>
              <p className="text-gray-500 mb-6">
                All drivers in this city are currently busy or offline. Try
                another city or refresh.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleClear}
                  className="bg-green-600 hover:bg-green-500 text-white"
                  data-ocid="live_drivers.primary_button"
                >
                  View All India Drivers
                </Button>
                <Button
                  variant="outline"
                  onClick={reload}
                  className="border-gray-700 text-gray-400 hover:text-white"
                  data-ocid="live_drivers.secondary_button"
                >
                  <RefreshCw size={14} className="mr-1" /> Refresh
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`grid-${refreshKey}-${selectedCity}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-gray-500 text-sm mb-5">
                <span className="text-green-400 font-semibold">
                  {filteredDrivers.length}
                </span>{" "}
                driver{filteredDrivers.length !== 1 ? "s" : ""} available
                {selectedCity ? ` in ${selectedCity}` : " across India"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDrivers.map((driver, idx) => (
                  <motion.div
                    key={driver.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    data-ocid={`live_drivers.item.${idx + 1}`}
                  >
                    <Card className="border-gray-800 bg-gray-900 hover:border-green-700 transition-all hover:shadow-green-900/30 hover:shadow-xl overflow-hidden">
                      <CardContent className="p-0">
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={driver.photoUrl}
                              alt={driver.name}
                              className="w-14 h-14 rounded-full bg-gray-700 object-cover"
                            />
                            <span className="absolute -top-1 -right-1 flex items-center">
                              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-gray-800" />
                            </span>
                            {driver.isVerified && (
                              <span className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-gray-900">
                                <CheckCircle
                                  size={11}
                                  className="text-white fill-white"
                                />
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-white font-semibold text-sm truncate block">
                              {driver.name}
                            </span>
                            <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                              <MapPin size={10} />
                              {driver.city}, {driver.state}
                            </div>
                            {renderStars(driver.rating)}
                          </div>
                        </div>

                        <div className="px-4 pt-3 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 bg-green-900/50 border border-green-700/50 text-green-400 text-xs font-bold px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                            LIVE
                          </span>
                          {driver.isVerified && (
                            <span className="flex items-center gap-0.5 bg-green-950 border border-green-800 text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                              <CheckCircle
                                size={9}
                                className="fill-green-500 text-green-500"
                              />
                              Verified
                            </span>
                          )}
                        </div>

                        <div className="p-4 pt-2 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1 text-gray-500">
                              <Clock size={12} />
                              {driver.experienceYears} yrs
                            </span>
                            <span className="font-bold text-green-400">
                              ₹{driver.pricePerDay.toLocaleString()}/day
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Languages size={10} />
                            {driver.languages.join(", ")}
                          </div>
                          {driver.trustBadges.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {driver.trustBadges.map((b) => (
                                <Badge
                                  key={b}
                                  className="text-xs bg-gray-800 text-gray-400 border border-gray-700 font-normal px-1.5"
                                >
                                  {b}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <Button
                            asChild
                            size="sm"
                            className="w-full mt-2 bg-green-600 hover:bg-green-500 text-white font-semibold"
                            data-ocid="live_drivers.primary_button"
                          >
                            <Link
                              to={`/book/${driver.isRegistered ? "reg" : driver.id}`}
                            >
                              Book Now →
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
