import {
  CheckCircle,
  Clock,
  Languages,
  MapPin,
  Search,
  Star,
} from "lucide-react";
import { useState } from "react";
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
import { indianCities, seedDrivers } from "../data/drivers";
import {
  INDIA_STATES_CITIES,
  allIndianStates,
  lookupPincode,
} from "../data/pincodes";
import { Link } from "../router";

export default function DriversPage() {
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<{
    city: string | null;
    state: string | null;
    searched: boolean;
  }>({ city: null, state: null, searched: false });

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

  const filtered = seedDrivers.filter((d) => {
    if (availableOnly && !d.isAvailable) return false;
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

  const renderStars = (rating: number) => (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={
            s <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }
        />
      ))}
      <span className="text-xs font-semibold text-gray-700 ml-1">
        ★ {rating.toFixed(1)}
      </span>
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-10 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">Find Your Trusted Driver</h1>
        <p className="text-gray-400">
          All drivers are background-verified and grooming-certified
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Covering all 28 states + 8 UTs across India
        </p>
      </div>

      {/* Pincode Search Section */}
      <div className="bg-green-700 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-white text-xl font-bold mb-1">
            Check Driver Availability by Pincode
          </h2>
          <p className="text-green-200 text-sm mb-5">
            Enter your area pincode to find nearby verified drivers
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <Input
              placeholder="Enter your pincode (e.g. 400001)"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePincodeSearch()}
              className="bg-white text-gray-900 border-0 rounded-lg text-base h-12"
              maxLength={6}
              data-ocid="drivers.search_input"
            />
            <Button
              onClick={handlePincodeSearch}
              className="bg-white text-green-700 hover:bg-green-50 font-bold px-6 h-12 rounded-lg flex items-center gap-2"
              data-ocid="drivers.primary_button"
            >
              <Search size={16} /> Search
            </Button>
          </div>
          {pincodeResult.searched && (
            <div className="mt-4">
              {pincodeResult.city ? (
                <div className="inline-flex items-center gap-2 bg-green-600 text-white rounded-full px-5 py-2 text-sm font-semibold">
                  <CheckCircle size={16} />
                  Drivers available in {pincodeResult.city},{" "}
                  {pincodeResult.state}! Showing results below.
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-amber-500 text-white rounded-full px-5 py-2 text-sm font-semibold">
                  We are expanding to your area soon! Meanwhile browse all
                  drivers below.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
            data-ocid="drivers.search_input"
          />
          {/* State Filter */}
          <Select
            value={stateFilter}
            onValueChange={(v) => {
              setStateFilter(v);
              setCityFilter("all");
            }}
          >
            <SelectTrigger className="w-[160px]" data-ocid="drivers.select">
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
          {/* City Filter */}
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-[160px]" data-ocid="drivers.select">
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
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="accent-green-600"
            />
            Available Now
          </label>
          {(cityFilter !== "all" || stateFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setCityFilter("all");
                setStateFilter("all");
                setPincodeResult({ city: null, state: null, searched: false });
                setPincode("");
              }}
              className="text-sm text-green-600 underline"
            >
              Clear filter
            </button>
          )}
          <span className="ml-auto text-sm text-gray-500">
            {filtered.length} drivers found
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((driver, idx) => (
            <Card
              key={driver.id}
              className="border hover:shadow-md transition-shadow overflow-hidden"
              data-ocid={`drivers.item.${idx + 1}`}
            >
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={driver.photoUrl}
                      alt={driver.name}
                      className="w-14 h-14 rounded-full bg-gray-600"
                    />
                    {driver.isVerified && (
                      <span className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-gray-900">
                        <CheckCircle
                          size={11}
                          className="text-white fill-white"
                        />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {driver.name}
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <MapPin size={10} />
                      {driver.city}, {driver.state}
                    </div>
                    {renderStars(driver.rating)}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock size={12} />
                      {driver.experienceYears} yrs exp.
                    </span>
                    <span className="font-bold text-green-700">
                      ₹{driver.pricePerDay.toLocaleString()}/day
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Languages size={10} />
                    {driver.languages.join(", ")}
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-medium flex items-center gap-1 ${driver.isAvailable ? "text-green-600" : "text-gray-400"}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full inline-block ${driver.isAvailable ? "bg-green-500" : "bg-gray-400"}`}
                      />
                      {driver.isAvailable ? "Available" : "Busy"}
                    </span>
                    {driver.isVerified && (
                      <span className="flex items-center gap-0.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        <CheckCircle
                          size={10}
                          className="fill-green-600 text-green-600"
                        />{" "}
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  {driver.trustBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {driver.trustBadges.map((b) => (
                        <Badge
                          key={b}
                          className="text-xs bg-green-50 text-green-700 border border-green-200 font-normal px-1.5"
                        >
                          {b}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button
                    asChild
                    size="sm"
                    className="w-full mt-2 bg-green-600 hover:bg-green-500 text-white"
                    disabled={!driver.isAvailable}
                    data-ocid="drivers.primary_button"
                  >
                    <Link to={`/book/${driver.id}`}>
                      {driver.isAvailable ? "Book Now" : "Not Available"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {filtered.length === 0 && (
          <div
            className="text-center py-16 text-gray-500"
            data-ocid="drivers.empty_state"
          >
            No drivers found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
