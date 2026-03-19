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
import {
  apiGetRegistrations,
  apiSetDriverOnlineStatus,
} from "../utils/backendApi";

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
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [driverBookings, setDriverBookings] = useState<LocalBooking[]>([]);
  const [withdrawMode, setWithdrawMode] = useState<"bank" | "upi">("upi");
  const [accountNumber, setAccountNumber] = useState("");
  const [upiId, setUpiId] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [withdrawStatus, setWithdrawStatus] = useState("");
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
      setBookingRequests(getBookingRequests(session.driverId, session.phone));
      setDriverBookings(getDriverBookings(session.name));
    }, 5000);
    return () => clearInterval(interval);
  }, [session]);

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
      // If not found in localStorage, search backend (cache was set in sendOtp, but just in case)
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

  const bg = "#0a0f0d";
  const card = "bg-[#111a14] border-[#1a2e1a]";
  const inputCls =
    "bg-[#0a0f0d] border-[#1a2e1a] text-[#f0fdf4] placeholder:text-[#86efac]/40";

  if (statusScreen === "pending") {
    const elapsed = Math.floor(
      (Date.now() - new Date(pendingSubmittedAt).getTime()) / 1000,
    );
    const remaining = Math.max(0, 30 * 60 - elapsed);
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: bg }}
      >
        <div className="max-w-sm w-full text-center">
          <Clock size={64} className="text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Application Under Review
          </h2>
          <p className="text-[#86efac] mb-4">
            Your application is pending admin approval.
          </p>
          <div className="bg-[#111a14] border border-[#1a2e1a] rounded-2xl p-6 mb-4">
            <p className="text-yellow-400 text-4xl font-bold">
              {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
            </p>
            <p className="text-[#86efac] text-sm mt-1">
              estimated review time remaining
            </p>
          </div>
          <Button
            onClick={() => setStatusScreen("idle")}
            variant="outline"
            className="border-[#1a2e1a] text-[#86efac]"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  if (statusScreen === "rejected") {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: bg }}
      >
        <div className="max-w-sm w-full text-center">
          <XCircle size={64} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Application Not Approved
          </h2>
          <p className="text-[#86efac] mb-4">
            Your application was not approved. Contact support.
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Support: +91-7836887228 (WhatsApp)
          </p>
          <Button
            onClick={() => setStatusScreen("idle")}
            variant="outline"
            className="border-[#1a2e1a] text-[#86efac]"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: bg }}
      >
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#22c55e] rounded-2xl mb-4">
              <Car size={32} className="text-black" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Drive<span className="text-green-400">Ease</span>
            </h1>
            <p className="text-[#86efac] text-sm mt-1">Driver Portal</p>
          </div>
          <Card className={`${card} rounded-2xl`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-[#22c55e] text-lg">
                Captain Login
              </CardTitle>
              <p className="text-[#86efac] text-sm">
                Login with your registered mobile number
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {loginError && (
                <div
                  className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-800/40 rounded-xl px-3 py-2 text-sm"
                  data-ocid="driver_login.error_state"
                >
                  <AlertCircle size={14} />
                  {loginError}
                </div>
              )}
              <div>
                <Label className="text-[#86efac] text-sm">Mobile Number</Label>
                <div className="flex gap-2 mt-1">
                  <div className="flex items-center bg-[#0a0f0d] border border-[#1a2e1a] rounded-lg px-3">
                    <Phone size={14} className="text-[#86efac] mr-1" />
                    <span className="text-[#86efac] text-sm">+91</span>
                  </div>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className={`${inputCls} flex-1`}
                    maxLength={10}
                    data-ocid="driver_login.input"
                  />
                </div>
              </div>
              {!otpSent ? (
                <Button
                  onClick={sendOtp}
                  disabled={checkingBackend}
                  className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold"
                  data-ocid="driver_login.submit_button"
                >
                  {checkingBackend ? "Checking registration..." : "Send OTP"}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-900/20 border border-green-700/30 rounded-xl px-3 py-2 text-center">
                    <p className="text-green-400 text-xs">
                      Demo OTP (for testing)
                    </p>
                    <p className="text-green-300 text-2xl font-bold tracking-widest">
                      {generatedOtp}
                    </p>
                  </div>
                  <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="4-digit OTP"
                    className={`${inputCls} text-center text-xl tracking-widest`}
                    maxLength={4}
                    data-ocid="driver_login.input"
                  />
                  <Button
                    onClick={verifyOtp}
                    className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold"
                    data-ocid="driver_login.confirm_button"
                  >
                    Verify & Login
                  </Button>
                </div>
              )}
              <p className="text-center text-[#86efac] text-sm">
                Not registered?{" "}
                <Link
                  to="/register-driver"
                  className="text-green-400 hover:underline"
                  data-ocid="driver_login.link"
                >
                  Register as Driver
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const confirmed = driverBookings.filter((b) => b.status === "confirmed");
  const gross = confirmed.reduce((s, b) => s + b.total, 0);
  const commission = Math.round(gross * 0.18);
  const net = gross - commission;

  return (
    <div className="min-h-screen text-white" style={{ background: bg }}>
      <div
        className="border-b border-[#1a2e1a] px-4 py-4"
        style={{ background: "#111a14" }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#22c55e] rounded-full flex items-center justify-center text-black font-bold text-lg">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-white">{session.name}</h2>
              <div className="flex items-center gap-1 text-[#86efac] text-sm">
                <Navigation size={12} />
                {session.city}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleOnlineStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${isOnline ? "bg-green-500/20 border border-green-500 text-green-400" : "bg-gray-500/20 border border-gray-600 text-gray-400"}`}
              data-ocid="driver_login.toggle"
            >
              <span
                className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400 animate-pulse" : "bg-gray-500"}`}
              />
              {isOnline ? "Online" : "Offline"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400"
              data-ocid="driver_login.close_button"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: <IndianRupee size={16} />,
              label: "Net Earnings",
              val: `₹${net.toLocaleString("en-IN")}`,
              color: "text-green-400",
            },
            {
              icon: <TrendingUp size={16} />,
              label: "Total Trips",
              val: String(confirmed.length),
              color: "text-blue-400",
            },
            {
              icon: <CreditCard size={16} />,
              label: "Commission",
              val: `₹${commission.toLocaleString("en-IN")}`,
              color: "text-yellow-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#111a14] border border-[#1a2e1a] rounded-2xl p-3 text-center"
            >
              <div className={`${s.color} flex justify-center mb-1`}>
                {s.icon}
              </div>
              <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-[#86efac]">{s.label}</p>
            </div>
          ))}
        </div>

        {bookingRequests.length > 0 && (
          <div className="bg-[#111a14] border border-[#22c55e]/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell size={16} className="text-green-400" />
              <h3 className="font-semibold text-white">New Booking Request</h3>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                {bookingRequests.length}
              </Badge>
            </div>
            {bookingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-[#0a0f0d] border border-[#1a2e1a] rounded-xl p-3 mb-3"
              >
                <p className="text-white font-medium">{req.customerName}</p>
                <p className="text-[#86efac] text-xs mt-1">📍 {req.pickup}</p>
                <p className="text-[#86efac] text-xs">🏁 {req.drop}</p>
                <p className="text-green-400 font-semibold mt-1">
                  ₹{req.amount.toLocaleString()}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold"
                    onClick={() => handleAcceptRequest(req)}
                    data-ocid="driver_login.confirm_button"
                  >
                    <CheckCircle size={14} className="mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-800 text-red-400 hover:bg-red-900/20"
                    onClick={() => handleRejectRequest(req)}
                    data-ocid="driver_login.delete_button"
                  >
                    <X size={14} className="mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-[#111a14] border border-[#1a2e1a] rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4">Request Withdrawal</h3>
          <div className="flex gap-2 mb-4">
            {(["upi", "bank"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setWithdrawMode(m)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${withdrawMode === m ? "bg-[#22c55e] text-black" : "bg-[#0a0f0d] border border-[#1a2e1a] text-[#86efac]"}`}
              >
                {m === "upi" ? "UPI ID" : "Bank Transfer"}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-[#86efac] text-sm">
                Account Holder Name (must match your registered name)
              </Label>
              <Input
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder={`Enter: ${session.name}`}
                className="mt-1 bg-[#0a0f0d] border-[#1a2e1a] text-white placeholder:text-gray-600"
                data-ocid="driver_login.input"
              />
            </div>
            {withdrawMode === "upi" ? (
              <div>
                <Label className="text-[#86efac] text-sm">UPI ID</Label>
                <Input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="mt-1 bg-[#0a0f0d] border-[#1a2e1a] text-white placeholder:text-gray-600"
                  data-ocid="driver_login.input"
                />
              </div>
            ) : (
              <div>
                <Label className="text-[#86efac] text-sm">Account Number</Label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter account number"
                  className="mt-1 bg-[#0a0f0d] border-[#1a2e1a] text-white placeholder:text-gray-600"
                  data-ocid="driver_login.input"
                />
              </div>
            )}
          </div>
          {withdrawError && (
            <p
              className="text-red-400 text-sm mt-2"
              data-ocid="driver_login.error_state"
            >
              {withdrawError}
            </p>
          )}
          {withdrawStatus && (
            <p
              className="text-green-400 text-sm mt-2"
              data-ocid="driver_login.success_state"
            >
              {withdrawStatus}
            </p>
          )}
          <Button
            onClick={handleWithdraw}
            className="w-full mt-4 bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold"
            data-ocid="driver_login.submit_button"
          >
            Request Withdrawal
          </Button>
        </div>

        {driverBookings.length > 0 && (
          <div className="bg-[#111a14] border border-[#1a2e1a] rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4">Recent Bookings</h3>
            {driverBookings
              .slice(-5)
              .reverse()
              .map((b, idx) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between py-2 border-b border-[#1a2e1a] last:border-0"
                  data-ocid={`driver_login.item.${idx + 1}`}
                >
                  <div>
                    <p className="text-white text-sm font-medium">
                      {b.customerName}
                    </p>
                    <p className="text-[#86efac] text-xs">{b.startDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-semibold">
                      ₹{b.total.toLocaleString()}
                    </p>
                    <span
                      className={`text-xs ${b.status === "confirmed" ? "text-green-400" : b.status === "rejected" ? "text-red-400" : "text-yellow-400"}`}
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
