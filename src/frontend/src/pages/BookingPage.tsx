import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  Copy,
  MapPin,
  Navigation,
  Shield,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import MapPicker from "../components/MapPicker";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { seedDrivers } from "../data/drivers";
import { useActor } from "../hooks/useActor";
import { Link, useNavigate, usePath } from "../router";
import { apiGetRegistrations, apiSaveBooking } from "../utils/backendApi";
import { saveBooking } from "../utils/localStore";

type BookingType = "hourly" | "daily" | "outstation";

const BOOKING_TYPES: {
  id: BookingType;
  label: string;
  desc: string;
  rate: string;
  icon: string;
}[] = [
  {
    id: "hourly",
    label: "Hourly",
    desc: "Short errands & local trips",
    rate: "\u20b9200/hr",
    icon: "\u23f1\ufe0f",
  },
  {
    id: "daily",
    label: "Daily",
    desc: "Full day office & city use",
    rate: "\u20b91,200/day",
    icon: "\ud83d\udcc5",
  },
  {
    id: "outstation",
    label: "Outstation",
    desc: "Long distance trips",
    rate: "\u20b92,500/day",
    icon: "\ud83d\udee3\ufe0f",
  },
];

type DriverData = (typeof seedDrivers)[0];

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.3;
}

interface PricingConfig {
  minFare: number;
  baseCharge: number;
  perKmRate: number;
  nightSurcharge: number;
}

function getPricingConfig(): PricingConfig {
  try {
    const stored = JSON.parse(
      localStorage.getItem("driveease_pricing_config") || "{}",
    );
    return {
      minFare: stored.minFare ?? 99,
      baseCharge: stored.baseCharge ?? 50,
      perKmRate: stored.perKmRate ?? 12,
      nightSurcharge: stored.nightSurcharge ?? 20,
    };
  } catch {
    return { minFare: 99, baseCharge: 50, perKmRate: 12, nightSurcharge: 20 };
  }
}

function calculateFare(
  distanceKm: number,
  config: PricingConfig,
): {
  base: number;
  perKm: number;
  subtotal: number;
  surcharge: number;
  total: number;
  rate: string;
} {
  const hour = new Date().getHours();
  const isNight = hour >= 22 || hour < 6;

  if (distanceKm <= 5) {
    const subtotal = 99;
    const surchargeAmt = isNight
      ? Math.round(subtotal * (config.nightSurcharge / 100))
      : 0;
    const total = Math.max(config.minFare, subtotal + surchargeAmt);
    return {
      base: 99,
      perKm: 0,
      subtotal,
      surcharge: surchargeAmt,
      total,
      rate: "Flat rate (0-5km)",
    };
  }
  let perKmRate: number;
  let rateLabel: string;
  if (distanceKm <= 20) {
    perKmRate = config.perKmRate;
    rateLabel = `\u20b9${config.perKmRate}/km (6-20km)`;
  } else {
    perKmRate = Math.max(10, config.perKmRate - 2);
    rateLabel = `\u20b9${perKmRate}/km (20km+ discount)`;
  }
  const base = config.baseCharge;
  const kmCharge = Math.round(distanceKm * perKmRate);
  const subtotal = base + kmCharge;
  const surchargeAmt = isNight
    ? Math.round(subtotal * (config.nightSurcharge / 100))
    : 0;
  const total = Math.max(config.minFare, subtotal + surchargeAmt);
  return {
    base,
    perKm: kmCharge,
    subtotal,
    surcharge: surchargeAmt,
    total,
    rate: rateLabel,
  };
}

interface RegDriver {
  id: number;
  name: string;
  phone: string;
  city: string;
  state: string;
  status: string;
  vehicleType?: string;
  experience?: string;
  languages?: string;
  workAreas?: string;
}

