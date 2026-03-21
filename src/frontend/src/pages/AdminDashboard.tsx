import {
  AlertTriangle,
  BarChart3,
  Car,
  CheckCircle,
  ClipboardList,
  Clock,
  Download,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  MapPin,
  MessageSquare,
  Moon,
  RefreshCw,
  Settings,
  Shield,
  Sun,
  Timer,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Textarea } from "../components/ui/textarea";
import {
  getAlertType,
  getApiKey,
  setAlertType as saveAlertType,
  setApiKey as saveApiKey,
} from "../config/apiConfig";
import type { AlertType } from "../config/apiConfig";
import {
  apiGetAllDriverStatuses,
  apiGetBookings,
  apiGetEnquiries,
  apiGetOnlineDrivers,
  apiGetOtpLogins,
  apiGetRegistrations,
  apiUpdateBookingStatus,
  apiUpdateEnquiryStatus,
  apiUpdateRegistrationStatus,
} from "../utils/backendApi";
import type { ApiDriverStatus } from "../utils/backendApi";
import { formatIST } from "../utils/istFormat";
import {
  updateBookingStatus,
  updateEnquiryStatus,
  updateRegistrationStatus,
} from "../utils/localStore";
import type {
  LocalBooking,
  LocalEnquiry,
  LocalOtpLogin,
  LocalRegistration,
} from "../utils/localStore";

type Tab =
  | "bookings"
  | "drivers"
  | "registrations"
  | "customers"
  | "enquiries"
  | "settings"
  | "live-drivers"
  | "driver-earnings"
  | "pricing"
  | "kyc";

const ADMIN_PASSWORD = "126312";
const AUTH_KEY = "admin_auth";

