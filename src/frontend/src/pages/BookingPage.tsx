import {
  AlertCircle,
  Calendar,
  CheckCircle,
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
import { saveBooking } from "../utils/localStore";

export default function BookingPage() {
  const path = usePath();
  const navigate = useNavigate();
  const { actor } = useActor();
  const driverId = Number(path.split("/").pop());
  const driver = seedDrivers.find((d) => d.id === driverId);

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
  const total = days * pricePerDay + (form.insurance ? 99 : 0);

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
      setBookingId(generatedId);
    }
  };

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
              <p className="text-gray-500 text-sm mb-4">
                Driver <strong>{driver.name}</strong> will contact you shortly.
              </p>
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
                href={`https://wa.me/919999999999?text=I+have+completed+payment+for+booking+%23${bookingId}`}
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
                  <span>
                    ₹{pricePerDay}/day × {days} days
                  </span>
                  <span>₹{days * pricePerDay}</span>
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
