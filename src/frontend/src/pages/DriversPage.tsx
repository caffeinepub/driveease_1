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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-50 to-white border-b border-green-100">
        <div className="max-w-3xl mx-auto py-12 px-4 text-center">
          <h1
            className="text-3xl md:text-4xl font-black text-gray-900 mb-2"
            style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
          >
            Find Your Trusted Driver
          </h1>
          <p className="text-green-700 font-medium">
            All drivers are background-verified and grooming-certified
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Covering all 28 states + 8 UTs across India
          </p>
        </div>
      </div>

      {/* Pincode search */}
      <div className="bg-green-50 border-b border-green-100 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-gray-900 text-xl font-bold mb-1">
            Check Driver Availability by Pincode
          </h2>
          <p className="text-gray-500 text-sm mb-5">
            Enter your area pincode to find nearby verified drivers
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <Input
              placeholder="Enter your pincode (e.g. 400001)"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePincodeSearch()}
              className="bg-white border-gray-200"
              maxLength={6}
              data-ocid="drivers.search_input"
            />
            <Button
              onClick={handlePincodeSearch}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold gap-2"
              data-ocid="drivers.primary_button"
            >
              <Search size={16} />
              Search
            </Button>
          </div>
          {pincodeResult.searched && (
            <div className="mt-4">
              {pincodeResult.city ? (
                <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 rounded-full px-5 py-2 text-sm font-semibold">
                  <CheckCircle size={16} />
                  Drivers available in {pincodeResult.city},{" "}
                  {pincodeResult.state}!
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-5 py-2 text-sm font-semibold">
                  We are expanding to your area soon!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter bar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
          <Input
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs bg-white border-gray-200"
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
              className="w-[160px] bg-white border-gray-200"
              data-ocid="drivers.select"
            >
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
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
              className="w-[160px] bg-white border-gray-200"
              data-ocid="drivers.select"
            >
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
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
              className="text-sm text-green-600 underline hover:text-green-800"
            >
              Clear filter
            </button>
          )}
          <span className="ml-auto text-sm font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
            {filtered.length} found · Total: {drivers.length}
          </span>
        </div>

        {drivers.length === 0 ? (
          <div className="text-center py-20" data-ocid="drivers.empty_state">
            <div className="w-20 h-20 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No approved drivers yet
            </h3>
            <p className="text-gray-500">
              Drivers will appear here once they register and get approved by
              admin.
            </p>
            <Button
              asChild
              className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              <Link to="/register-driver">Register as Driver</Link>
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-16 text-gray-500"
            data-ocid="drivers.empty_state"
          >
            No drivers found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((d, idx) => (
              <Card
                key={d.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-green-300 hover:shadow-md transition-all"
                data-ocid={`drivers.item.${idx + 1}`}
              >
                <CardContent className="p-0">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-white">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center text-green-700 font-bold text-xl">
                          {d.name.charAt(0)}
                        </div>
                        {d.isVerified && (
                          <span className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                            <CheckCircle
                              size={11}
                              className="text-white fill-white"
                            />
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-gray-900 font-semibold">
                          {d.name}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
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
                                  : "text-gray-200"
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
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock size={12} />
                        {d.experienceYears} yrs exp.
                      </span>
                      <span className="font-bold text-green-700">
                        ₹{d.pricePerDay.toLocaleString()}/day
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Languages size={10} />
                      {d.languages.join(", ")}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {d.trustBadges.map((b) => (
                        <Badge
                          key={b}
                          className="text-xs bg-green-50 text-green-700 border border-green-200 font-normal px-1.5"
                        >
                          {b}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold"
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