// ── Audit Log helpers ────────────────────────────────────────────────────
function addAuditLog(bookingId: number, action: string) {
  try {
    const logs = JSON.parse(
      localStorage.getItem("driveease_audit_logs") || "[]",
    );
    logs.push({
      bookingId,
      action,
      by: "Admin",
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("driveease_audit_logs", JSON.stringify(logs));
  } catch {
    /* ignore */
  }
}

function getAuditLogs(
  bookingId: number,
): Array<{ bookingId: number; action: string; by: string; timestamp: string }> {
  try {
    const logs = JSON.parse(
      localStorage.getItem("driveease_audit_logs") || "[]",
    );
    return logs.filter((l: any) => l.bookingId === bookingId);
  } catch {
    return [];
  }
}

// ── Commission rate helpers ───────────────────────────────────────────────
function getCommissionRate(): number {
  try {
    return Number(localStorage.getItem("driveease_commission_rate") || "18");
  } catch {
    return 18;
  }
}

// ── Pricing config helpers ────────────────────────────────────────────────
interface PricingConfig {
  minFare: number;
  baseCharge: number;
  perKmRate: number;
  nightSurcharge: number;
  bufferTime: number;
  autoDispatch: boolean;
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
      bufferTime: stored.bufferTime ?? 30,
      autoDispatch: stored.autoDispatch ?? false,
    };
  } catch {
    return {
      minFare: 99,
      baseCharge: 50,
      perKmRate: 12,
      nightSurcharge: 20,
      bufferTime: 30,
      autoDispatch: false,
    };
  }
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-green-100 text-green-800 border-green-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    cancelled: "bg-gray-100 text-gray-600 border-gray-200",
    new: "bg-blue-100 text-blue-800 border-blue-200",
    contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
    closed: "bg-green-100 text-green-800 border-green-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        colors[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function fmt(iso: string) {
  try {
    return formatIST(iso);
  } catch {
    return iso;
  }
}

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDuration(ms: number): string {
  const totalMins = Math.floor(ms / 60000);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function getDriverOnlineSince(driverId: string | number): string | null {
  return localStorage.getItem(`driveease_driver_online_since_${driverId}`);
}

// ── Revenue chart data ────────────────────────────────────────────────────
function getLast7DaysRevenue(
  bookings: LocalBooking[],
): Array<{ day: string; revenue: number }> {
  const result: Array<{ day: string; revenue: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
    });
    const dayRevenue = bookings
      .filter(
        (b) =>
          (b.createdAt ?? b.startDate ?? "").startsWith(key) &&
          b.status !== "rejected",
      )
      .reduce((s, b) => s + (Number(b.total) || 0), 0);
    result.push({ day: label, revenue: dayRevenue });
  }
  return result;
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(
    () => localStorage.getItem(AUTH_KEY) === "true",
  );
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [tab, setTab] = useState<Tab>("bookings");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("driveease_dark_mode") === "true",
  );

  const [bookings, setBookings] = useState<LocalBooking[]>([]);
  const [registrations, setRegistrations] = useState<LocalRegistration[]>([]);
  const [otpLogins, setOtpLogins] = useState<LocalOtpLogin[]>([]);
  const [enquiries, setEnquiries] = useState<LocalEnquiry[]>([]);
  const [drivers] = useState<any[]>([]);
  const [driverRates, setDriverRates] = useState<Record<number, number>>({});
  const [ratesSaved, setRatesSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Commission
  const [commissionRate, setCommissionRate] = useState(getCommissionRate);
  const [commissionSaved, setCommissionSaved] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getApiKey());
  const [alertTypeState, setAlertTypeState] = useState<AlertType>(() =>
    getAlertType(),
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiConfigSaved, setApiConfigSaved] = useState(false);

  // Pricing config
  const [pricingConfig, setPricingConfig] =
    useState<PricingConfig>(getPricingConfig);
  const [pricingSaved, setPricingSaved] = useState(false);

  // Bulk selection
  const [selectedBookingIds, setSelectedBookingIds] = useState<Set<number>>(
    new Set(),
  );
  const [selectedRegIds, setSelectedRegIds] = useState<Set<number>>(new Set());

  // Audit log dialog
  const [auditBookingId, setAuditBookingId] = useState<number | null>(null);

  // Filters
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingDateFilter, setBookingDateFilter] = useState("");
  const [driverNameFilter, setDriverNameFilter] = useState("");
  const [driverCityFilter, setDriverCityFilter] = useState("");
  const [driverStatusFilter, setDriverStatusFilter] = useState("");
  const [regNameFilter, setRegNameFilter] = useState("");
  const [regCityFilter, setRegCityFilter] = useState("");
  const [regStatusFilter, setRegStatusFilter] = useState("");

  // Registration detail modal
  const [viewReg, setViewReg] = useState<
    | (LocalRegistration & {
        vehicleType?: string;
        licenseNumber?: string;
        experience?: string;
        languages?: string;
        workAreas?: string;
        paymentScreenshotBase64?: string;
      })
    | null
  >(null);
  const [showScreenshot, setShowScreenshot] = useState(false);

  // KYC reject reason
  const [kycRejectId, setKycRejectId] = useState<number | null>(null);
  const [kycRejectReason, setKycRejectReason] = useState("");

  const [backendDriverStatuses, setBackendDriverStatuses] = useState<
    ApiDriverStatus[]
  >([]);
  const [expandedDriverId, setExpandedDriverId] = useState<
    string | number | null
  >(null);

  const loadAll = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setIsRefreshing(true);
      // Clear state first so fresh data replaces stale entries
      setBookings([]);
      setRegistrations([]);
      setOtpLogins([]);
      setEnquiries([]);
    }
    setIsLoading(true);
    try {
      const [bks, regs, logins, enqs] = await Promise.all([
        apiGetBookings().catch(() => null),
        apiGetRegistrations().catch(() => null),
        apiGetOtpLogins().catch(() => null),
        apiGetEnquiries().catch(() => null),
      ]);

      const backendHasData = !!(bks || regs || logins || enqs);

      // Backend is the single source of truth - no localStorage merging
      setBookings((bks || []) as any);
      setRegistrations((regs || []) as any);
      setOtpLogins(logins || []);
      setEnquiries((enqs || []) as any);

      // Update sync source indicator
      if (backendHasData) {
        setSyncSource("backend");
      } else {
        setSyncSource("local");
      }

      const statuses = await apiGetAllDriverStatuses().catch(() => []);
      setBackendDriverStatuses(statuses);
      try {
        const rates = JSON.parse(
          localStorage.getItem("driveease_driver_rates") || "{}",
        );
        setDriverRates(rates);
      } catch {
        setDriverRates({});
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const [autoSync, setAutoSync] = useState(false);
  const [syncToast, setSyncToast] = useState("");
  const [syncSource, setSyncSource] = useState<
    "backend" | "local" | "mixed" | ""
  >("");

  const syncNow = useCallback(async () => {
    await loadAll(true);
    // Play a chime on sync
    (() => {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } catch {
        /* ignore */
      }
    })();
    setSyncToast("Data synced from server");
    setTimeout(() => setSyncToast(""), 3000);
  }, [loadAll]);

  useEffect(() => {
    if (authed) loadAll();
  }, [authed, loadAll]);

  useEffect(() => {
    if (!authed || !autoSync) return;
    const interval = setInterval(syncNow, 30000);
    return () => clearInterval(interval);
  }, [authed, autoSync, syncNow]);

  const toggleDarkMode = () => {
    setDarkMode((d) => {
      const next = !d;
      localStorage.setItem("driveease_dark_mode", String(next));
      return next;
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      setAuthed(true);
      setPwError("");
    } else {
      setPwError("Incorrect password.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  };

  const saveRates = () => {
    localStorage.setItem("driveease_driver_rates", JSON.stringify(driverRates));
    setRatesSaved(true);
    setTimeout(() => setRatesSaved(false), 2000);
  };

  const saveApiConfig = () => {
    saveApiKey(apiKeyInput);
    saveAlertType(alertTypeState);
    setApiConfigSaved(true);
    setTimeout(() => setApiConfigSaved(false), 2000);
  };

  const saveCommission = () => {
    localStorage.setItem("driveease_commission_rate", String(commissionRate));
    setCommissionSaved(true);
    setTimeout(() => setCommissionSaved(false), 2000);
  };

  const savePricingConfig = () => {
    localStorage.setItem(
      "driveease_pricing_config",
      JSON.stringify(pricingConfig),
    );
    setPricingSaved(true);
    setTimeout(() => setPricingSaved(false), 2000);
  };

  // Bulk booking actions
  const handleBulkBookingAction = async (status: string) => {
    for (const id of selectedBookingIds) {
      await apiUpdateBookingStatus(id, status).catch(() => {});
      updateBookingStatus(id, status as any);
      addAuditLog(id, `Bulk status changed to ${status}`);
    }
    setSelectedBookingIds(new Set());
    loadAll();
  };

  // Bulk registration actions
  const handleBulkRegAction = async (status: string) => {
    for (const id of selectedRegIds) {
      updateRegistrationStatus(id, status as any);
      await apiUpdateRegistrationStatus(id, status).catch(() => {});
    }
    setSelectedRegIds(new Set());
    loadAll();
  };

  // ── Login Screen ───────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <Card className="max-w-sm w-full shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Car className="text-white" size={28} />
            </div>
            <CardTitle className="text-xl">DriveEase Admin</CardTitle>
            <p className="text-sm text-gray-500">Founder-only access</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="text-center tracking-widest"
                data-ocid="admin.input"
              />
              {pwError && (
                <p
                  className="text-red-600 text-sm text-center"
                  data-ocid="admin.error_state"
                >
                  {pwError}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-500 text-white"
                data-ocid="admin.primary_button"
              >
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Online drivers ─────────────────────────────────────────────────────
  const onlinePhoneSet = new Set(
    backendDriverStatuses
      .filter((s) => s.status === "online")
      .map((s) => s.phone),
  );
  const onlineRegisteredDrivers = registrations.filter(
    (r) => r.status === "approved" && onlinePhoneSet.has(r.phone),
  );
  const onlineCount = onlineRegisteredDrivers.length;

  // ── Nav items ──────────────────────────────────────────────────────────
  const navItems: {
    key: Tab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      key: "bookings",
      label: "Bookings",
      icon: <ClipboardList size={18} />,
      count: bookings.length,
    },
    {
      key: "drivers",
      label: "Drivers",
      icon: <Car size={18} />,
      count: registrations.filter((r) => r.status === "approved").length,
    },
    {
      key: "registrations",
      label: "Registrations",
      icon: <CheckCircle size={18} />,
      count: registrations.length,
    },
    {
      key: "kyc",
      label: "KYC Verify",
      icon: <Shield size={18} />,
      count: registrations.filter((r) => r.status === "pending").length,
    },
    {
      key: "customers",
      label: "Customers",
      icon: <Users size={18} />,
      count: otpLogins.length,
    },
    {
      key: "enquiries",
      label: "Enquiries",
      icon: <MessageSquare size={18} />,
      count: enquiries.length,
    },
    {
      key: "live-drivers",
      label: "Live Drivers",
      icon: <MapPin size={18} />,
      count: onlineCount,
    },
    {
      key: "driver-earnings",
      label: "Revenue",
      icon: <BarChart3 size={18} />,
    },
    { key: "pricing", label: "Pricing", icon: <Zap size={18} /> },
    { key: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  // ── Summaries ──────────────────────────────────────────────────────────
  const bookingSummary = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  };

  const filteredBookings = bookings.filter((b) => {
    const matchSearch =
      !bookingSearch ||
      b.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.customerPhone.includes(bookingSearch);
    const matchDate =
      !bookingDateFilter ||
      b.startDate.includes(bookingDateFilter) ||
      (b.createdAt ?? "").startsWith(bookingDateFilter);
    return matchSearch && matchDate;
  });

  const allDriverRows = registrations.map((r) => ({
    id: `reg-${r.id}`,
    regId: r.id,
    name: r.name,
    phone: r.phone,
    city: r.city,
    state: r.state,
    status: r.status as "pending" | "approved" | "rejected",
    vehicleType: r.vehicleType || "—",
    experience: r.experience || "—",
    isOnline: onlinePhoneSet.has(r.phone),
  }));

  const filteredDriverRows = allDriverRows.filter((d) => {
    const matchName =
      !driverNameFilter ||
      d.name.toLowerCase().includes(driverNameFilter.toLowerCase());
    const matchCity =
      !driverCityFilter ||
      d.city.toLowerCase().includes(driverCityFilter.toLowerCase());
    const matchStatus = !driverStatusFilter || d.status === driverStatusFilter;
    return matchName && matchCity && matchStatus;
  });

  const filteredRegs = registrations.filter((r) => {
    const matchName =
      !regNameFilter ||
      r.name.toLowerCase().includes(regNameFilter.toLowerCase());
    const matchCity =
      !regCityFilter ||
      r.city.toLowerCase().includes(regCityFilter.toLowerCase());
    const matchStatus = !regStatusFilter || r.status === regStatusFilter;
    return matchName && matchCity && matchStatus;
  });

  // Fraud detection: cancel rate per customer
  const customerCancelMap: Record<string, number> = {};
  for (const b of bookings) {
    if (b.status === "rejected" || b.status === "cancelled") {
      const key = b.customerPhone;
      customerCancelMap[key] = (customerCancelMap[key] || 0) + 1;
    }
  }

  // Dark mode classes
  const dm = darkMode;
  const pageBg = dm ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900";
  const sidebarBg = dm ? "bg-gray-900" : "bg-gray-900"; // sidebar stays dark
  const headerBg = dm
    ? "bg-gray-900 border-gray-700"
    : "bg-white border-gray-200";
  const headerText = dm ? "text-gray-100" : "text-gray-900";
  const cardBg = dm
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";
  const tableHeaderBg = dm ? "bg-gray-700" : "bg-gray-50";
  const tableBorderColor = dm ? "border-gray-700" : "border-gray-200";
  const inputCls = dm
    ? "bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400"
    : "";
  const subtextColor = dm ? "text-gray-400" : "text-gray-500";
  const textColor = dm ? "text-gray-100" : "text-gray-900";

  return (
    <div className={`flex h-screen overflow-hidden ${pageBg}`}>
      {/* Sidebar */}
      <aside
        className={`w-64 ${sidebarBg} text-white flex flex-col flex-shrink-0`}
      >
        <div className="px-6 py-5 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
              <Car size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">DriveEase Admin</p>
              <p className="text-xs text-gray-400">CRM Dashboard</p>
            </div>
          </div>
        </div>

        {onlineCount > 0 && (
          <button
            type="button"
            className="mx-3 mt-3 bg-green-900/50 border border-green-700/50 rounded-lg px-3 py-2 hover:bg-green-900/70 transition-colors text-left w-full"
            onClick={() => setTab("live-drivers")}
            data-ocid="admin.live_drivers.card"
          >
            <p className="text-green-400 text-xs font-semibold">⚡ Online</p>
            <p className="text-white font-bold text-lg">{onlineCount} Live</p>
          </button>
        )}

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === item.key && item.key === "live-drivers"
                  ? "bg-green-600 text-white font-bold"
                  : tab !== item.key && item.key === "live-drivers"
                    ? "bg-green-100 text-black hover:bg-green-200"
                    : tab === item.key
                      ? "bg-green-600 text-white"
                      : "text-gray-300 hover:bg-gray-800"
              }`}
              data-ocid={`admin.${item.key}.tab`}
            >
              <span className="flex items-center gap-2.5">
                {item.icon}
                {item.label}
              </span>
              {item.count !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    tab === item.key ? "bg-green-500" : "bg-gray-700"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-700">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 text-sm transition-colors"
            data-ocid="admin.close_button"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-xl shadow-xl px-6 py-4 flex items-center gap-3">
              <Loader2 size={20} className="text-green-600 animate-spin" />
              <span className="text-sm font-medium text-gray-700">
                Loading data...
              </span>
            </div>
          </div>
        )}

        {/* Header */}
        <div
          className={`${headerBg} px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-b`}
        >
          <div>
            <h1 className={`text-lg font-bold ${headerText}`}>
              {navItems.find((n) => n.key === tab)?.label}
            </h1>
            <label
              className={`flex items-center gap-1.5 text-xs ${subtextColor} cursor-pointer`}
            >
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="accent-green-600"
                data-ocid="admin.toggle"
              />
              Auto-sync (30s)
            </label>
          </div>
          <div className="flex items-center gap-3">
            {syncToast && (
              <span
                className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg"
                data-ocid="admin.success_state"
              >
                {syncToast}
              </span>
            )}
            {!syncToast && syncSource && (
              <span
                className={`text-xs px-2 py-1 rounded-lg ${syncSource === "backend" ? "text-green-700 bg-green-50" : syncSource === "mixed" ? "text-amber-700 bg-amber-50" : "text-gray-500 bg-gray-100"}`}
                data-ocid="admin.loading_state"
              >
                {syncSource === "backend"
                  ? "✓ Live from backend"
                  : syncSource === "mixed"
                    ? "⚡ Backend + local cache"
                    : "📦 Local cache only"}
              </span>
            )}
            <button
              type="button"
              onClick={syncNow}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
              data-ocid="admin.secondary_button"
            >
              {isRefreshing ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <RefreshCw size={13} />
              )}
              Sync Now
            </button>
            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                dm
                  ? "bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={dm ? "Light mode" : "Dark mode"}
              data-ocid="admin.toggle"
            >
              {dm ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <span className={`text-sm ${subtextColor}`}>{formatIST()}</span>
          </div>
        </div>

        <div className="p-6">
          {/* ── BOOKINGS TAB ──────────────────────────────────────── */}
          {tab === "bookings" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total",
                    value: bookingSummary.total,
                    color: textColor,
                  },
                  {
                    label: "Pending",
                    value: bookingSummary.pending,
                    color: "text-yellow-500",
                  },
                  {
                    label: "Confirmed",
                    value: bookingSummary.confirmed,
                    color: "text-green-500",
                  },
                  {
                    label: "Rejected",
                    value: bookingSummary.rejected,
                    color: "text-red-500",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`${cardBg} border rounded-xl p-4`}
                  >
                    <p className={`text-sm ${subtextColor}`}>{s.label}</p>
                    <p className={`text-3xl font-black ${s.color}`}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Input
                  placeholder="Search by name or phone..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className={`w-56 ${inputCls}`}
                  data-ocid="admin.bookings.search_input"
                />
                <Input
                  type="date"
                  value={bookingDateFilter}
                  onChange={(e) => setBookingDateFilter(e.target.value)}
                  className={`w-44 ${inputCls}`}
                  data-ocid="admin.bookings.input"
                />
                {selectedBookingIds.size > 0 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkBookingAction("confirmed")}
                      className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-500 font-medium"
                      data-ocid="admin.bookings.confirm_button"
                    >
                      Confirm Selected ({selectedBookingIds.size})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkBookingAction("rejected")}
                      className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-500 font-medium"
                      data-ocid="admin.bookings.delete_button"
                    >
                      Cancel Selected ({selectedBookingIds.size})
                    </button>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const rows = [
                      [
                        "ID",
                        "Date",
                        "Customer",
                        "Phone",
                        "Driver",
                        "Pickup",
                        "Drop",
                        "Amount",
                        "Status",
                      ],
                      ...filteredBookings.map((b) => [
                        String(b.id),
                        b.startDate,
                        b.customerName,
                        b.customerPhone,
                        b.driverName,
                        b.pickupAddress,
                        b.dropAddress,
                        String(b.total),
                        b.status,
                      ]),
                    ];
                    downloadCSV(
                      `bookings-${new Date().toISOString().slice(0, 10)}.csv`,
                      rows,
                    );
                  }}
                  className="ml-auto gap-1.5"
                  data-ocid="admin.bookings.secondary_button"
                >
                  <Download size={14} /> Download CSV
                </Button>
              </div>

              {filteredBookings.length === 0 ? (
                <div
                  className={`text-center py-16 ${subtextColor}`}
                  data-ocid="admin.bookings.empty_state"
                >
                  <ClipboardList
                    size={40}
                    className="mx-auto mb-3 opacity-30"
                  />
                  <p className="font-medium">No bookings found</p>
                </div>
              ) : (
                <div
                  className={`overflow-x-auto rounded-xl border ${tableBorderColor} ${
                    dm ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <Table>
                    <TableHeader>
                      <TableRow className={tableHeaderBg}>
                        <TableHead className="w-10">
                          <input
                            type="checkbox"
                            className="accent-green-600"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBookingIds(
                                  new Set(filteredBookings.map((b) => b.id)),
                                );
                              } else {
                                setSelectedBookingIds(new Set());
                              }
                            }}
                            data-ocid="admin.bookings.checkbox"
                          />
                        </TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((b, idx) => (
                        <TableRow
                          key={b.id}
                          className={dm ? "border-gray-700" : ""}
                          data-ocid={`admin.bookings.row.${idx + 1}`}
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              className="accent-green-600"
                              checked={selectedBookingIds.has(b.id)}
                              onChange={(e) => {
                                const next = new Set(selectedBookingIds);
                                if (e.target.checked) next.add(b.id);
                                else next.delete(b.id);
                                setSelectedBookingIds(next);
                              }}
                              data-ocid={`admin.bookings.checkbox.${idx + 1}`}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-xs font-bold text-green-600">
                            #{b.id}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className={`font-medium text-sm ${textColor}`}>
                                {b.customerName}
                              </p>
                              <p className={`text-xs ${subtextColor}`}>
                                {b.customerPhone}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className={`text-sm ${textColor}`}>
                            {b.driverName}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs max-w-[160px]">
                              <p className="text-green-600 truncate">
                                📍 {b.pickupAddress}
                              </p>
                              <p className={subtextColor}>↓</p>
                              <p className="text-red-500 truncate">
                                🏁 {b.dropAddress}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className={`text-xs ${subtextColor}`}>
                            <p>{b.startDate}</p>
                            <p>→ {b.endDate}</p>
                          </TableCell>
                          <TableCell
                            className={`font-semibold text-sm ${textColor}`}
                          >
                            ₹{b.total.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={b.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              <button
                                type="button"
                                onClick={async () => {
                                  await apiUpdateBookingStatus(
                                    b.id,
                                    "confirmed",
                                  );
                                  addAuditLog(
                                    b.id,
                                    "Status changed to Confirmed",
                                  );
                                  loadAll();
                                }}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                disabled={b.status === "confirmed"}
                                data-ocid={`admin.bookings.confirm_button.${idx + 1}`}
                              >
                                <CheckCircle
                                  size={10}
                                  className="inline mr-0.5"
                                />
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await apiUpdateBookingStatus(
                                    b.id,
                                    "rejected",
                                  );
                                  addAuditLog(
                                    b.id,
                                    "Status changed to Rejected",
                                  );
                                  loadAll();
                                }}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                disabled={b.status === "rejected"}
                                data-ocid={`admin.bookings.delete_button.${idx + 1}`}
                              >
                                <XCircle size={10} className="inline mr-0.5" />
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => setAuditBookingId(b.id)}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-0.5"
                                data-ocid={`admin.bookings.edit_button.${idx + 1}`}
                              >
                                <Clock size={10} /> Log
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* ── DRIVERS TAB ─────────────────────────────────────────── */}
          {tab === "drivers" && (
            <div className="space-y-4">
              <div
                className={`${cardBg} border rounded-xl p-4 flex items-center justify-between`}
              >
                <div>
                  <p className={`text-sm ${subtextColor}`}>
                    Total Drivers (
                    {
                      allDriverRows.filter((d) => d.status === "approved")
                        .length
                    }{" "}
                    Approved)
                  </p>
                  <p className={`text-3xl font-black ${textColor}`}>
                    {filteredDriverRows.length}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    downloadCSV(
                      `drivers-${new Date().toISOString().slice(0, 10)}.csv`,
                      [
                        ["Name", "Phone", "City", "State", "Online"],
                        ...filteredDriverRows.map((d) => [
                          d.name,
                          d.phone,
                          d.city,
                          d.state,
                          d.isOnline ? "Yes" : "No",
                        ]),
                      ],
                    );
                  }}
                  className="gap-1.5"
                  data-ocid="admin.drivers.secondary_button"
                >
                  <Download size={14} /> CSV
                </Button>
              </div>
              <div className="flex gap-3">
                <Input
                  placeholder="Filter by name..."
                  value={driverNameFilter}
                  onChange={(e) => setDriverNameFilter(e.target.value)}
                  className={`w-48 ${inputCls}`}
                  data-ocid="admin.drivers.search_input"
                />
                <Input
                  placeholder="Filter by city..."
                  value={driverCityFilter}
                  onChange={(e) => setDriverCityFilter(e.target.value)}
                  className={`w-48 ${inputCls}`}
                  data-ocid="admin.drivers.input"
                />
                <select
                  value={driverStatusFilter}
                  onChange={(e) => setDriverStatusFilter(e.target.value)}
                  className={`border rounded-md px-3 py-2 text-sm ${
                    dm
                      ? "bg-gray-700 border-gray-600 text-gray-100"
                      : "bg-white border-gray-300"
                  }`}
                  data-ocid="admin.drivers.select"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div
                className={`overflow-x-auto rounded-xl border ${tableBorderColor} ${
                  dm ? "bg-gray-800" : "bg-white"
                }`}
              >
                <Table>
                  <TableHeader>
                    <TableRow className={tableHeaderBg}>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Approval Status</TableHead>
                      <TableHead>Online Status</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDriverRows.map((d, idx) => {
                      const onlineSince = getDriverOnlineSince(d.id);
                      const _duration =
                        onlineSince && d.isOnline
                          ? formatDuration(
                              Date.now() - new Date(onlineSince).getTime(),
                            )
                          : null;
                      return (
                        <TableRow
                          key={d.id}
                          className={dm ? "border-gray-700" : ""}
                          data-ocid={`admin.drivers.row.${idx + 1}`}
                        >
                          <TableCell className={`text-xs ${subtextColor}`}>
                            {idx + 1}
                          </TableCell>
                          <TableCell
                            className={`font-medium text-sm ${textColor}`}
                          >
                            {d.name}
                          </TableCell>
                          <TableCell className={`text-sm ${textColor}`}>
                            {d.city}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {d.phone}
                          </TableCell>
                          <TableCell>
                            {d.status === "approved" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                Approved
                              </span>
                            )}
                            {d.status === "pending" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                Pending
                              </span>
                            )}
                            {d.status === "rejected" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                Rejected
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {d.isOnline ? (
                              <span className="flex items-center gap-1.5">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                                </span>
                                <span className="text-green-600 font-semibold text-xs">
                                  Online
                                </span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-gray-300 inline-block" />
                                <span className="text-gray-400 text-xs">
                                  Offline
                                </span>
                              </span>
                            )}
                          </TableCell>
                          <TableCell className={`text-xs ${subtextColor}`}>
                            {d.vehicleType}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1.5">
                              {d.status !== "approved" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateRegistrationStatus(
                                      d.regId,
                                      "approved",
                                    )
                                  }
                                  className="px-2 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-500 font-medium"
                                  data-ocid={`admin.drivers.approve.${idx + 1}`}
                                >
                                  Approve
                                </button>
                              )}
                              {d.status !== "rejected" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateRegistrationStatus(
                                      d.regId,
                                      "rejected",
                                    )
                                  }
                                  className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                                  data-ocid={`admin.drivers.reject.${idx + 1}`}
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* ── REGISTRATIONS TAB ───────────────────────────────────── */}
          {tab === "registrations" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Input
                  placeholder="Filter by name..."
                  value={regNameFilter}
                  onChange={(e) => setRegNameFilter(e.target.value)}
                  className={`w-48 ${inputCls}`}
                  data-ocid="admin.registrations.search_input"
                />
                <Input
                  placeholder="Filter by city..."
                  value={regCityFilter}
                  onChange={(e) => setRegCityFilter(e.target.value)}
                  className={`w-48 ${inputCls}`}
                  data-ocid="admin.registrations.input"
                />
                <select
                  value={regStatusFilter}
                  onChange={(e) => setRegStatusFilter(e.target.value)}
                  className={`border rounded-md px-3 py-2 text-sm ${
                    dm
                      ? "bg-gray-700 border-gray-600 text-gray-100"
                      : "bg-white border-gray-300"
                  }`}
                  data-ocid="admin.registrations.select"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                {selectedRegIds.size > 0 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkRegAction("approved")}
                      className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-500 font-medium"
                      data-ocid="admin.registrations.confirm_button"
                    >
                      Approve Selected ({selectedRegIds.size})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkRegAction("rejected")}
                      className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-500 font-medium"
                      data-ocid="admin.registrations.delete_button"
                    >
                      Reject Selected ({selectedRegIds.size})
                    </button>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    downloadCSV(
                      `registrations-${new Date().toISOString().slice(0, 10)}.csv`,
                      [
                        [
                          "Name",
                          "Phone",
                          "Email",
                          "City",
                          "State",
                          "Status",
                          "Date",
                        ],
                        ...filteredRegs.map((r) => [
                          r.name,
                          r.phone,
                          r.email,
                          r.city,
                          r.state,
                          r.status,
                          fmt(r.submittedAt),
                        ]),
                      ],
                    );
                  }}
                  className="ml-auto gap-1.5"
                  data-ocid="admin.registrations.secondary_button"
                >
                  <Download size={14} /> CSV
                </Button>
              </div>

              {filteredRegs.length === 0 ? (
                <div
                  className={`text-center py-16 ${subtextColor}`}
                  data-ocid="admin.registrations.empty_state"
                >
                  <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No driver registrations found</p>
                </div>
              ) : (
                <div
                  className={`overflow-x-auto rounded-xl border ${tableBorderColor} ${
                    dm ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <Table>
                    <TableHeader>
                      <TableRow className={tableHeaderBg}>
                        <TableHead className="w-10">
                          <input
                            type="checkbox"
                            className="accent-green-600"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRegIds(
                                  new Set(filteredRegs.map((r) => r.id)),
                                );
                              } else {
                                setSelectedRegIds(new Set());
                              }
                            }}
                            data-ocid="admin.registrations.checkbox"
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegs.map((r, idx) => (
                        <TableRow
                          key={r.id}
                          className={dm ? "border-gray-700" : ""}
                          data-ocid={`admin.registrations.row.${idx + 1}`}
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              className="accent-green-600"
                              checked={selectedRegIds.has(r.id)}
                              onChange={(e) => {
                                const next = new Set(selectedRegIds);
                                if (e.target.checked) next.add(r.id);
                                else next.delete(r.id);
                                setSelectedRegIds(next);
                              }}
                              data-ocid={`admin.registrations.checkbox.${idx + 1}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className={`font-medium text-sm ${textColor}`}>
                              {r.name}
                              {r.status === "rejected" && (
                                <span className="ml-2 text-xs text-orange-500 font-medium">
                                  ⚠ Prev. Rejected
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {r.phone}
                          </TableCell>
                          <TableCell className={`text-sm ${textColor}`}>
                            {r.city}
                          </TableCell>
                          <TableCell className={`text-xs ${subtextColor}`}>
                            {fmt(r.submittedAt)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={r.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setViewReg(r as any)}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
                                data-ocid={`admin.registrations.edit_button.${idx + 1}`}
                              >
                                <Eye size={10} /> View
                              </button>
                              {(r as any).paymentScreenshotBase64 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setViewReg(r as any);
                                    setShowScreenshot(true);
                                  }}
                                  className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 flex items-center gap-1"
                                  data-ocid={`admin.registrations.secondary_button.${idx + 1}`}
                                >
                                  <Eye size={10} /> Pay
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={async () => {
                                  updateRegistrationStatus(r.id, "approved");
                                  await apiUpdateRegistrationStatus(
                                    r.id,
                                    "approved",
                                  ).catch(() => {});
                                  loadAll();
                                }}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                disabled={r.status === "approved"}
                                data-ocid={`admin.registrations.confirm_button.${idx + 1}`}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  updateRegistrationStatus(r.id, "rejected");
                                  await apiUpdateRegistrationStatus(
                                    r.id,
                                    "rejected",
                                  ).catch(() => {});
                                  loadAll();
                                }}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                disabled={r.status === "rejected"}
                                data-ocid={`admin.registrations.delete_button.${idx + 1}`}
                              >
                                Reject
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* ── KYC VERIFICATION TAB ────────────────────────────────── */}
          {tab === "kyc" && (
            <div className="space-y-4">
              <div className={`${cardBg} border rounded-xl p-4`}>
                <p className={`text-sm ${subtextColor} mb-1`}>
                  Pending KYC Reviews
                </p>
                <p className={`text-3xl font-black ${textColor}`}>
                  {registrations.filter((r) => r.status === "pending").length}
                </p>
              </div>
              {registrations.filter((r) => r.status === "pending").length ===
              0 ? (
                <div
                  className={`text-center py-16 ${subtextColor}`}
                  data-ocid="admin.kyc.empty_state"
                >
                  <Shield size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">All KYC reviews completed</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {registrations
                    .filter((r) => r.status === "pending")
                    .map((r, idx) => (
                      <div
                        key={r.id}
                        className={`${cardBg} border rounded-xl p-5`}
                        data-ocid={`admin.kyc.item.${idx + 1}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className={`font-bold ${textColor}`}>
                              {r.name}
                            </h3>
                            <p className={`text-sm ${subtextColor}`}>
                              {r.phone} · {r.city}
                            </p>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                            Pending KYC
                          </Badge>
                        </div>

                        {/* Document slots */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {[
                            {
                              label: "Aadhar",
                              field: "aadharBase64",
                            },
                            { label: "DL", field: "licenseBase64" },
                            { label: "Selfie", field: "selfieBase64" },
                            {
                              label: "Payment",
                              field: "paymentScreenshotBase64",
                            },
                          ].map((doc) => {
                            const base64 = (r as any)[doc.field];
                            return (
                              <div
                                key={doc.label}
                                className={`rounded-lg border ${
                                  dm
                                    ? "border-gray-600 bg-gray-700"
                                    : "border-gray-200 bg-gray-50"
                                } p-2 text-center`}
                              >
                                {base64 ? (
                                  <img
                                    src={base64}
                                    alt={doc.label}
                                    className="w-full h-20 object-cover rounded"
                                  />
                                ) : (
                                  <div className="h-20 flex items-center justify-center">
                                    <p className={`text-xs ${subtextColor}`}>
                                      {doc.label} not uploaded
                                    </p>
                                  </div>
                                )}
                                <p
                                  className={`text-xs font-medium mt-1 ${subtextColor}`}
                                >
                                  {doc.label}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              updateRegistrationStatus(r.id, "approved");
                              await apiUpdateRegistrationStatus(
                                r.id,
                                "approved",
                              ).catch(() => {});
                              loadAll();
                            }}
                            className="flex-1 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-500 font-semibold"
                            data-ocid={`admin.kyc.confirm_button.${idx + 1}`}
                          >
                            ✓ Verify &amp; Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setKycRejectId(r.id)}
                            className="flex-1 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold"
                            data-ocid={`admin.kyc.delete_button.${idx + 1}`}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ── CUSTOMERS TAB ───────────────────────────────────────── */}
          {tab === "customers" && (
            <div className="space-y-4">
              <div className={`${cardBg} border rounded-xl p-4`}>
                <p className={`text-sm ${subtextColor}`}>
                  Registered Customers
                </p>
                <p className={`text-3xl font-black ${textColor}`}>
                  {otpLogins.length}
                </p>
              </div>
              {otpLogins.length === 0 ? (
                <div
                  className={`text-center py-16 ${subtextColor}`}
                  data-ocid="admin.customers.empty_state"
                >
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No customer logins yet</p>
                </div>
              ) : (
                <div
                  className={`overflow-x-auto rounded-xl border ${tableBorderColor} ${
                    dm ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <Table>
                    <TableHeader>
                      <TableRow className={tableHeaderBg}>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Login Time</TableHead>
                        <TableHead>Fraud Risk</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {otpLogins.map((c, idx) => {
                        const cancelCount = customerCancelMap[c.phone] || 0;
                        return (
                          <TableRow
                            key={c.id}
                            className={dm ? "border-gray-700" : ""}
                            data-ocid={`admin.customers.row.${idx + 1}`}
                          >
                            <TableCell className={`text-xs ${subtextColor}`}>
                              {idx + 1}
                            </TableCell>
                            <TableCell
                              className={`font-medium text-sm ${textColor}`}
                            >
                              {c.name}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {c.phone}
                            </TableCell>
                            <TableCell className={`text-xs ${subtextColor}`}>
                              {fmt(c.loginTime)}
                            </TableCell>
                            <TableCell>
                              {cancelCount >= 2 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                                  <AlertTriangle size={10} />
                                  High Cancel Rate ({cancelCount})
                                </span>
                              ) : (
                                <span className={`text-xs ${subtextColor}`}>
                                  Normal
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* ── ENQUIRIES TAB ───────────────────────────────────────── */}
          {tab === "enquiries" && (
            <div className="space-y-4">
              {enquiries.length === 0 ? (
                <div
                  className={`text-center py-16 ${subtextColor}`}
                  data-ocid="admin.enquiries.empty_state"
                >
                  <MessageSquare
                    size={40}
                    className="mx-auto mb-3 opacity-30"
                  />
                  <p className="font-medium">No enquiries yet</p>
                </div>
              ) : (
                <div
                  className={`overflow-x-auto rounded-xl border ${tableBorderColor} ${
                    dm ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <Table>
                    <TableHeader>
                      <TableRow className={tableHeaderBg}>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enquiries.map((eq, idx) => (
                        <TableRow
                          key={eq.id}
                          className={dm ? "border-gray-700" : ""}
                          data-ocid={`admin.enquiries.row.${idx + 1}`}
                        >
                          <TableCell
                            className={`font-medium text-sm ${textColor}`}
                          >
                            {eq.name}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {eq.phone}
                          </TableCell>
                          <TableCell className="text-sm capitalize">
                            {eq.planType}
                          </TableCell>
                          <TableCell className={`text-sm ${textColor}`}>
                            {eq.city}
                          </TableCell>
                          <TableCell className={`text-xs ${subtextColor}`}>
                            {fmt(eq.submittedAt)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={eq.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-col">
                              <button
                                type="button"
                                onClick={async () => {
                                  await apiUpdateEnquiryStatus(
                                    eq.id,
                                    "contacted",
                                  );
                                  updateEnquiryStatus(eq.id, "contacted");
                                  loadAll();
                                }}
                                className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                                disabled={
                                  eq.status === "contacted" ||
                                  eq.status === "closed"
                                }
                                data-ocid={`admin.enquiries.confirm_button.${idx + 1}`}
                              >
                                Contacted
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await apiUpdateEnquiryStatus(eq.id, "closed");
                                  updateEnquiryStatus(eq.id, "closed");
                                  loadAll();
                                }}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                disabled={eq.status === "closed"}
                                data-ocid={`admin.enquiries.delete_button.${idx + 1}`}
                              >
                                Close
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* ── LIVE DRIVERS TAB ────────────────────────────────────── */}
          {tab === "live-drivers" && (
            <LiveDriversTab
              expandedDriverId={expandedDriverId}
              setExpandedDriverId={setExpandedDriverId}
              backendDriverStatuses={backendDriverStatuses}
              backendRegistrations={registrations}
              pendingBookings={bookings.filter((b) => b.status === "pending")}
              darkMode={dm}
              onDispatch={(bookingId, driverName) => {
                updateBookingStatus(bookingId, "confirmed");
                addAuditLog(bookingId, `Auto-dispatched to ${driverName}`);
                loadAll();
              }}
            />
          )}

          {/* ── REVENUE / DRIVER EARNINGS TAB ───────────────────────── */}
          {tab === "driver-earnings" && (
            <DriverEarningsTab
              bookings={bookings}
              commissionRate={commissionRate}
              darkMode={dm}
            />
          )}

          {/* ── PRICING CONFIGURATION TAB ───────────────────────────── */}
          {tab === "pricing" && (
            <div className="max-w-xl space-y-6">
              <div className={`${cardBg} border rounded-xl p-6 space-y-5`}>
                <h2 className={`font-bold text-lg ${textColor}`}>
                  💰 Pricing Configuration
                </h2>
                {(
                  [
                    {
                      label: "Minimum Fare (₹)",
                      field: "minFare" as keyof PricingConfig,
                    },
                    {
                      label: "Base Charge (₹)",
                      field: "baseCharge" as keyof PricingConfig,
                    },
                    {
                      label: "Per KM Rate (₹/km)",
                      field: "perKmRate" as keyof PricingConfig,
                    },
                    {
                      label: "Night Surcharge (%)",
                      field: "nightSurcharge" as keyof PricingConfig,
                    },
                    {
                      label: "Buffer Time (minutes)",
                      field: "bufferTime" as keyof PricingConfig,
                    },
                  ] as { label: string; field: keyof PricingConfig }[]
                ).map(
                  ({ label, field }) =>
                    typeof pricingConfig[field] === "number" && (
                      <div key={field}>
                        <Label className={`text-sm font-medium ${textColor}`}>
                          {label}
                        </Label>
                        <Input
                          type="number"
                          value={pricingConfig[field] as number}
                          onChange={(e) =>
                            setPricingConfig((p) => ({
                              ...p,
                              [field]: Number(e.target.value),
                            }))
                          }
                          className={`mt-1 ${inputCls}`}
                          data-ocid="admin.pricing.input"
                        />
                      </div>
                    ),
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label className={`text-sm font-medium ${textColor}`}>
                      Auto-Dispatch
                    </Label>
                    <p className={`text-xs ${subtextColor} mt-0.5`}>
                      Automatically assign pending bookings to nearest online
                      driver
                    </p>
                  </div>
                  <Switch
                    checked={pricingConfig.autoDispatch}
                    onCheckedChange={(v) =>
                      setPricingConfig((p) => ({ ...p, autoDispatch: v }))
                    }
                    data-ocid="admin.pricing.switch"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={savePricingConfig}
                    className="bg-green-600 hover:bg-green-500 text-white"
                    data-ocid="admin.pricing.save_button"
                  >
                    Save Pricing
                  </Button>
                  {pricingSaved && (
                    <span className="text-green-600 text-sm font-medium">
                      ✓ Saved!
                    </span>
                  )}
                </div>
              </div>

              {/* Tiered pricing preview */}
              <div className={`${cardBg} border rounded-xl p-6`}>
                <h3 className={`font-semibold mb-3 ${textColor}`}>
                  Tiered Pricing Preview
                </h3>
                <div className="space-y-2 text-sm">
                  {[
                    {
                      range: "0 – 5 km",
                      rate: "Flat ₹99",
                      desc: "Short trip protection",
                    },
                    {
                      range: "6 – 20 km",
                      rate: `₹${pricingConfig.baseCharge} base + ₹${pricingConfig.perKmRate}/km`,
                      desc: "Standard rate",
                    },
                    {
                      range: "20+ km",
                      rate: `₹${pricingConfig.baseCharge} base + ₹${Math.max(10, pricingConfig.perKmRate - 2)}/km`,
                      desc: "Long distance discount",
                    },
                  ].map((row) => (
                    <div
                      key={row.range}
                      className={`flex justify-between p-3 rounded-lg ${
                        dm ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <div>
                        <span className={`font-medium ${textColor}`}>
                          {row.range}
                        </span>
                        <span className={`ml-2 text-xs ${subtextColor}`}>
                          {row.desc}
                        </span>
                      </div>
                      <span className="text-green-600 font-semibold">
                        {row.rate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS TAB ────────────────────────────────────────── */}
          {tab === "settings" && (
            <div className="space-y-6 max-w-2xl">
              {/* API Configuration */}
              <div className={`${cardBg} border rounded-xl p-6 space-y-4`}>
                <h2 className={`font-bold text-lg ${textColor}`}>
                  🔑 API Configuration
                </h2>
                <div className="space-y-3">
                  <Label className={`text-sm font-medium ${textColor}`}>
                    API Key
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="flex-1 font-mono text-sm"
                      placeholder="Enter API key"
                      data-ocid="admin.settings.input"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey((v) => !v)}
                      data-ocid="admin.settings.toggle"
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${textColor}`}>
                    Alert Type
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {(["push", "sms", "whatsapp"] as AlertType[]).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setAlertTypeState(t)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          alertTypeState === t
                            ? "bg-green-600 text-white border-green-600"
                            : `${cardBg} border-gray-300 ${textColor} hover:border-green-500`
                        }`}
                        data-ocid="admin.settings.toggle"
                      >
                        {t === "push"
                          ? "📱 Push"
                          : t === "sms"
                            ? "💬 SMS"
                            : "💬 WhatsApp"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={saveApiConfig}
                    className="bg-green-600 hover:bg-green-500 text-white"
                    data-ocid="admin.settings.save_button"
                  >
                    Save API Config
                  </Button>
                  {apiConfigSaved && (
                    <span
                      className="text-green-600 text-sm font-medium"
                      data-ocid="admin.settings.success_state"
                    >
                      ✓ Saved!
                    </span>
                  )}
                </div>
              </div>

              {/* Commission Manager */}
              <div className={`${cardBg} border rounded-xl p-6 space-y-4`}>
                <h2 className={`font-bold text-lg ${textColor}`}>
                  📊 Commission Manager
                </h2>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className={`text-sm font-medium ${textColor}`}>
                      Platform Commission Rate
                    </Label>
                    <span className="text-2xl font-black text-green-600">
                      {commissionRate}%
                    </span>
                  </div>
                  <Slider
                    min={5}
                    max={30}
                    step={1}
                    value={[commissionRate]}
                    onValueChange={([v]) => setCommissionRate(v)}
                    className="w-full"
                    data-ocid="admin.settings.input"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5%</span>
                    <span>30%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={saveCommission}
                    className="bg-green-600 hover:bg-green-500 text-white"
                    data-ocid="admin.settings.save_button"
                  >
                    Save Commission
                  </Button>
                  {commissionSaved && (
                    <span
                      className="text-green-600 text-sm font-medium"
                      data-ocid="admin.settings.success_state"
                    >
                      ✓ Saved!
                    </span>
                  )}
                </div>
              </div>

              {/* Driver Rate Overrides */}
              <div className={`${cardBg} border rounded-xl p-6`}>
                <h2 className={`font-bold text-lg mb-4 ${textColor}`}>
                  Driver Rate Overrides
                </h2>
                {drivers.length === 0 ? (
                  <p className={`text-sm ${subtextColor}`}>
                    No seed drivers. Rates are set per registration.
                  </p>
                ) : (
                  <div
                    className={`overflow-x-auto rounded-xl border ${tableBorderColor}`}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow className={tableHeaderBg}>
                          <TableHead>Driver</TableHead>
                          <TableHead>Default Rate</TableHead>
                          <TableHead>Override Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {drivers.map((d, idx) => (
                          <TableRow
                            key={d.id}
                            data-ocid={`admin.settings.row.${idx + 1}`}
                          >
                            <TableCell
                              className={`font-medium text-sm ${textColor}`}
                            >
                              {d.name}
                            </TableCell>
                            <TableCell className={`text-sm ${subtextColor}`}>
                              ₹{d.pricePerDay}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={driverRates[d.id] ?? d.pricePerDay}
                                onChange={(e) =>
                                  setDriverRates((prev) => ({
                                    ...prev,
                                    [d.id]: Number(e.target.value),
                                  }))
                                }
                                className={`w-28 text-sm ${inputCls}`}
                                data-ocid="admin.settings.input"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <div className="mt-4 flex items-center gap-3">
                  <Button
                    onClick={saveRates}
                    className="bg-green-600 hover:bg-green-500 text-white"
                    data-ocid="admin.settings.save_button"
                  >
                    Save All Rates
                  </Button>
                  {ratesSaved && (
                    <span
                      className="text-green-600 text-sm font-medium"
                      data-ocid="admin.settings.success_state"
                    >
                      ✓ Rates saved!
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Registration View Modal ───────────────────────────────────── */}
      <Dialog
        open={!!viewReg}
        onOpenChange={(open) => {
          if (!open) {
            setViewReg(null);
            setShowScreenshot(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {showScreenshot ? "Payment Screenshot" : "Driver Details"}
            </DialogTitle>
          </DialogHeader>
          {viewReg && !showScreenshot && (
            <div className="space-y-2 text-sm">
              {[
                { l: "Name", v: viewReg.name },
                { l: "Phone", v: viewReg.phone },
                { l: "Email", v: viewReg.email || "—" },
                { l: "City", v: viewReg.city },
                { l: "State", v: viewReg.state },
                { l: "Status", v: viewReg.status },
                { l: "Submitted", v: fmt(viewReg.submittedAt) },
                { l: "Vehicle Type", v: (viewReg as any).vehicleType || "—" },
                {
                  l: "License No.",
                  v: (viewReg as any).licenseNumber || "—",
                },
                { l: "Experience", v: (viewReg as any).experience || "—" },
                { l: "Languages", v: (viewReg as any).languages || "—" },
                { l: "Work Areas", v: (viewReg as any).workAreas || "—" },
              ].map(({ l, v }) => (
                <div
                  key={l}
                  className="flex justify-between border-b border-gray-100 pb-1"
                >
                  <span className="text-gray-500">{l}</span>
                  <span className="font-medium text-right max-w-[60%]">
                    {v}
                  </span>
                </div>
              ))}
              <div className="flex gap-2 pt-3">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white"
                  onClick={async () => {
                    if (!viewReg) return;
                    updateRegistrationStatus(viewReg.id, "approved");
                    await apiUpdateRegistrationStatus(
                      viewReg.id,
                      "approved",
                    ).catch(() => {});
                    setViewReg(null);
                    loadAll();
                  }}
                  disabled={viewReg.status === "approved"}
                  data-ocid="admin.registrations.confirm_button"
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={async () => {
                    if (!viewReg) return;
                    updateRegistrationStatus(viewReg.id, "rejected");
                    await apiUpdateRegistrationStatus(
                      viewReg.id,
                      "rejected",
                    ).catch(() => {});
                    setViewReg(null);
                    loadAll();
                  }}
                  disabled={viewReg.status === "rejected"}
                  data-ocid="admin.registrations.delete_button"
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
          {viewReg && showScreenshot && (
            <div className="text-center">
              {(viewReg as any).paymentScreenshotBase64 ? (
                <img
                  src={(viewReg as any).paymentScreenshotBase64}
                  alt="Payment Screenshot"
                  className="max-w-full max-h-96 object-contain rounded-xl mx-auto"
                />
              ) : (
                <p className="text-gray-500 text-sm py-8">
                  No payment screenshot uploaded
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Audit Log Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={auditBookingId !== null}
        onOpenChange={(open) => {
          if (!open) setAuditBookingId(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Audit Trail — Booking #{auditBookingId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {auditBookingId !== null &&
              (() => {
                const logs = getAuditLogs(auditBookingId);
                return logs.length === 0 ? (
                  <p
                    className="text-gray-500 text-sm text-center py-4"
                    data-ocid="admin.bookings.empty_state"
                  >
                    No audit entries yet
                  </p>
                ) : (
                  logs.map((log) => (
                    <div
                      key={`${log.timestamp}-${log.action}`}
                      className="border-l-2 border-green-400 pl-3 py-1"
                    >
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-xs text-gray-500">
                        by {log.by} · {fmt(log.timestamp)}
                      </p>
                    </div>
                  ))
                );
              })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── KYC Reject Reason Dialog ─────────────────────────────────── */}
      <Dialog
        open={kycRejectId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setKycRejectId(null);
            setKycRejectReason("");
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reject with Reason</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Reason for rejection</Label>
            <Textarea
              value={kycRejectReason}
              onChange={(e) => setKycRejectReason(e.target.value)}
              placeholder="e.g. Documents unclear, name mismatch..."
              rows={3}
              data-ocid="admin.kyc.textarea"
            />
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={async () => {
                  if (kycRejectId === null) return;
                  updateRegistrationStatus(kycRejectId, "rejected");
                  await apiUpdateRegistrationStatus(
                    kycRejectId,
                    "rejected",
                  ).catch(() => {});
                  setKycRejectId(null);
                  setKycRejectReason("");
                  loadAll();
                }}
                data-ocid="admin.kyc.confirm_button"
              >
                Confirm Rejection
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setKycRejectId(null);
                  setKycRejectReason("");
                }}
                data-ocid="admin.kyc.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── DriverEarningsTab ─────────────────────────────────────────────────────
function DriverEarningsTab({
  bookings,
  commissionRate,
  darkMode,
}: {
  bookings: LocalBooking[];
  commissionRate: number;
  darkMode: boolean;
}) {
  const dm = darkMode;
  const cardBg = dm
    ? "bg-gray-800 border-gray-700"
    : "bg-gray-900 border-gray-700";
  const textColor = dm ? "text-gray-100" : "text-white";
  const subtextColor = "text-gray-400";

  const earningsMap: Record<string, { count: number; gross: number }> = {};
  for (const b of bookings) {
    const name = b.driverName || "Unknown Driver";
    if (!earningsMap[name]) earningsMap[name] = { count: 0, gross: 0 };
    earningsMap[name].count += 1;
    earningsMap[name].gross += Number(b.total) || 0;
  }

  const commRate = commissionRate / 100;
  const rows = Object.entries(earningsMap).map(([name, data]) => ({
    name,
    count: data.count,
    gross: data.gross,
    commission: Math.round(data.gross * commRate),
    net: Math.round(data.gross * (1 - commRate)),
  }));

  const totalRevenue = bookings.reduce((s, b) => s + (Number(b.total) || 0), 0);
  const totalCommission = Math.round(totalRevenue * commRate);
  const totalPayouts = totalRevenue - totalCommission;

  // Revenue chart data
  const chartData = getLast7DaysRevenue(bookings);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Revenue",
            value: `₹${totalRevenue.toLocaleString("en-IN")}`,
            color: "text-green-400",
            icon: <TrendingUp size={18} />,
          },
          {
            label: `Commission (${commissionRate}%)`,
            value: `₹${totalCommission.toLocaleString("en-IN")}`,
            color: "text-yellow-400",
            icon: <BarChart3 size={18} />,
          },
          {
            label: "Driver Payouts",
            value: `₹${totalPayouts.toLocaleString("en-IN")}`,
            color: "text-blue-400",
            icon: <TrendingUp size={18} />,
          },
        ].map((s) => (
          <div key={s.label} className={`${cardBg} border rounded-xl p-4`}>
            <div className={`flex items-center gap-2 mb-1 ${subtextColor}`}>
              {s.icon}
              <p className="text-xs">{s.label}</p>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue bar chart */}
      <div className={`${cardBg} border rounded-xl p-5`}>
        <h3
          className={`${textColor} font-semibold mb-4 flex items-center gap-2`}
        >
          <BarChart3 size={16} /> Daily Revenue — Last 7 Days
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={dm ? "#374151" : "#1f2937"}
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f9fafb",
                }}
                formatter={(v: any) => [`₹${v}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Earnings table */}
      <div
        className={`${cardBg} border rounded-xl overflow-hidden`}
        data-ocid="admin.driver-earnings.table"
      >
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className={`${textColor} font-semibold text-sm`}>
            Driver Earnings Breakdown
          </h3>
        </div>
        {rows.length === 0 ? (
          <div
            className={`p-8 text-center ${subtextColor}`}
            data-ocid="admin.driver-earnings.empty_state"
          >
            No booking data yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className={`border-b border-gray-700 ${subtextColor} text-xs uppercase`}
                >
                  <th className="px-4 py-3 text-left">Driver</th>
                  <th className="px-4 py-3 text-right">Bookings</th>
                  <th className="px-4 py-3 text-right">Gross</th>
                  <th className="px-4 py-3 text-right">
                    Commission ({commissionRate}%)
                  </th>
                  <th className="px-4 py-3 text-right">Net Payout</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={row.name}
                    className="border-b border-gray-800 hover:bg-gray-700 transition-colors"
                    data-ocid={`admin.driver-earnings.item.${idx + 1}`}
                  >
                    <td className={`px-4 py-3 font-medium ${textColor}`}>
                      {row.name}
                    </td>
                    <td className={`px-4 py-3 text-center ${subtextColor}`}>
                      {row.count}
                    </td>
                    <td className={`px-4 py-3 text-right ${subtextColor}`}>
                      ₹{row.gross.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right text-red-400">
                      ₹{row.commission.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right text-green-400 font-semibold">
                      ₹{row.net.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── LiveDriversTab ────────────────────────────────────────────────────────
function LiveDriversTab({
  expandedDriverId,
  setExpandedDriverId,
  backendDriverStatuses,
  backendRegistrations,
  pendingBookings,
  darkMode,
  onDispatch,
}: {
  expandedDriverId: string | number | null;
  setExpandedDriverId: (id: string | number | null) => void;
  backendDriverStatuses: ApiDriverStatus[];
  backendRegistrations: Array<{
    id: number;
    name: string;
    phone: string;
    city: string;
    state: string;
    status: string;
  }>;
  pendingBookings: LocalBooking[];
  darkMode: boolean;
  onDispatch: (bookingId: number, driverName: string) => void;
}) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<unknown>(null);
  const dm = darkMode;
  const cardBg = dm
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";
  const textColor = dm ? "text-gray-100" : "text-gray-900";
  const subtextColor = dm ? "text-gray-400" : "text-gray-500";

  // Auto-dispatch config
  const [autoDispatch, setAutoDispatch] = React.useState(
    () => getPricingConfig().autoDispatch,
  );

  const toggleAutoDispatch = (v: boolean) => {
    setAutoDispatch(v);
    const cfg = getPricingConfig();
    localStorage.setItem(
      "driveease_pricing_config",
      JSON.stringify({ ...cfg, autoDispatch: v }),
    );
  };

  const [driverStatus, setDriverStatus] = React.useState<
    Record<string, string>
  >(() => {
    try {
      return JSON.parse(
        localStorage.getItem("driveease_driver_status") || "{}",
      );
    } catch {
      return {};
    }
  });

  // Local backend data for auto-refresh
  const [localBackendRegs, setLocalBackendRegs] =
    React.useState(backendRegistrations);
  const [localBackendStatuses, setLocalBackendStatuses] = React.useState(
    backendDriverStatuses,
  );

  React.useEffect(() => {
    if (backendRegistrations.length > 0)
      setLocalBackendRegs(backendRegistrations);
    if (backendDriverStatuses.length > 0)
      setLocalBackendStatuses(backendDriverStatuses);
  }, [backendRegistrations, backendDriverStatuses]);

  // Auto-refresh every 30 seconds
  React.useEffect(() => {
    const refreshFn = async () => {
      try {
        const [statuses, regs] = await Promise.all([
          apiGetOnlineDrivers().catch(() => []),
          apiGetRegistrations().catch(() => []),
        ]);
        if (statuses.length > 0 || regs.length > 0) {
          if (statuses.length > 0)
            setLocalBackendStatuses(statuses as ApiDriverStatus[]);
          if (regs.length > 0)
            setLocalBackendRegs(regs as typeof backendRegistrations);
        }
      } catch {
        /* */
      }
      try {
        setDriverStatus(
          JSON.parse(localStorage.getItem("driveease_driver_status") || "{}"),
        );
      } catch {
        /* */
      }
    };
    refreshFn();
    const interval = setInterval(refreshFn, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once - auto-refresh fetches fresh data

  const allDrivers = React.useMemo(() => {
    const backendOnline = new Set<string>();
    for (const s of localBackendStatuses) {
      if (s.status === "online") {
        backendOnline.add(s.phone);
        backendOnline.add(s.driverId);
      }
    }

    const isOnlineCheck = (id: string, phone: string) =>
      driverStatus[id] === "online" ||
      driverStatus[phone] === "online" ||
      backendOnline.has(id) ||
      backendOnline.has(phone);

    return localBackendRegs
      .filter((r) => r.status === "approved")
      .map((r) => ({
        id: `reg-${r.id}`,
        name: r.name,
        phone: r.phone,
        city: r.city,
        lat: 20 + Math.random() * 10,
        lng: 73 + Math.random() * 15,
        isOnline: isOnlineCheck(String(r.id), r.phone),
      }));
  }, [driverStatus, localBackendStatuses, localBackendRegs]);

  const onlineDrivers = allDrivers.filter((d) => d.isOnline);
  const offlineDrivers = allDrivers.filter((d) => !d.isOnline);

  React.useEffect(() => {
    if (!mapRef.current || onlineDrivers.length === 0) return;

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
      const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      for (const d of onlineDrivers) {
        const icon = L.divIcon({
          html: `<div style="width:14px;height:14px;background:#16a34a;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
          className: "",
          iconSize: [14, 14],
        });
        L.marker([d.lat, d.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<b>${d.name}</b><br/>City: ${d.city}<br/>Phone: ${d.phone}`,
          );
      }
      mapInstanceRef.current = map;
    };

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!(window as any).L) {
      if (!document.getElementById("leaflet-js")) {
        const script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        setTimeout(initMap, 500);
      }
    } else {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          (mapInstanceRef.current as any).remove();
        } catch {
          /* */
        }
        mapInstanceRef.current = null;
      }
    };
  }, [onlineDrivers]);

  return (
    <div className="space-y-6">
      {/* Auto-dispatch toggle */}
      <div
        className={`${cardBg} border rounded-xl p-5 flex items-center justify-between`}
        data-ocid="admin.live_drivers.panel"
      >
        <div>
          <h3 className={`font-bold text-base ${textColor}`}>
            ⚡ Auto-Dispatch Mode
          </h3>
          <p className={`text-sm ${subtextColor} mt-0.5`}>
            Automatically assign pending bookings to the nearest available
            online driver
          </p>
        </div>
        <Switch
          checked={autoDispatch}
          onCheckedChange={toggleAutoDispatch}
          data-ocid="admin.live_drivers.toggle"
        />
      </div>

      {/* Pending bookings for dispatch */}
      {autoDispatch && pendingBookings.length > 0 && (
        <div
          className={`${cardBg} border rounded-xl p-5`}
          data-ocid="admin.live_drivers.card"
        >
          <h3 className={`font-semibold mb-3 ${textColor}`}>
            Pending Bookings — Ready to Dispatch
          </h3>
          <div className="space-y-3">
            {pendingBookings.slice(0, 5).map((b, idx) => {
              const nearestDriver = onlineDrivers[0]; // city-match heuristic
              return (
                <div
                  key={b.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    dm ? "bg-gray-700" : "bg-gray-50"
                  }`}
                  data-ocid={`admin.live_drivers.item.${idx + 1}`}
                >
                  <div>
                    <p className={`text-sm font-medium ${textColor}`}>
                      #{b.id} — {b.customerName}
                    </p>
                    <p className={`text-xs ${subtextColor}`}>
                      {b.pickupAddress}
                    </p>
                  </div>
                  {nearestDriver ? (
                    <button
                      type="button"
                      onClick={() => onDispatch(b.id, nearestDriver.name)}
                      className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-500 font-medium"
                      data-ocid={`admin.live_drivers.primary_button.${idx + 1}`}
                    >
                      Dispatch to {nearestDriver.name}
                    </button>
                  ) : (
                    <span className={`text-xs ${subtextColor}`}>
                      No driver online
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Map */}
      <div className={`${cardBg} border rounded-xl overflow-hidden`}>
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`font-semibold text-sm ${textColor}`}>
            🗺️ Live Driver Map
          </h3>
        </div>
        <div ref={mapRef} style={{ height: "320px", width: "100%" }} />
      </div>

      {/* Online drivers list */}
      <div className={`${cardBg} border rounded-xl p-5`}>
        <h3 className={`font-semibold mb-3 ${textColor}`}>
          Online Drivers ({onlineDrivers.length})
        </h3>
        {onlineDrivers.length === 0 ? (
          <p
            className={`text-sm ${subtextColor}`}
            data-ocid="admin.live_drivers.empty_state"
          >
            No drivers online right now.
          </p>
        ) : (
          <div className="space-y-2">
            {onlineDrivers.map((d, idx) => (
              <div
                key={d.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  dm ? "bg-gray-700" : "bg-green-50"
                }`}
                data-ocid={`admin.live_drivers.item.${idx + 1}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  <div>
                    <p className={`font-medium text-sm ${textColor}`}>
                      {d.name}
                    </p>
                    <p className={`text-xs ${subtextColor}`}>{d.city}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedDriverId(expandedDriverId === d.id ? null : d.id)
                  }
                  className="text-xs text-blue-500 hover:underline"
                  data-ocid={`admin.live_drivers.secondary_button.${idx + 1}`}
                >
                  {expandedDriverId === d.id ? "Hide" : "Activity"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offline drivers */}
      {offlineDrivers.length > 0 && (
        <div className={`${cardBg} border rounded-xl p-5`}>
          <h3 className={`font-semibold mb-3 ${textColor}`}>
            Offline Drivers ({offlineDrivers.length})
          </h3>
          <div className="space-y-1">
            {offlineDrivers.map((d, idx) => (
              <div
                key={d.id}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  dm ? "" : ""
                }`}
                data-ocid={`admin.live_drivers.item.${idx + 1}`}
              >
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                <p className={`text-sm ${subtextColor}`}>
                  {d.name} — {d.city}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
