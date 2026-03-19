import {
  CheckCircle,
  Clock,
  Languages,
  MapPin,
  Search,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  INDIA_STATES_CITIES,
  allIndianStates,
  lookupPincode,
} from "../data/pincodes";
import { Link } from "../router";
import { apiGetRegistrations } from "../utils/backendApi";
import { getRegistrations } from "../utils/localStore";

const indianCities = Object.values(INDIA_STATES_CITIES).flat();

interface ApprovedDriver {
  id: string | number;
  name: string;
  phone: string;
  city: string;
  state: string;
  rating: number;
  experienceYears: number;
  pricePerDay: number;
  languages: string[];
  vehicleType: string;
  isVerified: boolean;
  trustBadges: string[];
}

function parseExp(exp: string): number {
  if (exp?.includes("10+")) return 10;
  if (exp?.includes("5-10")) return 7;
  if (exp?.includes("3-5")) return 4;
  if (exp?.includes("1-2")) return 2;
  return 1;
}

export default function DriversPage() {
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [drivers, setDrivers] = useState<ApprovedDriver[]>([]);
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<{
    city: string | null;
    state: string | null;
    searched: boolean;
  }>({ city: null, state: null, searched: false });

  useEffect(() => {
    const load = async () => {
      try {
        const backendRegs = await apiGetRegistrations().catch(() => []);
        const localRegs = getRegistrations();
        const all = [...backendRegs];
        const phones = new Set(all.map((r: any) => r.phone));
        for (const r of localRegs) {
          if (!phones.has(r.phone)) all.push(r as any);
        }
        setDrivers(
          all
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
              vehicleType: r.vehicleType || "Any",
              isVerified: true,
              trustBadges: ["Verified", "Background Checked"],
            })),
        );
      } catch {
        /* ignore */
      }
    };
    load();
  }, []);

  const handlePincodeSearch = () => {
    if (!pincode.trim()) return;
    const result = lookupPincode(pincode.trim());
    setPincodeResult({
      city: result?.city ?? null,
      state: result?.state ?? null,
      searched: true,
    });
    if (result) {
      setCityFilter(result.city);
      setStateFilter(result.state);
    }
  };

  const citiesForState =
    stateFilter !== "all"
      ? (INDIA_STATES_CITIES[stateFilter] ?? indianCities)
      : indianCities;
  const filtered = drivers.filter((d) => {
    if (stateFilter !== "all" && d.state !== stateFilter) return false;
    if (cityFilter !== "all" && d.city !== cityFilter) return false;
    if (
      search &&
      !d.name.toLowerCase().includes(search.toLowerCase()) &&
      !d.city.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const bg = "#0a0f0d";
  const inputCls =
    "bg-[#111a14] border-[#1a2e1a] text-[#f0fdf4] placeholder:text-[#86efac]/40";

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div
        className="py-10 px-4 text-center"
        style={{
          background: "linear-gradient(180deg,#0d1a0d 0%,#0a0f0d 100%)",
        }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Find Your Trusted Driver
        </h1>
        <p className="text-[#86efac]">
          All drivers are background-verified and grooming-certified
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Covering all 28 states + 8 UTs across India
        </p>
      </div>

      <div className="py-8 px-4" style={{ background: "#0d1a0d" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-white text-xl font-bold mb-1">
            Check Driver Availability by Pincode
          </h2>
          <p className="text-[#86efac] text-sm mb-5">
            Enter your area pincode to find nearby verified drivers
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <Input
              placeholder="Enter your pincode (e.g. 400001)"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePincodeSearch()}
              className={inputCls}
              maxLength={6}
              data-ocid="drivers.search_input"
            />
            <Button
              onClick={handlePincodeSearch}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold gap-2"
              data-ocid="drivers.primary_button"
            >
              <Search size={16} />
              Search
            </Button>
          </div>
          {pincodeResult.searched && (
            <div className="mt-4">
              {pincodeResult.city ? (
                <div className="inline-flex items-center gap-2 bg-green-600/20 border border-green-600/40 text-green-400 rounded-full px-5 py-2 text-sm font-semibold">
                  <CheckCircle size={16} />
                  Drivers available in {pincodeResult.city},{" "}
                  {pincodeResult.state}!
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-full px-5 py-2 text-sm font-semibold">
                  We are expanding to your area soon!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-[#111a14] border border-[#1a2e1a] rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`max-w-xs ${inputCls}`}
            data-ocid="drivers.search_input"
          />
          <Select
            value={stateFilter}
            onValueChange={(v) => {
              setStateFilter(v);
              setCityFilter("all");
            }}
          >
            <SelectTrigger
              className={`w-[160px] ${inputCls}`}
              data-ocid="drivers.select"
            >
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent className="bg-[#111a14] border-[#1a2e1a] text-[#f0fdf4]">
              <SelectItem value="all">All States</SelectItem>
              {allIndianStates.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger
              className={`w-[160px] ${inputCls}`}
              data-ocid="drivers.select"
            >
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent className="bg-[#111a14] border-[#1a2e1a] text-[#f0fdf4]">
              <SelectItem value="all">All Cities</SelectItem>
              {citiesForState.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(cityFilter !== "all" || stateFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setCityFilter("all");
                setStateFilter("all");
                setPincodeResult({ city: null, state: null, searched: false });
                setPincode("");
              }}
              className="text-sm text-[#22c55e] underline"
            >
              Clear filter
            </button>
          )}
          <span className="ml-auto text-sm font-semibold text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30 px-3 py-1 rounded-full">
            {filtered.length} found · Total: {drivers.length}
          </span>
        </div>

        {drivers.length === 0 ? (
          <div className="text-center py-20" data-ocid="drivers.empty_state">
            <div className="w-20 h-20 bg-[#111a14] border border-[#1a2e1a] rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-[#86efac]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No approved drivers yet
            </h3>
            <p className="text-[#86efac]">
              Drivers will appear here once they register and get approved by
              admin.
            </p>
            <Button
              asChild
              className="mt-4 bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold"
            >
              <Link to="/register-driver">Register as Driver</Link>
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-16 text-[#86efac]"
            data-ocid="drivers.empty_state"
          >
            No drivers found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((d, idx) => (
              <Card
                key={d.id}
                className="bg-[#111a14] border border-[#1a2e1a] rounded-2xl overflow-hidden hover:border-[#22c55e]/50 transition-colors"
                data-ocid={`drivers.item.${idx + 1}`}
              >
                <CardContent className="p-0">
                  <div
                    className="p-4"
                    style={{
                      background:
                        "linear-gradient(135deg,#0d1a0d 0%,#111a14 100%)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-[#22c55e]/20 border-2 border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] font-bold text-xl">
                          {d.name.charAt(0)}
                        </div>
                        {d.isVerified && (
                          <span className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#0a0f0d]">
                            <CheckCircle
                              size={11}
                              className="text-white fill-white"
                            />
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-white font-semibold">{d.name}</div>
                        <div className="flex items-center gap-1 text-[#86efac] text-xs">
                          <MapPin size={10} />
                          {d.city}, {d.state}
                        </div>
                        <div className="flex items-center gap-0.5">
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
                            ★ {d.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1 text-[#86efac]">
                        <Clock size={12} />
                        {d.experienceYears} yrs exp.
                      </span>
                      <span className="font-bold text-[#22c55e]">
                        ₹{d.pricePerDay.toLocaleString()}/day
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#86efac]">
                      <Languages size={10} />
                      {d.languages.join(", ")}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {d.trustBadges.map((b) => (
                        <Badge
                          key={b}
                          className="text-xs bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 font-normal px-1.5"
                        >
                          {b}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="w-full mt-2 bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold"
                      data-ocid="drivers.primary_button"
                    >
                      <Link to={`/book/${d.id}`}>Book Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