function lookupRegDriver(regId: string): RegDriver | undefined {
  try {
    const regs: RegDriver[] = JSON.parse(
      localStorage.getItem("driveease_registrations") || "[]",
    );
    // Try by ID first (regId is the registration ID as a string)
    const byId = regs.find((r) => String(r.id) === regId);
    if (byId) return byId;
    // Fallback: try by phone
    return regs.find((r) => r.phone === regId);
  } catch {
    return undefined;
  }
}

function lookupDriver(path: string): DriverData | undefined {
  const lastSegment = path.split("/").pop() || "";
  const isRegisteredDriver = lastSegment.startsWith("reg-");
  if (isRegisteredDriver) {
    const regId = lastSegment.replace("reg-", "");
    const reg = lookupRegDriver(regId);
    if (reg) {
      return {
        id: reg.id,
        name: reg.name,
        city: reg.city,
        state: reg.state,
        experienceYears: 2,
        languages: reg.languages
          ? reg.languages.split(",").map((l) => l.trim())
          : ["Hindi"],
        rating: 4.5,
        pricePerDay: 1200,
        isAvailable: true,
        isVerified: reg.status === "approved",
        trustBadges: ["Background Verified"],
        phone: reg.phone,
        photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(reg.name)}&background=16a34a&color=fff&size=128`,
        vehicleType: reg.vehicleType || "Personal Car / Sedan",
      } as unknown as DriverData;
    }
    return undefined;
  }
  const driverId = Number(lastSegment);
  return seedDrivers.find((d) => d.id === driverId);
}

function getCustomerCity(): string {
  try {
    const s = localStorage.getItem("otp_customer");
    if (!s) return "";
    return JSON.parse(s)?.city || "";
  } catch {
    return "";
  }
}

function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return "****";
  return `****${phone.slice(-4)}`;
}

export default function BookingPage() {
  const path = usePath();
  const navigate = useNavigate();
  const { actor } = useActor();
  const [driver, setDriver] = useState<DriverData | undefined>(() =>
    lookupDriver(path),
  );
  const lastSegment = path.split("/").pop() || "";
  const isRegDriver = lastSegment.startsWith("reg-");
  const regId = isRegDriver ? lastSegment.replace("reg-", "") : "";

  const [bookingType, setBookingType] = useState<BookingType>("daily");
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    pickupAddress: "",
    dropAddress: "",
    startDate: "",
    endDate: "",
    insurance: false,
    savePickup: false,
  });
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [dropLat, setDropLat] = useState<number | null>(null);
  const [dropLng, setDropLng] = useState<number | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<
    Array<{ addressLabel: string; address: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [loadingDriver, setLoadingDriver] = useState(isRegDriver && !driver);

  const storedCustomer = localStorage.getItem("otp_customer");
  const customer = storedCustomer ? JSON.parse(storedCustomer) : null;
  const isLoggedIn = !!customer?.loggedIn;
  const customerCity = getCustomerCity();

  // Pre-fill customer info on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("otp_customer");
      const c = stored ? JSON.parse(stored) : null;
      if (c?.loggedIn) {
        setForm((f) => ({
          ...f,
          customerName: c.name || f.customerName,
          customerPhone: c.phone || f.customerPhone,
        }));
      }
    } catch {
      /* */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If registered driver not found locally, try backend
  useEffect(() => {
    if (!isRegDriver || driver) return;
    setLoadingDriver(true);
    apiGetRegistrations()
      .then((regs) => {
        const found = regs.find(
          (r) => String(r.id) === regId || r.phone === regId,
        );
        if (found) {
          setDriver({
            id: found.id,
            name: found.name,
            city: found.city,
            state: found.state,
            experienceYears: 2,
            languages: found.languages
              ? found.languages.split(",").map((l) => l.trim())
              : ["Hindi"],
            rating: 4.5,
            pricePerDay: 1200,
            isAvailable: true,
            isVerified: found.status === "approved",
            trustBadges: ["Background Verified"],
            phone: found.phone,
            photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(found.name)}&background=16a34a&color=fff&size=128`,
            vehicleType: found.vehicleType || "Personal Car / Sedan",
          } as unknown as DriverData);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingDriver(false));
  }, [isRegDriver, driver, regId]);

  useEffect(() => {
    if (actor) {
      actor
        .getSavedAddresses()
        .then((addrs) =>
          setSavedAddresses(
            addrs.map((a) => ({
              addressLabel: a.addressLabel,
              address: a.address,
            })),
          ),
        )
        .catch(() => {});
    }
  }, [actor]);

  const fareEstimate = useMemo(() => {
    if (
      pickupLat === null ||
      pickupLng === null ||
      dropLat === null ||
      dropLng === null
    ) {
      return null;
    }
    const distKm = haversineKm(pickupLat, pickupLng, dropLat, dropLng);
    const config = getPricingConfig();
    return { ...calculateFare(distKm, config), distKm };
  }, [pickupLat, pickupLng, dropLat, dropLng]);

  const getDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    const diff =
      (new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) /
      (1000 * 60 * 60 * 24);
    return Math.max(1, Math.ceil(diff) + 1);
  };

  const days = getDays();
  const pricePerDay = driver?.pricePerDay ?? 0;
  const typeMultiplier =
    bookingType === "outstation"
      ? 2500 / 1200
      : bookingType === "hourly"
        ? 200 / 1200
        : 1;
  const effectivePrice =
    bookingType === "daily"
      ? pricePerDay
      : Math.round(pricePerDay * typeMultiplier);
  const total = days * effectivePrice + (form.insurance ? 99 : 0);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driver) return;
    setError("");
    if (
      !form.customerName ||
      !form.customerPhone ||
      !form.pickupAddress ||
      !form.dropAddress ||
      !form.startDate ||
      !form.endDate
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    const generatedId = Math.floor(10000 + Math.random() * 90000);
    const driverPhone = (driver as unknown as { phone?: string }).phone || "";
    try {
      if (actor) {
        const startTs = BigInt(new Date(form.startDate).getTime());
        const endTs = BigInt(new Date(form.endDate).getTime());
        await actor.createBooking(
          BigInt(driver.id),
          form.customerName,
          form.customerPhone,
          form.customerEmail,
          form.pickupAddress,
          form.dropAddress,
          startTs,
          endTs,
          BigInt(days),
          BigInt(total),
          form.insurance,
        );
        if (form.savePickup && form.pickupAddress) {
          await actor.saveAddress("Home", form.pickupAddress).catch(() => {});
        }
      }
    } catch {
      // silently proceed
    } finally {
      setLoading(false);
      saveBooking({
        id: generatedId,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        driverName: driver.name,
        driverId: driver.id,
        driverPhone,
        pickupAddress: form.pickupAddress,
        dropAddress: form.dropAddress,
        pickupLat: pickupLat ?? undefined,
        pickupLng: pickupLng ?? undefined,
        dropLat: dropLat ?? undefined,
        dropLng: dropLng ?? undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        days,
        total,
        insurance: form.insurance,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      apiSaveBooking({
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        driverName: driver.name,
        driverId: String(driver.id),
        driverPhone,
        pickupAddress: form.pickupAddress,
        dropAddress: form.dropAddress,
        startDate: form.startDate,
        endDate: form.endDate,
        days,
        total,
        insurance: form.insurance,
        status: "pending",
        createdAt: new Date().toISOString(),
      }).catch(() => {});
      setBookingId(generatedId);
      try {
        const requests = JSON.parse(
          localStorage.getItem("driver_booking_requests") || "[]",
        );
        requests.push({
          id: generatedId,
          driverId: driver.id,
          driverPhone,
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          pickup: form.pickupAddress,
          drop: form.dropAddress,
          amount: total,
          bookingType,
          status: "pending",
          timestamp: Date.now(),
        });
        localStorage.setItem(
          "driver_booking_requests",
          JSON.stringify(requests),
        );
      } catch {
        // ignore
      }
    }
  };

  const driverPhone = driver
    ? (driver as unknown as { phone?: string }).phone || ""
    : "";
  const driverVehicle = driver
    ? (driver as unknown as { vehicleType?: string }).vehicleType || ""
    : "";
  const isSameCityDriver =
    customerCity &&
    driver &&
    driver.city.toLowerCase() === customerCity.toLowerCase();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center border border-gray-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Login Required
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Please login to book a driver.
          </p>
          <div className="space-y-3">
            <a
              href="#/login"
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
              data-ocid="booking_gate.primary_button"
            >
              Login to Continue
            </a>
            <a
              href="#/"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors"
              data-ocid="booking_gate.secondary_button"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loadingDriver) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading driver details...</p>
        </div>
      </div>
    );
  }

  if (!driver)
    return (
      <div className="text-center py-20 text-gray-500">
        Driver not found.{" "}
        <button
          type="button"
          onClick={() => navigate("/drivers")}
          className="text-green-600 underline"
        >
          Browse drivers
        </button>
      </div>
    );

  if (bookingId !== null)
    return (
      <div className="min-h-screen bg-green-50 py-10 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          <Card className="shadow-lg text-center">
            <CardContent className="pt-8 pb-6">
              <CheckCircle className="text-green-600 mx-auto mb-4" size={56} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </h2>
              <p className="text-gray-600 mb-1">
                Your Booking ID is{" "}
                <span className="font-bold text-green-700">#{bookingId}</span>
              </p>
              <p className="text-gray-500 text-sm mb-2">
                Driver <strong>{driver.name}</strong> will contact you shortly.
              </p>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
                {bookingType === "hourly" ? (
                  <Clock size={14} />
                ) : bookingType === "outstation" ? (
                  <Car size={14} />
                ) : (
                  <Calendar size={14} />
                )}
                {BOOKING_TYPES.find((t) => t.id === bookingType)?.label} Booking
              </div>
              {form.insurance && (
                <p className="text-sm text-green-600 mb-4">
                  Ride insurance (\u20b999) activated for this trip.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Driver Details Section */}
          <Card className="shadow-md border border-green-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Car size={16} className="text-green-600" />
                Your Driver Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center text-xl font-bold shadow">
                  {driver.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    {driver.name}
                  </p>
                  {driver.isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                      <CheckCircle size={10} /> Verified Driver
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                  <p className="font-semibold text-gray-800">
                    {maskPhone(driverPhone)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">City</p>
                  <p className="font-semibold text-gray-800 flex items-center gap-1">
                    <MapPin size={11} className="text-green-600" />
                    {driver.city}
                  </p>
                </div>
                {driverVehicle && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Vehicle</p>
                    <p className="font-semibold text-gray-800">
                      {driverVehicle}
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Experience</p>
                  <p className="font-semibold text-gray-800">
                    {driver.experienceYears}+ years
                  </p>
                </div>
              </div>
              {isSameCityDriver && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle size={14} />
                  Local Driver — same city as you ({customerCity})
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trip Summary */}
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="pt-4 pb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pickup</span>
                  <span className="font-medium text-right max-w-[60%]">
                    {form.pickupAddress}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Drop</span>
                  <span className="font-medium text-right max-w-[60%]">
                    {form.dropAddress}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 mt-1">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-green-700">
                    \u20b9{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Receipt */}
          <button
            type="button"
            onClick={() => {
              const insuranceAmount = form.insurance ? 99 : 0;
              const baseFare = total - insuranceAmount;
              const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Receipt - DriveEase #${bookingId}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#1a1a1a}.header{background:#14532d;color:white;padding:24px;border-radius:8px;margin-bottom:24px}.logo{font-size:24px;font-weight:900}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px}.label{color:#6b7280}.value{font-weight:600}.total-row{border-top:2px solid #14532d;padding-top:12px;font-size:16px;font-weight:700;display:flex;justify-content:space-between}.footer{text-align:center;margin-top:32px;color:#6b7280;font-size:12px;border-top:1px solid #e5e7eb;padding-top:16px}</style></head><body><div class="header"><div class="logo">DriveEase</div><div style="font-size:13px;opacity:0.8;margin-top:4px">Personal Driver Network — Booking Receipt</div><div style="font-size:17px;font-weight:700;margin-top:6px">Booking ID: #${bookingId}</div></div><div class="row"><span class="label">Customer</span><span class="value">${form.customerName}</span></div><div class="row"><span class="label">Phone</span><span class="value">${form.customerPhone}</span></div><div class="row"><span class="label">Driver</span><span class="value">${driver.name}</span></div><div class="row"><span class="label">Driver Phone</span><span class="value">${maskPhone(driverPhone)}</span></div>${driverVehicle ? `<div class="row"><span class="label">Vehicle</span><span class="value">${driverVehicle}</span></div>` : ""}<div class="row"><span class="label">City</span><span class="value">${driver.city}</span></div><div class="row"><span class="label">Pickup</span><span class="value">${form.pickupAddress}</span></div><div class="row"><span class="label">Drop</span><span class="value">${form.dropAddress}</span></div><div class="row"><span class="label">Start Date</span><span class="value">${form.startDate}</span></div><div class="row"><span class="label">End Date</span><span class="value">${form.endDate}</span></div><div class="row"><span class="label">Booking Type</span><span class="value">${bookingType}</span></div><div class="row"><span class="label">Base Fare</span><span class="value">₹${baseFare.toLocaleString("en-IN")}</span></div>${insuranceAmount > 0 ? `<div class="row"><span class="label">Insurance</span><span class="value">₹99</span></div>` : ""}<div class="total-row"><span>Total Amount</span><span style="color:#14532d">₹${total.toLocaleString("en-IN")}</span></div><div class="footer"><p>Thank you for choosing DriveEase<br/>For support: +91-7836887228</p></div><script>window.onload=function(){window.print()}<\/script></body></html>`;
              const blob = new Blob([html], { type: "text/html" });
              const url = URL.createObjectURL(blob);
              const w = window.open(url, "_blank");
              if (w) w.onafterprint = () => URL.revokeObjectURL(url);
            }}
            className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
            data-ocid="booking.primary_button"
          >
            \ud83d\udcf2 Download Receipt / Invoice
          </button>

          <button
            type="button"
            onClick={() => navigate(`/track/${bookingId}`)}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            <Navigation size={16} />
            Track My Ride on Map
          </button>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                \ud83d\udcb3 Complete Payment
              </CardTitle>
              <p className="text-sm text-gray-500">
                Total Amount:{" "}
                <span className="font-bold text-green-700">
                  \u20b9{total.toLocaleString()}
                </span>
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <strong>Important:</strong> Please complete payment within 2
                hours to confirm your booking.
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800 mb-3">
                  \ud83d\udcf1 Scan &amp; Pay via PhonePe / UPI
                </p>
                <img
                  src="/assets/uploads/WhatsApp-Image-2026-03-09-at-5.36.30-PM-1.jpeg"
                  alt="PhonePe QR Code"
                  className="mx-auto rounded-xl border border-gray-200 shadow-sm"
                  style={{ maxWidth: "220px" }}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-400">
                    or pay via bank transfer
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="font-semibold text-gray-800 text-sm">
                  \ud83c\udfe6 Axis Bank Details
                </p>
                {[
                  {
                    label: "Account Name",
                    value: "KRISHNA KANT PANDEY",
                    key: "name",
                  },
                  {
                    label: "Account Number",
                    value: "922010062230782",
                    key: "ac",
                  },
                  { label: "IFSC Code", value: "UTIB0004620", key: "ifsc" },
                  { label: "Bank", value: "Axis Bank", key: "bank" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {item.value}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText(item.value, item.key)}
                      className="ml-2 text-green-600 hover:text-green-800 transition-colors"
                    >
                      {copied === item.key ? (
                        <CheckCircle size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              <a
                href={`https://wa.me/917836887228?text=I+have+completed+payment+for+booking+%23${bookingId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                \u2705 Confirm Payment via WhatsApp
              </a>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/drivers")}
            >
              Browse More Drivers
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-500 text-white"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            to="/drivers"
            className="text-green-600 hover:underline text-sm"
          >
            \u2190 Back to Drivers
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Book {driver.name}
          </h1>
          <p className="text-gray-500 text-sm">
            {driver.city}, {driver.state} \u00b7 \u20b9{driver.pricePerDay}/day
          </p>
          {isSameCityDriver && (
            <div className="inline-flex items-center gap-1.5 mt-2 bg-green-50 border border-green-200 text-green-700 rounded-full px-3 py-1 text-sm">
              <CheckCircle size={12} />
              Local Driver — same city as you ({customerCity})
            </div>
          )}
        </div>

        {/* Booking Type Selector */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Select Booking Type
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {BOOKING_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setBookingType(t.id)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center ${
                  bookingType === t.id
                    ? "border-green-600 bg-green-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-green-300"
                }`}
                data-ocid={`booking.toggle.${t.id}`}
              >
                <span className="text-2xl mb-1">{t.icon}</span>
                <span
                  className={`font-bold text-sm ${
                    bookingType === t.id ? "text-green-700" : "text-gray-700"
                  }`}
                >
                  {t.label}
                </span>
                <span className="text-xs text-gray-500 mt-0.5">{t.desc}</span>
                <span
                  className={`text-xs font-semibold mt-1 ${
                    bookingType === t.id ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {t.rate}
                </span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cname">Full Name *</Label>
                  <Input
                    id="cname"
                    value={form.customerName}
                    onChange={(e) =>
                      setForm({ ...form, customerName: e.target.value })
                    }
                    placeholder="Your full name"
                    className="mt-1"
                    data-ocid="booking.input"
                  />
                </div>
                <div>
                  <Label htmlFor="cphone">Phone *</Label>
                  <Input
                    id="cphone"
                    value={form.customerPhone}
                    onChange={(e) =>
                      setForm({ ...form, customerPhone: e.target.value })
                    }
                    placeholder="10-digit mobile"
                    maxLength={10}
                    className="mt-1"
                    data-ocid="booking.input"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cemail">Email (optional)</Label>
                <Input
                  id="cemail"
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) =>
                    setForm({ ...form, customerEmail: e.target.value })
                  }
                  placeholder="your@email.com"
                  className="mt-1"
                  data-ocid="booking.input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pickup Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin size={16} className="text-green-600" /> Pickup Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {savedAddresses.length > 0 && (
                <div>
                  <Label>Use Saved Address</Label>
                  <Select
                    onValueChange={(v) =>
                      setForm({ ...form, pickupAddress: v })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select saved address" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedAddresses.map((a) => (
                        <SelectItem key={a.addressLabel} value={a.address}>
                          {a.addressLabel}: {a.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="pickup">Type Address Manually *</Label>
                <Input
                  id="pickup"
                  value={form.pickupAddress}
                  onChange={(e) =>
                    setForm({ ...form, pickupAddress: e.target.value })
                  }
                  placeholder="Enter pickup address or pin on map below"
                  className="mt-1"
                  data-ocid="booking.input"
                />
              </div>
              <p className="text-xs text-gray-400">
                Or click on the map to set pickup location:
              </p>
              <MapPicker
                label="Pickup Location"
                value={form.pickupAddress}
                lat={pickupLat}
                lng={pickupLng}
                onChange={(addr, lat, lng) => {
                  setPickupLat(lat);
                  setPickupLng(lng);
                  if (addr) {
                    setForm((f) => ({ ...f, pickupAddress: addr }));
                  }
                }}
              />
              <div className="flex items-center gap-2 mt-2">
                <Checkbox
                  id="save-pickup"
                  checked={form.savePickup}
                  onCheckedChange={(v) => setForm({ ...form, savePickup: !!v })}
                  data-ocid="booking.checkbox"
                />
                <Label htmlFor="save-pickup" className="text-sm cursor-pointer">
                  Save as home address
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Drop Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin size={16} className="text-red-500" /> Drop Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="drop">Type Address Manually *</Label>
                <Input
                  id="drop"
                  value={form.dropAddress}
                  onChange={(e) =>
                    setForm({ ...form, dropAddress: e.target.value })
                  }
                  placeholder="Enter drop address or pin on map below"
                  className="mt-1"
                  data-ocid="booking.input"
                />
              </div>
              <p className="text-xs text-gray-400">
                Or click on the map to set drop location:
              </p>
              <MapPicker
                label="Drop Location"
                value={form.dropAddress}
                lat={dropLat}
                lng={dropLng}
                onChange={(addr, lat, lng) => {
                  setDropLat(lat);
                  setDropLng(lng);
                  if (addr) {
                    setForm((f) => ({ ...f, dropAddress: addr }));
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Fare Estimator */}
          <Card className="border-2 border-dashed border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap size={16} className="text-green-600" />
                Fare Estimate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fareEstimate ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Distance (road)</span>
                    <span className="font-medium">
                      {fareEstimate.distKm.toFixed(1)} km
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rate</span>
                    <span className="font-medium">{fareEstimate.rate}</span>
                  </div>
                  {fareEstimate.base > 0 && fareEstimate.perKm > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Base + per-km</span>
                      <span className="font-medium">
                        \u20b9{fareEstimate.base} + \u20b9{fareEstimate.perKm}
                      </span>
                    </div>
                  )}
                  {fareEstimate.surcharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-700">
                        \ud83c\udf19 Night surcharge
                      </span>
                      <span className="font-medium text-amber-700">
                        +\u20b9{fareEstimate.surcharge}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base border-t border-green-200 pt-2 mt-1">
                    <span className="text-green-800">Estimated Fare</span>
                    <span className="text-green-700 text-lg">
                      \u20b9{fareEstimate.total}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    * Estimate based on road distance. Final amount may vary.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-2">
                  Pin both pickup and drop locations on the map to see fare
                  estimate
                </p>
              )}
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar size={16} className="text-green-600" /> Booking Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start">Start Date *</Label>
                <Input
                  id="start"
                  type="date"
                  value={form.startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  className="mt-1"
                  data-ocid="booking.input"
                />
              </div>
              <div>
                <Label htmlFor="end">End Date *</Label>
                <Input
                  id="end"
                  type="date"
                  value={form.endDate}
                  min={form.startDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                  className="mt-1"
                  data-ocid="booking.input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Insurance */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="insurance"
                  checked={form.insurance}
                  onCheckedChange={(v) => setForm({ ...form, insurance: !!v })}
                  className="mt-0.5"
                  data-ocid="booking.checkbox"
                />
                <div>
                  <Label
                    htmlFor="insurance"
                    className="cursor-pointer font-medium"
                  >
                    <Shield size={14} className="inline text-green-600 mr-1" />
                    Add Ride Insurance \u2014 \u20b999
                  </Label>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Covers accidents, cancellations, and medical emergencies
                    during the trip.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {days > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span className="font-medium text-green-800">
                    {BOOKING_TYPES.find((t) => t.id === bookingType)?.label}{" "}
                    \u00b7{" "}
                    {BOOKING_TYPES.find((t) => t.id === bookingType)?.rate}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>
                    \u20b9{effectivePrice}/day \u00d7 {days} days
                  </span>
                  <span>\u20b9{days * effectivePrice}</span>
                </div>
                {form.insurance && (
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Insurance</span>
                    <span>\u20b999</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 border-t border-green-200 pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-green-700">
                    \u20b9{total.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <div
              className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
              data-ocid="booking.error_state"
            >
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            \ud83d\udea8 <strong>SOS Reminder:</strong> Save emergency numbers
            \u2014 Ambulance: 108, Police: 100, Fire: 101
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 text-base"
            data-ocid="booking.submit_button"
          >
            {loading
              ? "Processing..."
              : `Confirm Booking \u2014 \u20b9${total.toLocaleString()}`}
          </Button>
        </form>
      </div>
    </div>
  );
}
