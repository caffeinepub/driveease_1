import { Car, MapPin, RefreshCw, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Link } from "../router";
import { apiGetOnlineDrivers, apiGetRegistrations } from "../utils/backendApi";
import { getRegistrations } from "../utils/localStore";

interface DriverCard {
  id: number;
  name: string;
  phone: string;
  vehicleType: string;
  city: string;
  avgRating: string;
  isOnline: boolean;
}

async function fetchApprovedDrivers(): Promise<DriverCard[]> {
  const [backendRegs, onlineDrivers] = await Promise.all([
    apiGetRegistrations().catch(() => []),
    apiGetOnlineDrivers().catch(() => []),
  ]);

  const localRegs = getRegistrations();

  const all = [...backendRegs];
  const phones = new Set(all.map((r) => r.phone));
  for (const r of localRegs) {
    if (!phones.has(r.phone)) all.push(r as any);
  }

  const onlinePhones = new Set(
    onlineDrivers.filter((d) => d.status === "online").map((d) => d.phone),
  );
  try {
    const localStatusMap = JSON.parse(
      localStorage.getItem("driveease_driver_status") || "{}",
    );
    for (const [key, val] of Object.entries(localStatusMap)) {
      if (val === "online") onlinePhones.add(key);
    }
    const legacyMap = JSON.parse(
      localStorage.getItem("driveease_driver_statuses") || "{}",
    );
    for (const [key, val] of Object.entries(legacyMap)) {
      if (val === "online") onlinePhones.add(key);
    }
  } catch {
    /* ignore */
  }

  let feedback: Array<{ driverName: string; rating: number }> = [];
  try {
    feedback = JSON.parse(localStorage.getItem("driveease_feedback") || "[]");
  } catch {
    /* ignore */
  }

  const approved = all.filter((r) => r.status === "approved");

  return approved.map((d) => {
    const driverFeedback = feedback.filter((f) => f.driverName === d.name);
    const avgRating =
      driverFeedback.length > 0
        ? (
            driverFeedback.reduce((sum, f) => sum + f.rating, 0) /
            driverFeedback.length
          ).toFixed(1)
        : "5.0";
    const isOnline = onlinePhones.has(d.phone);
    return {
      id: d.id,
      name: d.name,
      phone: d.phone,
      vehicleType: d.vehicleType || "",
      city: d.city || "",
      avgRating,
      isOnline,
    };
  });
}

export default function AvailableDriversPage() {
  const [drivers, setDrivers] = useState<DriverCard[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchApprovedDrivers();
    setDrivers(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, [load]);

  const shown =
    filter === "online" ? drivers.filter((d) => d.isOnline) : drivers;

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1
              className="text-3xl font-bold text-gray-900"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Available Drivers
            </h1>
            <p className="text-gray-500 mt-2">
              Find and book a verified personal driver near you
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            data-ocid="available_drivers.button"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filter === "all"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            data-ocid="available_drivers.tab"
          >
            All Drivers ({drivers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("online")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              filter === "online"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            data-ocid="available_drivers.tab"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Online Now ({drivers.filter((d) => d.isOnline).length})
          </button>
        </div>

        {loading && drivers.length === 0 ? (
          <div
            className="text-center py-16"
            data-ocid="available_drivers.loading_state"
          >
            <RefreshCw
              size={32}
              className="mx-auto text-green-400 mb-4 animate-spin"
            />
            <p className="text-gray-500">Loading drivers...</p>
          </div>
        ) : shown.length === 0 ? (
          <div
            className="text-center py-16"
            data-ocid="available_drivers.empty_state"
          >
            <Car size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">
              No {filter === "online" ? "online " : ""}drivers found
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {filter === "online"
                ? "Switch to 'All Drivers' to see everyone"
                : "Drivers will appear here once registered and approved"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map((driver, idx) => (
              <div
                key={driver.id || idx}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                data-ocid={`available_drivers.item.${idx + 1}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-white font-bold text-xl">
                      {driver.name?.charAt(0)?.toUpperCase() || "D"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">
                        {driver.name}
                      </h3>
                      {driver.city && (
                        <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {driver.city}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    className={
                      driver.isOnline
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                    }
                  >
                    {driver.isOnline ? "🟢 Online" : "⚫ Offline"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Car size={14} className="text-green-600" />
                  <span className="text-sm text-gray-600">
                    {driver.vehicleType || "Personal Vehicle"}
                  </span>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-800">
                    {driver.avgRating}
                  </span>
                  <span className="text-xs text-gray-400">/ 5.0</span>
                </div>

                <Link
                  to={`/drivers?driver=${encodeURIComponent(driver.name)}&vehicle=${encodeURIComponent(driver.vehicleType || "")}&city=${encodeURIComponent(driver.city || "")}`}
                >
                  <Button
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl"
                    data-ocid={`available_drivers.primary_button.${idx + 1}`}
                  >
                    Book Now
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
          <p className="font-semibold mb-1">🔒 Privacy &amp; Safety</p>
          <p>
            Driver phone numbers and home addresses are kept private. After
            booking, a unique OTP is generated — share it only with your driver
            to start the ride.
          </p>
        </div>
      </div>
    </div>
  );
}
