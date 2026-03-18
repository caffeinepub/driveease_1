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
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { apiSaveBooking } from "../utils/backendApi";
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
    rate: "₹200/hr",
    icon: "⏱️",
  },
  {
    id: "daily",
    label: "Daily",
    desc: "Full day office & city use",
    rate: "₹1,200/day",
    icon: "📅",
  },
  {
    id: "outstation",
    label: "Outstation",
    desc: "Long distance trips",
    rate: "₹2,500/day",
    icon: "🛣️",
  },
];

type DriverData = (typeof seedDrivers)[0];

function lookupDriver(path: string): DriverData | undefined {
  const lastSegment = path.split("/").pop() || "";
  const isRegisteredDriver = lastSegment.startsWith("reg-");
  if (isRegisteredDriver) {
    const regPhone = lastSegment.replace("reg-", "");
    try {
      const regs: Array<{
        id: number;
        name: string;
        phone: string;
        email?: string;
        city: string;
        state: string;
        status: string;
      }> = JSON.parse(localStorage.getItem("driveease_registrations") || "[]");
      const reg = regs.find((r) => r.phone === regPhone);
      if (reg) {
        return {
          id:
            reg.id ||
            Math.abs(
              reg.phone.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
                99999,
            ),
          name: reg.name,
          city: reg.city,
          state: reg.state,
          experienceYears: 2,
          languages: ["Hindi", "English"],
          rating: 4.5,
          pricePerDay: 1200,
          isAvailable: true,
          isVerified: reg.status === "approved",
          trustBadges: ["Background Verified"],
          phone: reg.phone,
          photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(reg.name)}&background=16a34a&color=fff&size=128`,
          vehicleType: "Personal Car / Sedan",
        } as unknown as DriverData;
      }
    } catch {
      /* ignore */
    }
    return undefined;
  }
  const driverId = Number(lastSegment);
  return seedDrivers.find((d) => d.id === driverId);
}

export default function BookingPage() {
  const path = usePath();
  const navigate = useNavigate();
  const { actor } = useActor();
  const driver = lookupDriver(path);
  const lastSegment = path.split("/").pop() || "";
  const regPhone = lastSegment.startsWith("reg-")
    ? lastSegment.replace("reg-", "")
    : "";

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

  // Login gate
  const storedCustomer = localStorage.getItem("otp_customer");
  const customer = storedCustomer ? JSON.parse(storedCustomer) : null;
  const isLoggedIn = !!customer?.loggedIn;

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
      // silently proceed with generated ID
    } finally {
      setLoading(false);
      // Save to local store for admin dashboard
      saveBooking({
        id: generatedId,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        driverName: driver.name,
        driverId: driver.id,
        driverPhone:
          (driver as unknown as { phone?: string }).phone || regPhone || "",
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
      // Also save to backend (fire-and-forget)
      apiSaveBooking({
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        driverName: driver.name,
        driverId: String(driver.id),
        driverPhone:
          (driver as unknown as { phone?: string }).phone || regPhone || "",
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
      // Notify driver about new booking request
      try {
        const requests = JSON.parse(
          localStorage.getItem("driver_booking_requests") || "[]",
        );
        requests.push({
          id: generatedId,
          driverId: driver.id,
          driverPhone:
            (driver as unknown as { phone?: string }).phone || regPhone || "",
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

  // Login required check
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
            Please login to book a driver. Your safety and security is our
            priority.
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
                  Ride insurance (₹99) activated for this trip.
                </p>
              )}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 mb-4">
                <strong>Important:</strong> Please complete payment within 2
                hours to confirm your booking.
              </div>
              {/* Track My Ride Button */}
              <button
                type="button"
                onClick={() => navigate(`/track/${bookingId}`)}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors mb-2"
              >
                <Navigation size={16} />
                Track My Ride on Map
              </button>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                💳 Complete Payment
              </CardTitle>
              <p className="text-sm text-gray-500">
                Total Amount:{" "}
                <span className="font-bold text-green-700">
                  ₹{total.toLocaleString()}
                </span>
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* PhonePe QR */}
              <div className="text-center">
                <p className="font-semibold text-gray-800 mb-3">
                  📱 Scan &amp; Pay via PhonePe / UPI
                </p>
                <img
                  src="/assets/uploads/WhatsApp-Image-2026-03-09-at-5.36.30-PM-1.jpeg"
                  alt="PhonePe QR Code"
                  className="mx-auto rounded-xl border border-gray-200 shadow-sm"
                  style={{ maxWidth: "220px" }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Scan with any UPI app to pay instantly
                </p>
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

              {/* Bank Details */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="font-semibold text-gray-800 text-sm">
                  🏦 Axis Bank Details
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
                ✅ Confirm Payment via WhatsApp
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
            ← Back to Drivers
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Book {driver.name}
          </h1>
          <p className="text-gray-500 text-sm">
            {driver.city}, {driver.state} · ₹{driver.pricePerDay}/day
          </p>
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
                  className={`font-bold text-sm ${bookingType === t.id ? "text-green-700" : "text-gray-700"}`}
                >
                  {t.label}
                </span>
                <span className="text-xs text-gray-500 mt-0.5">{t.desc}</span>
                <span
                  className={`text-xs font-semibold mt-1 ${bookingType === t.id ? "text-green-600" : "text-gray-400"}`}
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
                <Label htmlFor="pickup">Address *</Label>
                <Input
                  id="pickup"
                  value={form.pickupAddress}
                  onChange={(e) =>
                    setForm({ ...form, pickupAddress: e.target.value })
                  }
                  placeholder="Enter or pin on map"
                  className="mt-1"
                  data-ocid="booking.input"
                />
              </div>
              <MapPicker
                label="Pickup Location"
                value={form.pickupAddress}
                lat={pickupLat}
                lng={pickupLng}
                onChange={(addr, lat, lng) => {
                  setPickupLat(lat);
                  setPickupLng(lng);
                  setForm((f) => ({
                    ...f,
                    pickupAddress: addr || f.pickupAddress,
                  }));
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
                <Label htmlFor="drop">Address *</Label>
                <Input
                  id="drop"
                  value={form.dropAddress}
                  onChange={(e) =>
                    setForm({ ...form, dropAddress: e.target.value })
                  }
                  placeholder="Enter or pin on map"
                  className="mt-1"
                  data-ocid="booking.input"
                />
              </div>
              <MapPicker
                label="Drop Location"
                value={form.dropAddress}
                lat={dropLat}
                lng={dropLng}
                onChange={(addr, lat, lng) => {
                  setDropLat(lat);
                  setDropLng(lng);
                  setForm((f) => ({
                    ...f,
                    dropAddress: addr || f.dropAddress,
                  }));
                }}
              />
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
                    Add Ride Insurance — ₹99
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
                    {BOOKING_TYPES.find((t) => t.id === bookingType)?.label} ·{" "}
                    {BOOKING_TYPES.find((t) => t.id === bookingType)?.rate}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>
                    ₹{effectivePrice}/day × {days} days
                  </span>
                  <span>₹{days * effectivePrice}</span>
                </div>
                {form.insurance && (
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Insurance</span>
                    <span>₹99</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 border-t border-green-200 pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-green-700">
                    ₹{total.toLocaleString()}
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
            🚨 <strong>SOS Reminder:</strong> Save emergency numbers —
            Ambulance: 108, Police: 100, Fire: 101
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 text-base"
            data-ocid="booking.submit_button"
          >
            {loading
              ? "Processing..."
              : `Confirm Booking — ₹${total.toLocaleString()}`}
          </Button>
        </form>
      </div>
    </div>
  );
}
