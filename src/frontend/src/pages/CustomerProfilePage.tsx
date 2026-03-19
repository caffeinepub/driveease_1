import { Car, Edit2, History, LogIn, MapPin, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Link } from "../router";

interface CustomerData {
  name: string;
  phone: string;
  city?: string;
  loggedIn: boolean;
}

interface LocalBooking {
  id: number;
  status: string;
  customerPhone?: string;
  driverName?: string;
  startDate?: string;
  total?: number;
}

function getCustomer(): CustomerData | null {
  try {
    const s = localStorage.getItem("otp_customer");
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

function getBookingCount(phone: string): number {
  try {
    const all: LocalBooking[] = JSON.parse(
      localStorage.getItem("driveease_bookings") || "[]",
    );
    return phone
      ? all.filter((b) => !b.customerPhone || b.customerPhone === phone).length
      : all.length;
  } catch {
    return 0;
  }
}

export default function CustomerProfilePage() {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [city, setCity] = useState("");
  const [editingCity, setEditingCity] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    const c = getCustomer();
    setCustomer(c);
    if (c) {
      const savedCity = c.city || "";
      setCity(savedCity);
      setCityInput(savedCity);
      setBookingCount(getBookingCount(c.phone));
    }
  }, []);

  const handleSaveCity = () => {
    if (!customer) return;
    const updated = { ...customer, city: cityInput };
    localStorage.setItem("otp_customer", JSON.stringify(updated));
    setCustomer(updated);
    setCity(cityInput);
    setEditingCity(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    localStorage.removeItem("otp_customer");
    window.location.hash = "/";
    window.location.reload();
  };

  if (!customer?.loggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-sm w-full shadow-xl border border-gray-100">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn size={28} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Login Required
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Please login to view your profile.
            </p>
            <Button
              asChild
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
              data-ocid="profile.primary_button"
            >
              <Link to="/login">Login to Continue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-3 shadow-lg">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{customer.phone}</p>
          {city && (
            <div className="inline-flex items-center gap-1 mt-2 text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-sm">
              <MapPin size={12} />
              {city}
            </div>
          )}
        </div>

        {/* Booking Count Card */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Car size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Total Bookings
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookingCount}
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-green-200 text-green-700 hover:bg-green-50"
                data-ocid="profile.secondary_button"
              >
                <Link to="/my-bookings">View History</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User size={16} className="text-green-600" />
              Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-gray-500 uppercase tracking-wide">
                Full Name
              </Label>
              <p className="mt-1 font-medium text-gray-900">{customer.name}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500 uppercase tracking-wide">
                <Phone size={10} className="inline mr-1" />
                Phone Number
              </Label>
              <p className="mt-1 font-medium text-gray-900">{customer.phone}</p>
            </div>

            {/* City — editable */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs text-gray-500 uppercase tracking-wide">
                  <MapPin size={10} className="inline mr-1" />
                  Your City
                </Label>
                {!editingCity && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCity(true);
                      setCityInput(city);
                    }}
                    className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                    data-ocid="profile.edit_button"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                )}
              </div>
              {editingCity ? (
                <div className="flex gap-2 mt-1">
                  <Input
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="Enter your city (e.g. Kanpur)"
                    className="flex-1 text-sm"
                    data-ocid="profile.input"
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveCity}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    data-ocid="profile.save_button"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingCity(false)}
                    data-ocid="profile.cancel_button"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <p className="mt-1 font-medium text-gray-900">
                  {city || (
                    <span className="text-gray-400 italic">
                      Not set — click Edit to add your city
                    </span>
                  )}
                </p>
              )}
              {saved && (
                <p
                  className="text-green-600 text-xs mt-1"
                  data-ocid="profile.success_state"
                >
                  ✓ City saved! Live drivers in {city} will now be highlighted
                  for you.
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Setting your city helps you find drivers available near you.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white font-semibold"
              data-ocid="profile.primary_button"
            >
              <Link to="/drivers">Book a Driver</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50"
              data-ocid="profile.secondary_button"
            >
              <Link to="/my-bookings">
                <History size={14} className="mr-2" />
                My Bookings
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
              data-ocid="profile.secondary_button"
            >
              <Link to="/live-drivers">Live Drivers</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
              data-ocid="profile.secondary_button"
            >
              <Link to="/subscriptions">View Plans</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <div className="text-center pb-6">
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-600 underline"
            data-ocid="profile.close_button"
          >
            Logout from this device
          </button>
        </div>
      </div>
    </div>
  );
}
