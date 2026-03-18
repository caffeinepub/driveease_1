import {
  AlertCircle,
  BadgeCheck,
  Bell,
  Car,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  IndianRupee,
  LogOut,
  Navigation,
  Phone,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";
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
import { Link, useNavigate } from "../router";
import { apiSetDriverOnlineStatus } from "../utils/backendApi";

interface DriverSession {
  driverId: number;
  name: string;
  phone: string;
  city: string;
  pricePerDay: number;
  registeredAt: string;
}

interface BookingRequest {
  id: number;
  driverId: number;
  customerName: string;
  customerPhone: string;
  pickup: string;
  drop: string;
  amount: number;
  bookingType: string;
  status: string;
  timestamp: number;
}

interface LocalBooking {
  id: number;
  driverId: number;
  driverName: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  dropAddress: string;
  startDate: string;
  endDate: string;
  days: number;
  total: number;
  status: string;
  createdAt: string;
  insurance: boolean;
}

function getDriverSession(): DriverSession | null {
  try {
    const s = localStorage.getItem("driver_session");
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

function getBookingRequests(
  driverId: number,
  driverPhone?: string,
): BookingRequest[] {
  try {
    const all: Array<BookingRequest & { driverPhone?: string }> = JSON.parse(
      localStorage.getItem("driver_booking_requests") || "[]",
    );
    return all.filter((r) => {
      const matchesId = r.driverId === driverId;
      const matchesPhone = driverPhone && r.driverPhone === driverPhone;
      return (matchesId || matchesPhone) && r.status === "pending";
    });
  } catch {
    return [];
  }
}

function getDriverBookings(driverName: string): LocalBooking[] {
  try {
    const all: LocalBooking[] = JSON.parse(
      localStorage.getItem("driveease_bookings") || "[]",
    );
    return all.filter((b) => b.driverName === driverName);
  } catch {
    return [];
  }
}

export default function DriverLoginPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<DriverSession | null>(
    getDriverSession(),
  );

  // Login state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Dashboard state
  const [isOnline, setIsOnline] = useState(false);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [driverBookings, setDriverBookings] = useState<LocalBooking[]>([]);
  const [withdrawMode, setWithdrawMode] = useState<"bank" | "upi">("upi");
  const [accountNumber, setAccountNumber] = useState("");
  const [upiId, setUpiId] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [withdrawStatus, setWithdrawStatus] = useState("");
  const [withdrawError, setWithdrawError] = useState("");

  useEffect(() => {
    if (session) {
      setBookingRequests(getBookingRequests(session.driverId, session.phone));
      setDriverBookings(getDriverBookings(session.name));
    }
  }, [session]);

  // Poll for new booking requests every 5s
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      setBookingRequests(getBookingRequests(session.driverId, session.phone));
      setDriverBookings(getDriverBookings(session.name));
    }, 5000);
    return () => clearInterval(interval);
  }, [session]);

  const sendOtp = () => {
    if (!phone || phone.length < 10) {
      setLoginError("Please enter a valid 10-digit phone number.");
      return;
    }
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(code);
    setOtpSent(true);
    setLoginError("");
  };

  const verifyOtp = () => {
    if (otp !== generatedOtp) {
      setLoginError("Invalid OTP. Please try again.");
      return;
    }
    // Check if driver exists
    try {
      const driversData: Array<{
        id: number;
        name: string;
        phone: string;
        city: string;
        pricePerDay: number;
        registeredAt: string;
      }> = JSON.parse(localStorage.getItem("drivers_data") || "[]");
      const found = driversData.find(
        (d) =>
          d.phone === phone ||
          d.phone === `+91${phone}` ||
          d.phone === `91${phone}`,
      );
      if (!found) {
        // Also try from registered drivers
        const regDrivers = JSON.parse(
          localStorage.getItem("driveease_registrations") || "[]",
        );
        const foundReg = regDrivers.find(
          (d: { phone: string; name: string; city: string }) =>
            d.phone === phone,
        );
        if (!foundReg) {
          setLoginError("Not a registered driver. Please register first.");
          return;
        }
        const sess: DriverSession = {
          driverId: Math.floor(Math.random() * 10000),
          name: foundReg.name || "Driver",
          phone: foundReg.phone,
          city: foundReg.city || "Delhi",
          pricePerDay: 1200,
          registeredAt: foundReg.createdAt || new Date().toISOString(),
        };
        localStorage.setItem("driver_session", JSON.stringify(sess));
        setSession(sess);
        return;
      }
      const sess: DriverSession = {
        driverId: found.id,
        name: found.name,
        phone: found.phone,
        city: found.city,
        pricePerDay: found.pricePerDay,
        registeredAt: found.registeredAt,
      };
      localStorage.setItem("driver_session", JSON.stringify(sess));
      setSession(sess);
    } catch {
      setLoginError("Login failed. Please try again.");
    }
  };

  const toggleOnlineStatus = () => {
    if (!session) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    // Save driver status & activity log
    try {
      const driverStatus = JSON.parse(
        localStorage.getItem("driveease_driver_status") || "{}",
      );
      driverStatus[String(session.driverId)] = newStatus ? "online" : "offline";
      driverStatus[session.phone ?? ""] = newStatus ? "online" : "offline";
      localStorage.setItem(
        "driveease_driver_status",
        JSON.stringify(driverStatus),
      );

      const activityKey = `driveease_driver_activity_${session.driverId}`;
      const activity = JSON.parse(localStorage.getItem(activityKey) || "[]");
      activity.push({
        status: newStatus ? "online" : "offline",
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(activityKey, JSON.stringify(activity));

      if (newStatus) {
        localStorage.setItem(
          `driveease_driver_online_since_${session.driverId}`,
          new Date().toISOString(),
        );
      } else {
        localStorage.removeItem(
          `driveease_driver_online_since_${session.driverId}`,
        );
      }
    } catch {
      /* ignore */
    }
    // Also sync status to backend
    apiSetDriverOnlineStatus({
      phone: session.phone ?? "",
      name: session.name,
      city: session.city,
      driverId: String(session.driverId),
      status: newStatus ? "online" : "offline",
      lastUpdated: new Date().toISOString(),
    }).catch(() => {});
    try {
      const locations: unknown[] = JSON.parse(
        localStorage.getItem("driver_locations") || "[]",
      );
      const filtered = (
        locations as Array<{
          driverId: number;
          name?: string;
          city?: string;
          lat?: number;
          lng?: number;
          status?: string;
          timestamp?: number;
        }>
      ).filter((l) => l.driverId !== session.driverId);
      if (newStatus) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            filtered.push({
              driverId: session.driverId,
              name: session.name,
              city: session.city,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              status: "online",
              timestamp: Date.now(),
            });
            localStorage.setItem("driver_locations", JSON.stringify(filtered));
          },
          () => {
            // Use Delhi coords as fallback
            filtered.push({
              driverId: session.driverId,
              name: session.name,
              city: session.city,
              lat: 28.6139,
              lng: 77.209,
              status: "online",
              timestamp: Date.now(),
            });
            localStorage.setItem("driver_locations", JSON.stringify(filtered));
          },
        );
      } else {
        filtered.push({
          driverId: session.driverId,
          name: session.name,
          city: session.city,
          lat: 28.6139,
          lng: 77.209,
          status: "offline",
          timestamp: Date.now(),
        });
        localStorage.setItem("driver_locations", JSON.stringify(filtered));
      }
    } catch {
      // ignore
    }
  };

  const handleAcceptRequest = (req: BookingRequest) => {
    try {
      // Update booking status
      const bookings: LocalBooking[] = JSON.parse(
        localStorage.getItem("driveease_bookings") || "[]",
      );
      const updated = bookings.map((b) =>
        b.id === req.id ? { ...b, status: "confirmed" } : b,
      );
      localStorage.setItem("driveease_bookings", JSON.stringify(updated));

      // Remove from pending requests
      const allRequests: BookingRequest[] = JSON.parse(
        localStorage.getItem("driver_booking_requests") || "[]",
      );
      const updatedReqs = allRequests.map((r) =>
        r.id === req.id ? { ...r, status: "confirmed" } : r,
      );
      localStorage.setItem(
        "driver_booking_requests",
        JSON.stringify(updatedReqs),
      );

      // Add customer notification
      const notifications = JSON.parse(
        localStorage.getItem("booking_notifications") || "[]",
      );
      notifications.push({
        bookingId: req.id,
        message: "Your booking has been confirmed!",
        read: false,
        timestamp: Date.now(),
      });
      localStorage.setItem(
        "booking_notifications",
        JSON.stringify(notifications),
      );

      // Refresh
      if (session)
        setBookingRequests(getBookingRequests(session.driverId, session.phone));
    } catch {
      // ignore
    }
  };

  const handleRejectRequest = (req: BookingRequest) => {
    try {
      const bookings: LocalBooking[] = JSON.parse(
        localStorage.getItem("driveease_bookings") || "[]",
      );
      const updated = bookings.map((b) =>
        b.id === req.id ? { ...b, status: "rejected" } : b,
      );
      localStorage.setItem("driveease_bookings", JSON.stringify(updated));

      const allRequests: BookingRequest[] = JSON.parse(
        localStorage.getItem("driver_booking_requests") || "[]",
      );
      const updatedReqs = allRequests.map((r) =>
        r.id === req.id ? { ...r, status: "rejected" } : r,
      );
      localStorage.setItem(
        "driver_booking_requests",
        JSON.stringify(updatedReqs),
      );

      const notifications = JSON.parse(
        localStorage.getItem("booking_notifications") || "[]",
      );
      notifications.push({
        bookingId: req.id,
        message:
          "Your booking was not accepted. Please try booking another driver.",
        read: false,
        timestamp: Date.now(),
      });
      localStorage.setItem(
        "booking_notifications",
        JSON.stringify(notifications),
      );

      if (session)
        setBookingRequests(getBookingRequests(session.driverId, session.phone));
    } catch {
      // ignore
    }
  };

  const handleWithdraw = () => {
    if (!session) return;
    setWithdrawError("");
    setWithdrawStatus("");
    const enteredName = accountHolder.trim().toLowerCase();
    const registeredName = session.name.trim().toLowerCase();
    if (enteredName !== registeredName) {
      setWithdrawError(
        `Account holder name must match your registered name: ${session.name}`,
      );
      return;
    }
    if (withdrawMode === "bank" && !accountNumber) {
      setWithdrawError("Please enter your bank account number.");
      return;
    }
    if (withdrawMode === "upi" && !upiId) {
      setWithdrawError("Please enter your UPI ID.");
      return;
    }
    const grossEarnings = driverBookings
      .filter((b) => b.status === "confirmed")
      .reduce((sum, b) => sum + b.total, 0);
    const commission = Math.round(grossEarnings * 0.18);
    const netPayout = grossEarnings - commission;

    const withdrawalRequests = JSON.parse(
      localStorage.getItem("withdrawal_requests") || "[]",
    );
    withdrawalRequests.push({
      driverId: session.driverId,
      driverName: session.name,
      amount: netPayout,
      mode: withdrawMode,
      accountDetails: withdrawMode === "bank" ? accountNumber : upiId,
      requestedAt: new Date().toISOString(),
      status: "pending",
    });
    localStorage.setItem(
      "withdrawal_requests",
      JSON.stringify(withdrawalRequests),
    );
    setWithdrawStatus(
      `Withdrawal of ₹${netPayout.toLocaleString("en-IN")} requested successfully. Will be processed within 24 hours.`,
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("driver_session");
    setSession(null);
    setIsOnline(false);
    navigate("/");
  };

  // ── Login Screen ──────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
              <Car size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Drive<span className="text-green-400">Ease</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1 font-medium">
              Driver Portal
            </p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="text-xs text-gray-500">Ola Partner</span>
              <span className="text-gray-700">·</span>
              <span className="text-xs text-gray-500">Rapido Captain</span>
              <span className="text-gray-700">·</span>
              <span className="text-xs text-gray-500">Taxi Driver</span>
            </div>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg">
                Captain Login
              </CardTitle>
              <p className="text-gray-400 text-sm">
                Login with your registered mobile number
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {loginError && (
                <div
                  className="flex items-center gap-2 text-red-400 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2 text-sm"
                  data-ocid="driver_login.error_state"
                >
                  <AlertCircle size={14} />
                  {loginError}
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Mobile Number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg px-3">
                    <Phone size={14} className="text-gray-400 mr-1" />
                    <span className="text-gray-400 text-sm">+91</span>
                  </div>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 flex-1"
                    maxLength={10}
                    data-ocid="driver_login.input"
                  />
                </div>
              </div>

              {!otpSent ? (
                <Button
                  onClick={sendOtp}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold"
                  data-ocid="driver_login.submit_button"
                >
                  Send OTP
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-900/30 border border-green-700/50 rounded-lg px-3 py-2 text-center">
                    <p className="text-green-400 text-xs font-medium">
                      Demo OTP (for testing)
                    </p>
                    <p className="text-green-300 text-2xl font-bold tracking-widest mt-0.5">
                      {generatedOtp}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-300 text-sm">Enter OTP</Label>
                    <Input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="4-digit OTP"
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-center text-xl tracking-widest"
                      maxLength={4}
                      data-ocid="driver_login.otp_input"
                    />
                  </div>
                  <Button
                    onClick={verifyOtp}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold"
                    data-ocid="driver_login.confirm_button"
                  >
                    Verify & Login
                  </Button>
                </div>
              )}

              <div className="text-center pt-2">
                <p className="text-gray-400 text-sm">
                  Not registered?{" "}
                  <Link
                    to="/register-driver"
                    className="text-green-400 hover:underline"
                    data-ocid="driver_login.link"
                  >
                    Register as Driver
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-gray-600 mt-6">
            © {new Date().getFullYear()} DriveEase Driver Portal
          </p>
        </div>
      </div>
    );
  }

  // ── Driver Dashboard ──────────────────────────────────────────────────────
  const confirmedBookings = driverBookings.filter(
    (b) => b.status === "confirmed",
  );
  const grossEarnings = confirmedBookings.reduce((sum, b) => sum + b.total, 0);
  const commission = Math.round(grossEarnings * 0.18);
  const netPayout = grossEarnings - commission;
  const totalTrips = confirmedBookings.length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">{session.name}</h2>
              <div className="flex items-center gap-2">
                <Navigation size={12} className="text-gray-400" />
                <span className="text-gray-400 text-sm">{session.city}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Online/Offline toggle */}
            <button
              type="button"
              onClick={toggleOnlineStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                isOnline
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
              data-ocid="driver_dashboard.toggle"
            >
              <span
                className={`w-2 h-2 rounded-full ${isOnline ? "bg-white" : "bg-gray-500"}`}
              />
              {isOnline ? "Online" : "Go Online"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition-colors"
              data-ocid="driver_dashboard.button"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Earnings Card */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <TrendingUp size={18} className="text-green-400" />
              This Month's Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-gray-400 text-xs mb-1">Total Trips</p>
                <p className="text-white text-2xl font-bold">{totalTrips}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-gray-400 text-xs mb-1">Gross</p>
                <p className="text-white text-xl font-bold">
                  ₹{grossEarnings.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-green-900/50 border border-green-700/50 rounded-xl p-3 text-center">
                <p className="text-green-400 text-xs mb-1">Your Earnings</p>
                <p className="text-green-300 text-xl font-bold">
                  ₹{netPayout.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg px-4 py-2.5 flex items-center justify-between text-sm">
              <span className="text-gray-400">
                Gross: ₹{grossEarnings.toLocaleString("en-IN")}
              </span>
              <span className="text-orange-400">
                Commission (18%): ₹{commission.toLocaleString("en-IN")}
              </span>
              <span className="text-green-400 font-semibold">
                Your: ₹{netPayout.toLocaleString("en-IN")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Booking Notifications */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Bell size={18} className="text-yellow-400" />
              New Booking Requests
              {bookingRequests.length > 0 && (
                <Badge className="bg-red-600 text-white text-xs ml-1">
                  {bookingRequests.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingRequests.length === 0 ? (
              <div
                className="text-center py-6"
                data-ocid="driver_requests.empty_state"
              >
                <Clock size={32} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  No pending booking requests
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  Go online to start receiving bookings
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookingRequests.map((req, idx) => (
                  <div
                    key={req.id}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-4"
                    data-ocid={`driver_requests.item.${idx + 1}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-semibold">
                          {req.customerName}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {req.customerPhone}
                        </p>
                      </div>
                      <Badge className="bg-green-700 text-white text-xs">
                        ₹{req.amount.toLocaleString("en-IN")}
                      </Badge>
                    </div>
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                        <p className="text-gray-300 text-sm">{req.pickup}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                        <p className="text-gray-300 text-sm">{req.drop}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAcceptRequest(req)}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm"
                        data-ocid={`driver_requests.confirm_button.${idx + 1}`}
                      >
                        <CheckCircle size={14} className="mr-1.5" /> Accept
                      </Button>
                      <Button
                        onClick={() => handleRejectRequest(req)}
                        variant="outline"
                        className="flex-1 border-red-700 text-red-400 hover:bg-red-900/30 text-sm"
                        data-ocid={`driver_requests.cancel_button.${idx + 1}`}
                      >
                        <XCircle size={14} className="mr-1.5" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trip History */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Car size={18} className="text-blue-400" />
              Recent Trips
            </CardTitle>
          </CardHeader>
          <CardContent>
            {driverBookings.length === 0 ? (
              <div
                className="text-center py-4"
                data-ocid="driver_trips.empty_state"
              >
                <p className="text-gray-500 text-sm">No trips yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {driverBookings.slice(0, 5).map((b, idx) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0"
                    data-ocid={`driver_trips.item.${idx + 1}`}
                  >
                    <div>
                      <p className="text-white text-sm font-medium">
                        {b.customerName}
                      </p>
                      <p className="text-gray-500 text-xs truncate max-w-[200px]">
                        {b.pickupAddress} → {b.dropAddress}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold text-sm">
                        ₹{b.total.toLocaleString("en-IN")}
                      </p>
                      <Badge
                        className={`text-xs ${
                          b.status === "confirmed"
                            ? "bg-green-700 text-white"
                            : b.status === "rejected"
                              ? "bg-red-700 text-white"
                              : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {b.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Withdrawal */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <IndianRupee size={18} className="text-green-400" />
              Daily Withdrawal
            </CardTitle>
            <p className="text-gray-400 text-sm">
              Available: ₹{netPayout.toLocaleString("en-IN")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {withdrawStatus ? (
              <div
                className="bg-green-900/30 border border-green-700/50 rounded-xl p-4 text-center"
                data-ocid="withdrawal.success_state"
              >
                <BadgeCheck size={32} className="text-green-400 mx-auto mb-2" />
                <p className="text-green-300 font-medium text-sm">
                  {withdrawStatus}
                </p>
              </div>
            ) : (
              <>
                {/* Mode toggle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawMode("upi")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      withdrawMode === "upi"
                        ? "bg-green-600 text-white"
                        : "bg-gray-800 text-gray-400"
                    }`}
                    data-ocid="withdrawal.toggle"
                  >
                    UPI ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawMode("bank")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      withdrawMode === "bank"
                        ? "bg-green-600 text-white"
                        : "bg-gray-800 text-gray-400"
                    }`}
                    data-ocid="withdrawal.toggle"
                  >
                    Bank Account
                  </button>
                </div>

                {withdrawMode === "upi" ? (
                  <div className="space-y-1.5">
                    <Label className="text-gray-300 text-sm">UPI ID</Label>
                    <Input
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      data-ocid="withdrawal.input"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label className="text-gray-300 text-sm">
                      Bank Account Number
                    </Label>
                    <Input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Account number"
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      data-ocid="withdrawal.input"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-gray-300 text-sm">
                    Account Holder Name
                    <span className="text-gray-500 text-xs ml-1">
                      (must match your registered name)
                    </span>
                  </Label>
                  <Input
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Full name as registered"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    data-ocid="withdrawal.input"
                  />
                </div>

                {withdrawError && (
                  <div
                    className="flex items-center gap-2 text-red-400 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2 text-sm"
                    data-ocid="withdrawal.error_state"
                  >
                    <AlertCircle size={14} />
                    {withdrawError}
                  </div>
                )}

                <Button
                  onClick={handleWithdraw}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold"
                  disabled={netPayout === 0}
                  data-ocid="withdrawal.submit_button"
                >
                  <CreditCard size={16} className="mr-2" />
                  Withdraw ₹{netPayout.toLocaleString("en-IN")}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Driver Nav link */}
        <Link
          to="/driver-nav"
          className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-4 transition-colors"
          data-ocid="driver_dashboard.link"
        >
          <div className="flex items-center gap-3">
            <Navigation size={20} className="text-blue-400" />
            <div>
              <p className="text-white font-medium">Open Driver Navigation</p>
              <p className="text-gray-400 text-sm">
                Get turn-by-turn directions
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-500" />
        </Link>

        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-red-400"
          data-ocid="driver_dashboard.delete_button"
        >
          <LogOut size={16} className="mr-2" /> Logout
        </Button>
      </div>
    </div>
  );
}
