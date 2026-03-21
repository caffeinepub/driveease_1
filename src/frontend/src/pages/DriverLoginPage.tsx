import {
  AlertCircle,
  Bell,
  Car,
  CheckCircle,
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
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import RouteMap from "../components/RouteMap";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { getAlertType } from "../config/apiConfig";
import { Link, useNavigate } from "../router";
import {
  apiGetRegistrations,
  apiSetDriverOnlineStatus,
} from "../utils/backendApi";
import { formatIST } from "../utils/istFormat";

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
  driverPhone?: string;
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
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
}

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem("driveease_my_device_id");
  if (!id) {
    id = `device_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("driveease_my_device_id", id);
  }
  return id;
}

function getDriverSessions(): Record<
  string,
  { deviceId: string; loginTime: number }
> {
  try {
    return JSON.parse(
      localStorage.getItem("driveease_driver_sessions") || "{}",
    );
  } catch {
    return {};
  }
}

function setDriverDeviceSession(phone: string, deviceId: string) {
  const sessions = getDriverSessions();
  sessions[phone] = { deviceId, loginTime: Date.now() };
  localStorage.setItem("driveease_driver_sessions", JSON.stringify(sessions));
}

function removeDriverDeviceSession(phone: string) {
  const sessions = getDriverSessions();
  delete sessions[phone];
  localStorage.setItem("driveease_driver_sessions", JSON.stringify(sessions));
}

function getDriverSessionLS(): DriverSession | null {
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
    const all: BookingRequest[] = JSON.parse(
      localStorage.getItem("driver_booking_requests") || "[]",
    );
    return all.filter(
      (r) =>
        (r.driverId === driverId ||
          (driverPhone && r.driverPhone === driverPhone)) &&
        r.status === "pending",
    );
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
    getDriverSessionLS,
  );
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [statusScreen, setStatusScreen] = useState<
    "idle" | "pending" | "rejected"
  >("idle");
  const [pendingSubmittedAt, setPendingSubmittedAt] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [onlineTimer, setOnlineTimer] = useState("");
  const [loginTimeIST] = useState(() => formatIST());
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const prevBookingCountRef = useRef(0);
  const [driverBookings, setDriverBookings] = useState<LocalBooking[]>([]);
  const [withdrawMode, setWithdrawMode] = useState<"bank" | "upi">("upi");
  const [accountNumber, setAccountNumber] = useState("");
  const [upiId, setUpiId] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [withdrawStatus, setWithdrawStatus] = useState("");
  const [otpInputs, setOtpInputs] = useState<Record<number, string>>({});
  const [otpErrors, setOtpErrors] = useState<Record<number, string>>({});
  const [rideStarted, setRideStarted] = useState<Record<number, boolean>>({});
  const [withdrawError, setWithdrawError] = useState("");
  const [checkingBackend, setCheckingBackend] = useState(false);

  useEffect(() => {
    if (session) {
      setBookingRequests(getBookingRequests(session.driverId, session.phone));
      setDriverBookings(getDriverBookings(session.name));
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      const newReqs = getBookingRequests(session.driverId, session.phone);
      if (newReqs.length > prevBookingCountRef.current) {
        const latest = newReqs[0];
        toast.success(
          `New Booking! ${latest?.customerName || "Customer"} is waiting. Accept to start navigation.`,
          { duration: 6000 },
        );
      }
      prevBookingCountRef.current = newReqs.length;
      setBookingRequests(newReqs);
      setDriverBookings(getDriverBookings(session.name));
    }, 5000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    if (!isOnline || !session) {
      setOnlineTimer("");
      return;
    }
    const key = `driveease_driver_online_since_${session.driverId}`;
    const updateTimer = () => {
      const since = localStorage.getItem(key);
      if (!since) return;
      const elapsed = Math.floor(
        (Date.now() - new Date(since).getTime()) / 1000,
      );
      const h = Math.floor(elapsed / 3600);
      const m = Math.floor((elapsed % 3600) / 60);
      const s = elapsed % 60;
      setOnlineTimer(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOnline, session]);

  const sendOtp = async () => {
    if (!phone || phone.length < 10) {
      setLoginError("Please enter a valid 10-digit phone number.");
      return;
    }
    type RegEntry = {
      phone: string;
      status: string;
      submittedAt: string;
      name?: string;
      city?: string;
      id?: number;
    };
    let regs: RegEntry[] = [];
    try {
      regs = JSON.parse(
        localStorage.getItem("driveease_registrations") || "[]",
      );
    } catch {
      /* continue */
    }
    let reg = regs.find((r) => r.phone === phone);
    if (!reg) {
      setCheckingBackend(true);
      setLoginError("");
      try {
        const backendRegs = await apiGetRegistrations();
        reg = backendRegs.find((r: any) => r.phone === phone) as
          | RegEntry
          | undefined;
        if (reg) {
          const merged = [
            ...regs,
            ...backendRegs.filter(
              (b: any) => !regs.find((l) => l.phone === b.phone),
            ),
          ];
          localStorage.setItem(
            "driveease_registrations",
            JSON.stringify(merged),
          );
        }
      } catch {
        /* continue */
      }
      setCheckingBackend(false);
    }
    if (!reg) {
      setLoginError(
        "No registration found for this number. Please register first.",
      );
      return;
    }
    if (reg.status === "pending") {
      setPendingSubmittedAt(reg.submittedAt);
      setStatusScreen("pending");
      return;
    }
    if (reg.status === "rejected") {
      setStatusScreen("rejected");
      return;
    }
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(code);
    setOtpSent(true);
    setLoginError("");
  };

  const verifyOtp = async () => {
    if (otp !== generatedOtp) {
      setLoginError("Invalid OTP. Please try again.");
      return;
    }
    const deviceId = getOrCreateDeviceId();
    const sessions = getDriverSessions();
    const existingSession = sessions[phone];
    if (existingSession && existingSession.deviceId !== deviceId) {
      setLoginError(
        "Already logged in on another device. Please log out from that device first.",
      );
      return;
    }
    setDriverDeviceSession(phone, deviceId);
    try {
      let regDrivers: Array<{
        phone: string;
        name: string;
        city: string;
        id: number;
        submittedAt: string;
      }> = JSON.parse(localStorage.getItem("driveease_registrations") || "[]");
      let foundReg = regDrivers.find((d) => d.phone === phone);
      if (!foundReg) {
        try {
          const backendRegs = await apiGetRegistrations();
          foundReg = backendRegs.find(
            (r: any) => r.phone === phone,
          ) as typeof foundReg;
        } catch {
          /* continue */
        }
      }
      if (foundReg) {
        const sess: DriverSession = {
          driverId: (foundReg as any).id || Math.floor(Math.random() * 10000),
          name: (foundReg as any).name || "Driver",
          phone: (foundReg as any).phone,
          city: (foundReg as any).city || "Delhi",
          pricePerDay: 1200,
          registeredAt:
            (foundReg as any).submittedAt || new Date().toISOString(),
        };
        localStorage.setItem("driver_session", JSON.stringify(sess));
        localStorage.removeItem("otp_customer");
        setSession(sess);
      } else {
        setLoginError("Login failed. Please try again.");
      }
    } catch {
      setLoginError("Login failed. Please try again.");
    }
  };

  const toggleOnlineStatus = () => {
    if (!session) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    try {
      const ds = JSON.parse(
        localStorage.getItem("driveease_driver_status") || "{}",
      );
      ds[String(session.driverId)] = newStatus ? "online" : "offline";
      ds[session.phone] = newStatus ? "online" : "offline";
      localStorage.setItem("driveease_driver_status", JSON.stringify(ds));
      const ak = `driveease_driver_activity_${session.driverId}`;
      const act = JSON.parse(localStorage.getItem(ak) || "[]");
      act.push({
        status: newStatus ? "online" : "offline",
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(ak, JSON.stringify(act));
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
    apiSetDriverOnlineStatus({
      phone: session.phone,
      name: session.name,
      city: session.city,
      driverId: String(session.driverId),
      status: newStatus ? "online" : "offline",
      lastUpdated: new Date().toISOString(),
    }).catch(() => {});
  };

  const handleAcceptRequest = (req: BookingRequest) => {
    try {
      const bks: LocalBooking[] = JSON.parse(
        localStorage.getItem("driveease_bookings") || "[]",
      );
      localStorage.setItem(
        "driveease_bookings",
        JSON.stringify(
          bks.map((b) => (b.id === req.id ? { ...b, status: "confirmed" } : b)),
        ),
      );
      const rqs: BookingRequest[] = JSON.parse(
        localStorage.getItem("driver_booking_requests") || "[]",
      );
      localStorage.setItem(
        "driver_booking_requests",
        JSON.stringify(
          rqs.map((r) => (r.id === req.id ? { ...r, status: "confirmed" } : r)),
        ),
      );
      const notifs = JSON.parse(
        localStorage.getItem("booking_notifications") || "[]",
      );
      notifs.push({
        bookingId: req.id,
        message: "Your booking has been confirmed!",
        read: false,
        timestamp: Date.now(),
      });
      localStorage.setItem("booking_notifications", JSON.stringify(notifs));
      if (session)
        setBookingRequests(getBookingRequests(session.driverId, session.phone));
    } catch {
      /* ignore */
    }
  };

  const handleRejectRequest = (req: BookingRequest) => {
    try {
      const bks: LocalBooking[] = JSON.parse(
        localStorage.getItem("driveease_bookings") || "[]",
      );
      localStorage.setItem(
        "driveease_bookings",
        JSON.stringify(
          bks.map((b) => (b.id === req.id ? { ...b, status: "rejected" } : b)),
        ),
      );
      const rqs: BookingRequest[] = JSON.parse(
        localStorage.getItem("driver_booking_requests") || "[]",
      );
      localStorage.setItem(
        "driver_booking_requests",
        JSON.stringify(
          rqs.map((r) => (r.id === req.id ? { ...r, status: "rejected" } : r)),
        ),
      );
      if (session)
        setBookingRequests(getBookingRequests(session.driverId, session.phone));
    } catch {
      /* ignore */
    }
  };

  const handleWithdraw = () => {
    if (!session) return;
    setWithdrawError("");
    setWithdrawStatus("");
    if (
      accountHolder.trim().toLowerCase() !== session.name.trim().toLowerCase()
    ) {
      setWithdrawError(`Account holder name must match: ${session.name}`);
      return;
    }
    if (withdrawMode === "bank" && !accountNumber) {
      setWithdrawError("Please enter account number.");
      return;
    }
    if (withdrawMode === "upi" && !upiId) {
      setWithdrawError("Please enter UPI ID.");
      return;
    }
    const gross = driverBookings
      .filter((b) => b.status === "confirmed")
      .reduce((s, b) => s + b.total, 0);
    const net = Math.round(gross * 0.82);
    const wrs = JSON.parse(localStorage.getItem("withdrawal_requests") || "[]");
    wrs.push({
      driverId: session.driverId,
      driverName: session.name,
      amount: net,
      mode: withdrawMode,
      accountDetails: withdrawMode === "bank" ? accountNumber : upiId,
      requestedAt: new Date().toISOString(),
      status: "pending",
    });
    localStorage.setItem("withdrawal_requests", JSON.stringify(wrs));
    setWithdrawStatus(
      `Withdrawal of ₹${net.toLocaleString("en-IN")} requested. Processed within 24 hours.`,
    );
  };

  const handleLogout = () => {
    if (session) removeDriverDeviceSession(session.phone);
    localStorage.removeItem("driver_session");
    setSession(null);
    setIsOnline(false);
    navigate("/");
  };

  // --- STATUS SCREENS (pending / rejected) ---
  if (statusScreen === "pending") {
    const elapsed = Math.floor(
      (Date.now() - new Date(pendingSubmittedAt).getTime()) / 1000,
    );
    const remaining = Math.max(0, 30 * 60 - elapsed);
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200 mx-auto mb-6 flex items-center justify-center">
            <Clock size={40} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Under Review
          </h2>
          <p className="text-gray-500 mb-6">
            Your application is pending admin approval.
          </p>
          <div className="rounded-2xl p-6 mb-6 bg-white border border-gray-200 shadow-sm">
            <p className="text-amber-500 text-5xl font-black font-mono">
              {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              estimated review time remaining
            </p>
          </div>
          <Button
            onClick={() => setStatusScreen("idle")}
            variant="outline"
            className="border-gray-200 text-gray-600"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  if (statusScreen === "rejected") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <XCircle size={64} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Not Approved
          </h2>
          <p className="text-gray-500 mb-4">
            Your application was not approved. Contact support.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Support: +91-7836887228 (WhatsApp)
          </p>
          <Button
            onClick={() => setStatusScreen("idle")}
            variant="outline"
            className="border-gray-200 text-gray-600"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  // --- LOGIN SCREEN ---
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-green-100 border-2 border-green-300 mx-auto mb-4 flex items-center justify-center">
              <Car size={36} className="text-green-600" />
            </div>
            <h1 className="text-4xl font-black text-gray-900">
              Drive<span className="text-green-600">Ease</span>
            </h1>
            <p className="text-sm mt-1 text-gray-500">Driver Portal</p>
          </div>

          {/* Login card */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <h2 className="text-lg font-bold mb-1 text-gray-900">
              Driver Login
            </h2>
            <p className="text-sm mb-5 text-gray-500">
              Login with your registered mobile number
            </p>

            {loginError && (
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm mb-4 bg-red-50 border border-red-200 text-red-600"
                data-ocid="driver_login.error_state"
              >
                <AlertCircle size={14} />
                {loginError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block text-gray-700">
                  Mobile Number
                </Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 rounded-xl bg-gray-50 border border-gray-200">
                    <Phone size={14} className="text-green-600" />
                    <span className="text-sm ml-1.5 text-gray-700">+91</span>
                  </div>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="flex-1 rounded-xl bg-white border-gray-200"
                    maxLength={10}
                    data-ocid="driver_login.input"
                  />
                </div>
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={checkingBackend}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-700 text-white transition-all disabled:opacity-60"
                  data-ocid="driver_login.submit_button"
                >
                  {checkingBackend ? "Checking..." : "Send OTP →"}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl px-4 py-3 text-center bg-green-50 border border-green-200">
                    <p className="text-xs mb-1 text-gray-500">
                      Demo OTP (for testing)
                    </p>
                    <p className="text-3xl font-black font-mono tracking-widest text-green-700">
                      {generatedOtp}
                    </p>
                  </div>
                  <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    className="text-center text-xl tracking-widest rounded-xl bg-white border-gray-200"
                    maxLength={4}
                    data-ocid="driver_login.input"
                  />
                  <button
                    type="button"
                    onClick={verifyOtp}
                    className="w-full py-3 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-700 text-white transition-all"
                    data-ocid="driver_login.confirm_button"
                  >
                    Verify & Login ✓
                  </button>
                </div>
              )}

              <p className="text-center text-sm text-gray-500">
                Not registered?{" "}
                <a
                  href="#/register-driver"
                  className="text-green-600 hover:underline font-medium"
                  data-ocid="driver_login.link"
                >
                  Register as Driver
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD ---
  const confirmed = driverBookings.filter((b) => b.status === "confirmed");
  const gross = confirmed.reduce((s, b) => s + b.total, 0);
  const commission = Math.round(gross * 0.18);
  const net = gross - commission;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center font-black text-lg text-green-700">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{session.name}</h2>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Navigation size={10} />
                {session.city}
              </div>
              <div className="text-xs text-gray-400">In: {loginTimeIST}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Online toggle */}
            <button
              type="button"
              onClick={toggleOnlineStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all border ${
                isOnline
                  ? "bg-green-50 border-green-400 text-green-700"
                  : "bg-gray-100 border-gray-200 text-gray-500"
              }`}
              data-ocid="driver_login.toggle"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
              />
              {isOnline ? "Online" : "Offline"}
            </button>

            {isOnline && onlineTimer && (
              <span className="text-xs font-mono px-2 py-1 rounded-full bg-green-50 border border-green-200 text-green-700">
                ⏱ {onlineTimer}
              </span>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-red-500 hover:text-red-700 font-semibold text-sm transition-colors"
              data-ocid="driver_login.close_button"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: <IndianRupee size={18} />,
              label: "Net Earnings",
              val: `₹${net.toLocaleString("en-IN")}`,
              colorCls: "text-green-600",
              bg: "bg-green-50 border-green-200",
            },
            {
              icon: <TrendingUp size={18} />,
              label: "Total Trips",
              val: String(confirmed.length),
              colorCls: "text-blue-600",
              bg: "bg-blue-50 border-blue-200",
            },
            {
              icon: <CreditCard size={18} />,
              label: "Commission",
              val: `₹${commission.toLocaleString("en-IN")}`,
              colorCls: "text-amber-600",
              bg: "bg-amber-50 border-amber-200",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-3 text-center border bg-white shadow-sm"
            >
              <div className={`flex justify-center mb-1.5 ${s.colorCls}`}>
                {s.icon}
              </div>
              <p className={`text-base font-black ${s.colorCls}`}>{s.val}</p>
              <p className="text-xs mt-0.5 text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Booking requests */}
        {bookingRequests.length > 0 && (
          <div className="bg-white border border-green-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell size={16} className="text-green-600" />
              <h3 className="font-semibold text-gray-900">
                New Booking Request
              </h3>
              <Badge className="text-xs ml-auto bg-green-50 border border-green-200 text-green-700">
                {getAlertType() === "push"
                  ? "📱 Push"
                  : getAlertType() === "sms"
                    ? "💬 SMS"
                    : "💬 WhatsApp"}
              </Badge>
              <Badge className="text-xs bg-green-100 border border-green-300 text-green-800">
                {bookingRequests.length}
              </Badge>
            </div>
            {bookingRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-xl p-3 mb-3 bg-gray-50 border border-gray-200"
              >
                <p className="text-gray-900 font-medium">{req.customerName}</p>
                <p className="text-sm mt-1 text-gray-600">📍 {req.pickup}</p>
                <p className="text-sm text-gray-600">🏁 {req.drop}</p>
                <p className="text-xs mt-0.5 text-gray-400">
                  🕒 {formatIST(req.timestamp)}
                </p>
                <p className="font-bold text-base mt-1 text-green-700">
                  ₹{req.amount.toLocaleString("en-IN")}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => handleAcceptRequest(req)}
                    className="flex-1 py-2 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white transition-all"
                    data-ocid="driver_login.confirm_button"
                  >
                    <CheckCircle size={14} /> Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectRequest(req)}
                    className="flex-1 py-2 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all"
                    data-ocid="driver_login.delete_button"
                  >
                    <X size={14} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Withdrawal */}
        <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">
            Request Withdrawal
          </h3>
          <div className="flex gap-2 mb-4">
            {(["upi", "bank"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setWithdrawMode(m)}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  ...(withdrawMode === m
                    ? {
                        background: "#16a34a",
                        color: "white",
                        border: "1px solid #16a34a",
                      }
                    : {
                        background: "white",
                        color: "#6b7280",
                        border: "1px solid #e5e7eb",
                      }),
                }}
              >
                {m === "upi" ? "UPI ID" : "Bank Transfer"}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-sm mb-1.5 block text-gray-600">
                Account Holder Name (must match registered name)
              </Label>
              <Input
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder={`Enter: ${session.name}`}
                className="rounded-xl bg-white border-gray-200"
                data-ocid="driver_login.input"
              />
            </div>
            {withdrawMode === "upi" ? (
              <div>
                <Label className="text-sm mb-1.5 block text-gray-600">
                  UPI ID
                </Label>
                <Input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="rounded-xl bg-white border-gray-200"
                  data-ocid="driver_login.input"
                />
              </div>
            ) : (
              <div>
                <Label className="text-sm mb-1.5 block text-gray-600">
                  Account Number
                </Label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter account number"
                  className="rounded-xl bg-white border-gray-200"
                  data-ocid="driver_login.input"
                />
              </div>
            )}
          </div>
          {withdrawError && (
            <p className="text-red-600" data-ocid="driver_login.error_state">
              {withdrawError}
            </p>
          )}
          {withdrawStatus && (
            <p
              className="text-green-600"
              data-ocid="driver_login.success_state"
            >
              {withdrawStatus}
            </p>
          )}
          <button
            type="button"
            onClick={handleWithdraw}
            className="w-full mt-4 py-3 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-700 text-white transition-all"
            data-ocid="driver_login.submit_button"
          >
            Request Withdrawal
          </button>
        </div>

        {/* OTP Verification */}
        {driverBookings.filter((b) => b.status === "confirmed").length > 0 && (
          <div className="rounded-2xl p-5 bg-white border border-green-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">
              🚗 Active Rides — OTP Verification
            </h3>
            {driverBookings
              .filter((b) => b.status === "confirmed")
              .map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl p-4 mb-3 bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-900 font-medium">
                      {b.customerName}
                    </p>
                    <p className="font-bold text-green-700">
                      ₹{b.total.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    📅 {formatIST(b.startDate)}
                  </p>
                  {!rideStarted[b.id] ? (
                    <div className="mt-3 rounded-xl p-3 bg-white border border-gray-200">
                      <p className="text-xs font-semibold mb-2 text-gray-500">
                        Enter Customer OTP to Start Ride
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpInputs[b.id] || ""}
                          onChange={(e) =>
                            setOtpInputs((prev) => ({
                              ...prev,
                              [b.id]: e.target.value,
                            }))
                          }
                          placeholder="6-digit OTP"
                          className="flex-1 px-3 py-2 rounded-lg text-gray-900 text-sm outline-none bg-white border border-gray-200 focus:border-green-400"
                          data-ocid="driver_login.input"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const stored = JSON.parse(
                              localStorage.getItem("ride_otps") || "{}",
                            );
                            const correctOtp = stored[String(b.id)];
                            if (otpInputs[b.id] === correctOtp) {
                              setRideStarted((prev) => ({
                                ...prev,
                                [b.id]: true,
                              }));
                              setOtpErrors((prev) => ({ ...prev, [b.id]: "" }));
                              const allBks = JSON.parse(
                                localStorage.getItem(
                                  "driveease_all_bookings",
                                ) || "[]",
                              );
                              const updated = allBks.map(
                                (bk: { id: number; status: string }) =>
                                  bk.id === b.id
                                    ? { ...bk, status: "in-progress" }
                                    : bk,
                              );
                              localStorage.setItem(
                                "driveease_all_bookings",
                                JSON.stringify(updated),
                              );
                            } else {
                              setOtpErrors((prev) => ({
                                ...prev,
                                [b.id]:
                                  "Incorrect OTP. Ask customer for the correct code.",
                              }));
                            }
                          }}
                          className="px-4 py-2 rounded-lg font-semibold text-sm bg-green-600 hover:bg-green-700 text-white transition-colors"
                          data-ocid="driver_login.confirm_button"
                        >
                          Verify
                        </button>
                      </div>
                      {otpErrors[b.id] && (
                        <p
                          className="text-xs mt-1 text-red-600"
                          data-ocid="driver_login.error_state"
                        >
                          {otpErrors[b.id]}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm font-semibold text-green-600">
                        ✅ OTP Verified
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const allBks = JSON.parse(
                            localStorage.getItem("driveease_all_bookings") ||
                              "[]",
                          );
                          const updated = allBks.map(
                            (bk: { id: number; status: string }) =>
                              bk.id === b.id
                                ? { ...bk, status: "completed" }
                                : bk,
                          );
                          localStorage.setItem(
                            "driveease_all_bookings",
                            JSON.stringify(updated),
                          );
                          setRideStarted((prev) => ({
                            ...prev,
                            [b.id]: false,
                          }));
                        }}
                        className="px-4 py-2 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-700 text-white transition-all"
                        data-ocid="driver_login.primary_button"
                      >
                        🚗 Start Ride
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Route Map for Active Rides */}
        {driverBookings
          .filter((b) => b.status === "confirmed" || b.status === "in-progress")
          .map((b) =>
            b.pickupAddress && b.dropAddress ? (
              <div
                key={`map-${b.id}`}
                className="rounded-2xl overflow-hidden border border-green-200 shadow-sm"
              >
                <div className="px-4 py-3 flex items-center justify-between bg-green-50">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      Route Map
                    </p>
                    <p className="text-xs text-green-600">
                      Pickup: {b.pickupAddress?.slice(0, 40)}...
                    </p>
                  </div>
                  <a
                    href="/driver-nav"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-green-600 text-white hover:bg-green-700"
                    data-ocid="driver_login.link"
                  >
                    <Navigation size={12} />
                    Start Navigation
                  </a>
                </div>
                <div style={{ height: 280 }}>
                  <RouteMap
                    pickup={
                      b.pickupLat && b.pickupLng
                        ? [b.pickupLat, b.pickupLng]
                        : undefined
                    }
                    drop={
                      b.dropLat && b.dropLng
                        ? [b.dropLat, b.dropLng]
                        : undefined
                    }
                    showRoute={true}
                    height={280}
                  />
                </div>
              </div>
            ) : null,
          )}

        {/* Recent Bookings */}
        {driverBookings.length > 0 && (
          <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">
              Recent Bookings
            </h3>
            {driverBookings
              .slice(-5)
              .reverse()
              .map((b, idx) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  data-ocid={`driver_login.item.${idx + 1}`}
                >
                  <div>
                    <p className="text-gray-900 text-sm font-medium">
                      {b.customerName}
                    </p>
                    <p className="text-xs text-gray-400">{b.startDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700">
                      ₹{b.total.toLocaleString("en-IN")}
                    </p>
                    <span
                      className="text-xs"
                      style={{
                        color:
                          b.status === "confirmed"
                            ? "#16a34a"
                            : b.status === "rejected"
                              ? "#dc2626"
                              : "#d97706",
                      }}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
