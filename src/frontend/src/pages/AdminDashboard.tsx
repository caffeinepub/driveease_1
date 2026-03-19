import {
  BarChart3,
  Car,
  CheckCircle,
  ClipboardList,
  Download,
  Eye,
  Loader2,
  LogOut,
  MapPin,
  MessageSquare,
  RefreshCw,
  Settings,
  Timer,
  Users,
  XCircle,
} from "lucide-react";
import React from "react";
import { useCallback, useEffect, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { seedDrivers } from "../data/drivers";
import type { DriverData } from "../data/drivers";
import {
  apiGetAllDriverStatuses,
  apiGetBookings,
  apiGetEnquiries,
  apiGetOtpLogins,
  apiGetRegistrations,
  apiUpdateBookingStatus,
  apiUpdateEnquiryStatus,
  apiUpdateRegistrationStatus,
} from "../utils/backendApi";
import type { ApiDriverStatus } from "../utils/backendApi";
import {
  getBookings,
  getEnquiries,
  getOtpLogins,
  getRegistrations,
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
  | "driver-earnings";

const ADMIN_PASSWORD = "126312";
const AUTH_KEY = "admin_auth";

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
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

function getDriverActivity(
  driverId: string | number,
): Array<{ status: string; timestamp: string }> {
  try {
    return JSON.parse(
      localStorage.getItem(`driveease_driver_activity_${driverId}`) || "[]",
    );
  } catch {
    return [];
  }
}

function getDriverStatus(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem("driveease_driver_status") || "{}");
  } catch {
    return {};
  }
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(
    () => localStorage.getItem(AUTH_KEY) === "true",
  );
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [tab, setTab] = useState<Tab>("bookings");

  const [bookings, setBookings] = useState<LocalBooking[]>([]);
  const [registrations, setRegistrations] = useState<LocalRegistration[]>([]);
  const [otpLogins, setOtpLogins] = useState<LocalOtpLogin[]>([]);
  const [enquiries, setEnquiries] = useState<LocalEnquiry[]>([]);
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [driverRates, setDriverRates] = useState<Record<number, number>>({});
  const [ratesSaved, setRatesSaved] = useState(false);
  const [_tick, setTick] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingDateFilter, setBookingDateFilter] = useState("");
  const [driverNameFilter, setDriverNameFilter] = useState("");
  const [driverCityFilter, setDriverCityFilter] = useState("");
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
      })
    | null
  >(null);

  const [backendDriverStatuses, setBackendDriverStatuses] = useState<
    ApiDriverStatus[]
  >([]);

  // Driver activity expand
  const [expandedDriverId, setExpandedDriverId] = useState<
    string | number | null
  >(null);

  const loadAll = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    setIsLoading(true);
    try {
      // Try backend first, fallback to localStorage automatically
      const [bks, regs, logins, enqs] = await Promise.all([
        apiGetBookings().catch(() => []),
        apiGetRegistrations().catch(() => []),
        apiGetOtpLogins().catch(() => []),
        apiGetEnquiries().catch(() => []),
      ]);

      // Merge backend + localStorage (deduplicate by id)
      const localBks = getBookings();
      const mergedBks = [...bks];
      for (const lb of localBks) {
        if (!mergedBks.some((b) => b.id === lb.id)) mergedBks.push(lb as any);
      }
      setBookings(mergedBks as any);

      const localRegs = getRegistrations();
      const mergedRegs = [...regs];
      for (const lr of localRegs) {
        if (!mergedRegs.some((r) => r.id === lr.id)) mergedRegs.push(lr as any);
      }
      setRegistrations(mergedRegs as any);

      const localLogins = getOtpLogins();
      const mergedLogins = [...logins];
      for (const ll of localLogins) {
        if (!mergedLogins.some((l) => l.id === ll.id))
          mergedLogins.push(ll as any);
      }
      setOtpLogins(mergedLogins);

      const localEnqs = getEnquiries();
      const mergedEnqs = [...enqs];
      for (const le of localEnqs) {
        if (!mergedEnqs.some((e) => e.id === le.id)) mergedEnqs.push(le as any);
      }
      setEnquiries(mergedEnqs as any);

      setDrivers(seedDrivers);
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

  useEffect(() => {
    if (authed) {
      loadAll();
      const interval = setInterval(loadAll, 10000);
      const tickInterval = setInterval(() => setTick((t) => t + 1), 30000);
      return () => {
        clearInterval(interval);
        clearInterval(tickInterval);
      };
    }
  }, [authed, loadAll]);

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

  // ── Login Screen ──────────────────────────────────────────────────────────
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
              <div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="text-center tracking-widest"
                  data-ocid="admin.input"
                />
              </div>
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

  // ── Online drivers from registrations + seed ──────────────────────────────
  const driverStatus = getDriverStatus();
  const onlineRegisteredDrivers = getRegistrations().filter(
    (r) =>
      r.status === "approved" ||
      driverStatus[String(r.id)] === "online" ||
      driverStatus[r.phone] === "online",
  );
  const onlineCount =
    onlineRegisteredDrivers.length +
    seedDrivers.filter((d) => driverStatus[String(d.id)] === "online").length;

  // ── Sidebar nav items ─────────────────────────────────────────────────────
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
      count:
        drivers.length +
        registrations.filter((r) => r.status === "approved").length,
    },
    {
      key: "registrations",
      label: "Registrations",
      icon: <CheckCircle size={18} />,
      count: registrations.length,
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
    { key: "settings", label: "Settings", icon: <Settings size={18} /> },
    {
      key: "live-drivers",
      label: "Live Drivers",
      icon: <MapPin size={18} />,
      count: onlineCount,
    },
    {
      key: "driver-earnings" as Tab,
      label: "Driver Earnings",
      icon: <BarChart3 size={18} />,
    },
  ];

  // ── Summary ─────────────────────────────────────────────────────────────
  const bookingSummary = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  };

  // ── Filtered data ─────────────────────────────────────────────────────────
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

  const allDriverRows = [
    ...drivers.map((d) => ({
      id: d.id,
      name: d.name,
      phone: d.phone ?? "",
      city: d.city,
      state: d.state,
      rating: d.rating,
      pricePerDay: d.pricePerDay,
      experienceYears: d.experienceYears,
      isOnline: driverStatus[String(d.id)] === "online" || d.isAvailable,
      isRegistered: false,
    })),
    ...registrations
      .filter((r) => r.status === "approved")
      .map((r) => ({
        id: `reg-${r.id}`,
        name: r.name,
        phone: r.phone,
        city: r.city,
        state: r.state,
        rating: 4.5,
        pricePerDay: 1200,
        experienceYears: 2,
        isOnline:
          driverStatus[String(r.id)] === "online" ||
          driverStatus[r.phone] === "online",
        isRegistered: true,
      })),
  ];

  const filteredDriverRows = allDriverRows.filter((d) => {
    const matchName =
      !driverNameFilter ||
      d.name.toLowerCase().includes(driverNameFilter.toLowerCase());
    const matchCity =
      !driverCityFilter ||
      d.city.toLowerCase().includes(driverCityFilter.toLowerCase());
    return matchName && matchCity;
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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
        <div className="px-6 py-5 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
              <Car size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">DriveEase Admin</p>
              <p className="text-xs text-gray-400">Live Dashboard</p>
            </div>
          </div>
        </div>

        {/* Online drivers quick stat */}
        {onlineCount > 0 && (
          <button
            type="button"
            className="mx-3 mt-3 bg-green-900/50 border border-green-700/50 rounded-lg px-3 py-2 cursor-pointer hover:bg-green-900/70 transition-colors text-left w-full"
            onClick={() => setTab("live-drivers")}
            data-ocid="admin.live_drivers.card"
          >
            <p className="text-green-400 text-xs font-semibold">
              ⚡ Online Drivers
            </p>
            <p className="text-white font-bold text-lg">
              {onlineCount} Live Now
            </p>
          </button>
        )}

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                tab === item.key
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

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Loading overlay */}
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

        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {navItems.find((n) => n.key === tab)?.label}
            </h1>
            <p className="text-xs text-gray-400">
              Auto-refreshes every 10 seconds
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadAll(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              data-ocid="admin.secondary_button"
            >
              {isRefreshing ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <RefreshCw size={13} />
              )}
              Refresh
            </button>
            <BarChart3 size={16} className="text-green-600" />
            <span className="text-sm text-gray-500">
              {new Date().toLocaleTimeString("en-IN")}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* ── BOOKINGS TAB ───────────────────────────────────────────── */}
          {tab === "bookings" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total",
                    value: bookingSummary.total,
                    color: "text-gray-900",
                  },
                  {
                    label: "Pending",
                    value: bookingSummary.pending,
                    color: "text-yellow-600",
                  },
                  {
                    label: "Confirmed",
                    value: bookingSummary.confirmed,
                    color: "text-green-600",
                  },
                  {
                    label: "Rejected",
                    value: bookingSummary.rejected,
                    color: "text-red-600",
                  },
                ].map((s) => (
                  <Card key={s.label}>
                    <CardContent className="pt-4 pb-4">
                      <p className="text-sm text-gray-500">{s.label}</p>
                      <p className={`text-3xl font-black ${s.color}`}>
                        {s.value}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Filters + CSV */}
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  placeholder="Search by name or phone..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-56"
                  data-ocid="admin.bookings.search_input"
                />
                <Input
                  type="date"
                  value={bookingDateFilter}
                  onChange={(e) => setBookingDateFilter(e.target.value)}
                  className="w-44"
                  data-ocid="admin.bookings.input"
                />
                {(bookingSearch || bookingDateFilter) && (
                  <span className="text-sm text-gray-500">
                    {filteredBookings.length} result
                    {filteredBookings.length !== 1 ? "s" : ""}
                  </span>
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
                  className="text-center py-16 text-gray-400"
                  data-ocid="admin.bookings.empty_state"
                >
                  <ClipboardList
                    size={40}
                    className="mx-auto mb-3 opacity-30"
                  />
                  <p className="font-medium">No bookings found</p>
                  <p className="text-sm mt-1 opacity-70">
                    Bookings made by customers will appear here. Data refreshes
                    every 10 seconds.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Insurance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((b, idx) => (
                        <TableRow
                          key={b.id}
                          data-ocid={`admin.bookings.row.${idx + 1}`}
                        >
                          <TableCell className="font-mono text-xs font-bold text-green-700">
                            #{b.id}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">
                                {b.customerName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {b.customerPhone}
                              </p>
                              {b.customerEmail && (
                                <p className="text-xs text-gray-400">
                                  {b.customerEmail}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {b.driverName}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs max-w-[180px]">
                              <p className="text-green-700 font-medium truncate">
                                📍 {b.pickupAddress}
                              </p>
                              <p className="text-gray-400">↓</p>
                              <p className="text-red-600 font-medium truncate">
                                🏁 {b.dropAddress}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <p>{b.startDate}</p>
                            <p className="text-gray-400">→ {b.endDate}</p>
                          </TableCell>
                          <TableCell className="text-sm">{b.days}</TableCell>
                          <TableCell className="font-semibold text-sm">
                            ₹{b.total.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {b.insurance ? (
                              <span className="text-green-600 text-xs font-medium">
                                ✓ Yes
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">No</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={b.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={async () => {
                                  await apiUpdateBookingStatus(
                                    b.id,
                                    "confirmed",
                                  );
                                  loadAll();
                                }}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                disabled={b.status === "confirmed"}
                                data-ocid={`admin.bookings.confirm_button.${idx + 1}`}
                              >
                                <CheckCircle
                                  size={12}
                                  className="inline mr-1"
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
                                  loadAll();
                                }}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                disabled={b.status === "rejected"}
                                data-ocid={`admin.bookings.delete_button.${idx + 1}`}
                              >
                                <XCircle size={12} className="inline mr-1" />
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

          {/* ── DRIVERS TAB ────────────────────────────────────────────── */}
          {tab === "drivers" && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4 pb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Drivers (seed + approved registrations)
                    </p>
                    <p className="text-3xl font-black text-gray-900">
                      {filteredDriverRows.length}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const rows = [
                        [
                          "Name",
                          "Phone",
                          "City",
                          "State",
                          "Rating",
                          "Price/Day",
                          "Experience",
                          "Online Status",
                        ],
                        ...filteredDriverRows.map((d) => [
                          d.name,
                          d.phone,
                          d.city,
                          d.state,
                          String(d.rating),
                          String(d.pricePerDay),
                          `${d.experienceYears} yrs`,
                          d.isOnline ? "Online" : "Offline",
                        ]),
                      ];
                      downloadCSV(
                        `drivers-${new Date().toISOString().slice(0, 10)}.csv`,
                        rows,
                      );
                    }}
                    className="gap-1.5"
                    data-ocid="admin.drivers.secondary_button"
                  >
                    <Download size={14} /> Download CSV
                  </Button>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Input
                  placeholder="Filter by name..."
                  value={driverNameFilter}
                  onChange={(e) => setDriverNameFilter(e.target.value)}
                  className="w-48"
                  data-ocid="admin.drivers.search_input"
                />
                <Input
                  placeholder="Filter by city..."
                  value={driverCityFilter}
                  onChange={(e) => setDriverCityFilter(e.target.value)}
                  className="w-48"
                  data-ocid="admin.drivers.input"
                />
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>#</TableHead>
                      <TableHead>Driver Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Price/Day</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Online Status</TableHead>
                      <TableHead>Online Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDriverRows.map((d, idx) => {
                      const onlineSince = getDriverOnlineSince(d.id);
                      const duration =
                        onlineSince && d.isOnline
                          ? formatDuration(
                              Date.now() - new Date(onlineSince).getTime(),
                            )
                          : null;
                      return (
                        <TableRow
                          key={d.id}
                          data-ocid={`admin.drivers.row.${idx + 1}`}
                        >
                          <TableCell className="text-gray-400 text-xs">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {d.name}
                          </TableCell>
                          <TableCell className="text-sm">{d.city}</TableCell>
                          <TableCell className="text-sm">{d.state}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {d.phone}
                          </TableCell>
                          <TableCell>
                            <span className="text-yellow-600 font-semibold text-sm">
                              ⭐ {d.rating}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold text-sm">
                            ₹{d.pricePerDay.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {d.experienceYears} yrs
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={d.isOnline ? "confirmed" : "rejected"}
                            />
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {duration ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <Timer size={12} /> {duration}
                              </span>
                            ) : (
                              <span>&mdash;</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* ── REGISTRATIONS TAB ──────────────────────────────────────── */}
          {tab === "registrations" && (
            <div className="space-y-4">
              {/* Filters + CSV */}
              <div className="flex flex-wrap gap-3">
                <Input
                  placeholder="Filter by name..."
                  value={regNameFilter}
                  onChange={(e) => setRegNameFilter(e.target.value)}
                  className="w-48"
                  data-ocid="admin.registrations.search_input"
                />
                <Input
                  placeholder="Filter by city..."
                  value={regCityFilter}
                  onChange={(e) => setRegCityFilter(e.target.value)}
                  className="w-48"
                  data-ocid="admin.registrations.input"
                />
                <select
                  value={regStatusFilter}
                  onChange={(e) => setRegStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                  data-ocid="admin.registrations.select"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const rows = [
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
                    ];
                    downloadCSV(
                      `registrations-${new Date().toISOString().slice(0, 10)}.csv`,
                      rows,
                    );
                  }}
                  className="ml-auto gap-1.5"
                  data-ocid="admin.registrations.secondary_button"
                >
                  <Download size={14} /> Download CSV
                </Button>
              </div>

              {filteredRegs.length === 0 ? (
                <div
                  className="text-center py-16 text-gray-400"
                  data-ocid="admin.registrations.empty_state"
                >
                  <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No driver registrations found</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegs.map((r, idx) => (
                        <TableRow
                          key={r.id}
                          data-ocid={`admin.registrations.row.${idx + 1}`}
                        >
                          <TableCell className="font-medium text-sm">
                            {r.name}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {r.phone}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {r.email || "—"}
                          </TableCell>
                          <TableCell className="text-sm">{r.city}</TableCell>
                          <TableCell className="text-sm">{r.state}</TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {fmt(r.submittedAt)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={r.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setViewReg(r)}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
                                data-ocid={`admin.registrations.edit_button.${idx + 1}`}
                              >
                                <Eye size={10} /> View
                              </button>
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
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
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
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
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

          {/* ── CUSTOMERS TAB ──────────────────────────────────────────── */}
          {tab === "customers" && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-sm text-gray-500">Registered Customers</p>
                  <p className="text-3xl font-black text-gray-900">
                    {otpLogins.length}
                  </p>
                </CardContent>
              </Card>
              {otpLogins.length === 0 ? (
                <div
                  className="text-center py-16 text-gray-400"
                  data-ocid="admin.customers.empty_state"
                >
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No customer logins yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Login Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {otpLogins.map((c, idx) => (
                        <TableRow
                          key={c.id}
                          data-ocid={`admin.customers.row.${idx + 1}`}
                        >
                          <TableCell className="text-gray-400 text-xs">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {c.name}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {c.phone}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {fmt(c.loginTime)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* ── ENQUIRIES TAB ──────────────────────────────────────────── */}
          {tab === "enquiries" && (
            <div className="space-y-4">
              {enquiries.length === 0 ? (
                <div
                  className="text-center py-16 text-gray-400"
                  data-ocid="admin.enquiries.empty_state"
                >
                  <MessageSquare
                    size={40}
                    className="mx-auto mb-3 opacity-30"
                  />
                  <p className="font-medium">No subscription enquiries yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enquiries.map((eq, idx) => (
                        <TableRow
                          key={eq.id}
                          data-ocid={`admin.enquiries.row.${idx + 1}`}
                        >
                          <TableCell className="font-medium text-sm">
                            {eq.name}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {eq.phone}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {eq.email || "—"}
                          </TableCell>
                          <TableCell>
                            <span className="capitalize text-sm font-medium">
                              {eq.planType}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{eq.city}</TableCell>
                          <TableCell className="text-sm">
                            {eq.familyMembers}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500 max-w-[140px] truncate">
                            {eq.message || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">
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
                                  loadAll();
                                }}
                                className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                                disabled={
                                  eq.status === "contacted" ||
                                  eq.status === "closed"
                                }
                                data-ocid={`admin.enquiries.confirm_button.${idx + 1}`}
                              >
                                Mark Contacted
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await apiUpdateEnquiryStatus(eq.id, "closed");
                                  loadAll();
                                }}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                disabled={eq.status === "closed"}
                                data-ocid={`admin.enquiries.delete_button.${idx + 1}`}
                              >
                                Mark Closed
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

          {/* ── SETTINGS TAB ───────────────────────────────────────────── */}
          {tab === "settings" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Driver Rate Management
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Override the default price per day for individual drivers.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Driver</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Default Rate (₹/day)</TableHead>
                          <TableHead>Override Rate (₹/day)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {drivers.map((d, idx) => (
                          <TableRow
                            key={d.id}
                            data-ocid={`admin.settings.row.${idx + 1}`}
                          >
                            <TableCell className="font-medium text-sm">
                              {d.name}
                            </TableCell>
                            <TableCell className="text-sm">{d.city}</TableCell>
                            <TableCell className="text-sm text-gray-500">
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
                                className="w-28 text-sm"
                                data-ocid="admin.settings.input"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
                        ✓ Rates saved successfully!
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {tab === "live-drivers" && (
            <LiveDriversTab
              expandedDriverId={expandedDriverId}
              setExpandedDriverId={setExpandedDriverId}
              backendDriverStatuses={backendDriverStatuses}
              backendRegistrations={registrations}
            />
          )}

          {tab === "driver-earnings" && (
            <DriverEarningsTab bookings={bookings} />
          )}
        </div>
      </main>

      {/* Registration Detail Modal */}
      <Dialog
        open={!!viewReg}
        onOpenChange={(open) => {
          if (!open) setViewReg(null);
        }}
      >
        <DialogContent
          className="max-w-md"
          data-ocid="admin.registrations.dialog"
        >
          <DialogHeader>
            <DialogTitle>Driver Registration Details</DialogTitle>
          </DialogHeader>
          {viewReg && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Full Name</p>
                  <p className="font-semibold">{viewReg.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Phone</p>
                  <p className="font-semibold font-mono">{viewReg.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="font-semibold">{viewReg.email || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">City</p>
                  <p className="font-semibold">{viewReg.city}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">State</p>
                  <p className="font-semibold">{viewReg.state}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Status</p>
                  <StatusBadge status={viewReg.status} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Applied On</p>
                  <p className="font-semibold text-xs">
                    {fmt(viewReg.submittedAt)}
                  </p>
                </div>
                {(viewReg as any).vehicleType && (
                  <div>
                    <p className="text-gray-500 text-xs">Vehicle Type</p>
                    <p className="font-semibold">
                      {(viewReg as any).vehicleType}
                    </p>
                  </div>
                )}
                {(viewReg as any).licenseNumber && (
                  <div>
                    <p className="text-gray-500 text-xs">License Number</p>
                    <p className="font-semibold font-mono">
                      {(viewReg as any).licenseNumber}
                    </p>
                  </div>
                )}
                {(viewReg as any).experience && (
                  <div>
                    <p className="text-gray-500 text-xs">Experience</p>
                    <p className="font-semibold">
                      {(viewReg as any).experience}
                    </p>
                  </div>
                )}
                {(viewReg as any).languages && (
                  <div>
                    <p className="text-gray-500 text-xs">Languages</p>
                    <p className="font-semibold">
                      {(viewReg as any).languages}
                    </p>
                  </div>
                )}
                {(viewReg as any).workAreas && (
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs">Work Areas</p>
                    <p className="font-semibold">
                      {(viewReg as any).workAreas}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-gray-700 font-semibold text-sm mb-2">
                  Document Status
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Aadhar Card",
                    "PAN Card",
                    "Driving Licence",
                    "Selfie Photo",
                  ].map((doc) => (
                    <div
                      key={doc}
                      className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2"
                    >
                      <CheckCircle size={14} className="text-green-600" />
                      <span className="text-xs font-medium text-green-800">
                        {doc}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Documents verified during registration payment step.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    await apiUpdateRegistrationStatus(viewReg.id, "approved");
                    loadAll();
                    setViewReg(null);
                  }}
                  disabled={viewReg.status === "approved"}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm"
                  data-ocid="admin.registrations.confirm_button"
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await apiUpdateRegistrationStatus(viewReg.id, "rejected");
                    loadAll();
                    setViewReg(null);
                  }}
                  disabled={viewReg.status === "rejected"}
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50 text-sm"
                  data-ocid="admin.registrations.delete_button"
                >
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewReg(null)}
                  className="text-sm"
                  data-ocid="admin.registrations.cancel_button"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── DriverEarningsTab ────────────────────────────────────────────────────
function DriverEarningsTab({ bookings }: { bookings: LocalBooking[] }) {
  // Group bookings by driverName
  const earningsMap: Record<string, { count: number; gross: number }> = {};
  for (const b of bookings) {
    const name = b.driverName || "Unknown Driver";
    if (!earningsMap[name]) earningsMap[name] = { count: 0, gross: 0 };
    earningsMap[name].count += 1;
    earningsMap[name].gross += Number(b.total) || 0;
  }

  const rows = Object.entries(earningsMap).map(([name, data]) => ({
    name,
    count: data.count,
    gross: data.gross,
    commission: Math.round(data.gross * 0.18),
    net: Math.round(data.gross * 0.82),
  }));

  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((s, b) => s + (Number(b.total) || 0), 0);
  const totalCommission = Math.round(totalRevenue * 0.18);

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-xs mb-1">Total Bookings</p>
          <p className="text-2xl font-bold text-white">{totalBookings}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-xs mb-1">Total Platform Revenue</p>
          <p className="text-2xl font-bold text-green-400">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-xs mb-1">
            Total Commission Earned (18%)
          </p>
          <p className="text-2xl font-bold text-yellow-400">
            ₹{totalCommission.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="text-white font-semibold text-sm">
            Driver Earnings Breakdown
          </h3>
        </div>
        {rows.length === 0 ? (
          <div
            className="p-8 text-center text-gray-500"
            data-ocid="admin.driver-earnings.empty_state"
          >
            No booking data yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                  <th className="px-4 py-3 text-left">Driver Name</th>
                  <th className="px-4 py-3 text-right">Total Bookings</th>
                  <th className="px-4 py-3 text-right">Gross Earnings</th>
                  <th className="px-4 py-3 text-right">Commission (18%)</th>
                  <th className="px-4 py-3 text-right">Net Payout</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={row.name}
                    className="border-b border-gray-800 hover:bg-gray-800 transition-colors"
                    data-ocid={`admin.driver-earnings.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 text-white font-medium">
                      {row.name}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-300">
                      {row.count}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
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

// ── LiveDriversTab ─────────────────────────────────────────────────────────
function LiveDriversTab({
  expandedDriverId,
  setExpandedDriverId,
  backendDriverStatuses,
  backendRegistrations,
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
}) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<unknown>(null);

  // Merge seed + approved registrations
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

  React.useEffect(() => {
    try {
      setDriverStatus(
        JSON.parse(localStorage.getItem("driveease_driver_status") || "{}"),
      );
    } catch {
      /* */
    }
  }); // runs on every render - tick prop change triggers parent re-render

  const allDrivers = React.useMemo(() => {
    // Build a set of online phones/ids from backend statuses
    const backendOnline = new Set<string>();
    for (const s of backendDriverStatuses) {
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

    const seed = seedDrivers.map((d) => ({
      id: String(d.id),
      name: d.name,
      phone: d.phone ?? "",
      city: d.city,
      lat: 20 + Math.random() * 10,
      lng: 73 + Math.random() * 15,
      isOnline: isOnlineCheck(String(d.id), d.phone ?? "") || d.isAvailable,
      isRegistered: false,
    }));

    // Use backendRegistrations (which includes cross-device approvals) + localStorage
    const allRegs = [...backendRegistrations];
    const regPhones = new Set(allRegs.map((r) => r.phone));
    // Add any localStore regs not already in backend list
    for (const r of getRegistrations()) {
      if (!regPhones.has(r.phone)) allRegs.push(r);
    }

    const regs = allRegs
      .filter(
        (r) => r.status === "approved" || isOnlineCheck(String(r.id), r.phone),
      )
      .map((r) => ({
        id: `reg-${r.id}`,
        name: r.name,
        phone: r.phone,
        city: r.city,
        lat: 20 + Math.random() * 10,
        lng: 73 + Math.random() * 15,
        isOnline:
          isOnlineCheck(String(r.id), r.phone) || r.status === "approved",
        isRegistered: true,
      }));

    // Merge, no duplicate phones
    const phones = new Set(seed.map((d) => d.phone));
    return [...seed, ...regs.filter((r) => !phones.has(r.phone))];
  }, [driverStatus, backendDriverStatuses, backendRegistrations]);

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
      }
    } else {
      initMap();
    }
    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onlineDrivers]);

  const formatOnlineDuration = (id: string) => {
    const since = localStorage.getItem(`driveease_driver_online_since_${id}`);
    if (!since) return null;
    return formatDuration(Date.now() - new Date(since).getTime());
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Live Driver Tracking
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">
          Real-time driver status and location monitoring
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500 mb-1">Total Drivers</p>
            <p className="text-2xl font-bold text-gray-900">
              {allDrivers.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500 mb-1">Online Now</p>
            <p className="text-2xl font-bold text-green-600">
              {onlineDrivers.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500 mb-1">Offline</p>
            <p className="text-2xl font-bold text-gray-500">
              {offlineDrivers.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Online Drivers with Timer</CardTitle>
        </CardHeader>
        <CardContent>
          {onlineDrivers.length === 0 ? (
            <div
              className="text-center py-8 text-gray-400"
              data-ocid="admin.live_drivers.empty_state"
            >
              <MapPin size={32} className="mx-auto mb-2 opacity-40" />
              <p>
                No drivers online right now. Drivers must log in and go online.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Online Duration</TableHead>
                  <TableHead>History</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {onlineDrivers.map((d, idx) => {
                  const duration = formatOnlineDuration(d.id);
                  const activity = getDriverActivity(d.id);
                  const isExpanded = expandedDriverId === d.id;
                  return (
                    <React.Fragment key={d.id}>
                      <TableRow
                        data-ocid={`admin.live_drivers.item.${idx + 1}`}
                      >
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell className="text-gray-600">
                          {d.city}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {d.phone}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Online
                          </span>
                        </TableCell>
                        <TableCell>
                          {duration ? (
                            <span className="flex items-center gap-1 text-green-700 font-semibold text-sm">
                              <Timer size={13} /> {duration}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">
                              Just went online
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedDriverId(isExpanded ? null : d.id)
                            }
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                            data-ocid={`admin.live_drivers.toggle.${idx + 1}`}
                          >
                            {isExpanded ? "Hide" : "Show"} History
                          </button>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-gray-50">
                            <div className="py-2 px-2">
                              <p className="text-xs font-semibold text-gray-600 mb-2">
                                Last 5 Sessions
                              </p>
                              {activity.length === 0 ? (
                                <p className="text-xs text-gray-400">
                                  No activity history recorded.
                                </p>
                              ) : (
                                <div className="space-y-1">
                                  {activity
                                    .slice(-5)
                                    .reverse()
                                    .map((a, _ai) => (
                                      <div
                                        key={`${a.status}-${a.timestamp}`}
                                        className="flex items-center gap-2 text-xs"
                                      >
                                        <span
                                          className={`w-2 h-2 rounded-full ${a.status === "online" ? "bg-green-500" : "bg-gray-400"}`}
                                        />
                                        <span
                                          className={
                                            a.status === "online"
                                              ? "text-green-700"
                                              : "text-gray-600"
                                          }
                                        >
                                          Went {a.status}
                                        </span>
                                        <span className="text-gray-400">
                                          {fmt(a.timestamp)}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Offline drivers with last seen */}
      {offlineDrivers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Offline Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Online</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offlineDrivers.slice(0, 20).map((d, idx) => {
                  const activity = getDriverActivity(d.id);
                  const lastOnline = activity
                    .filter((a) => a.status === "offline")
                    .slice(-1)[0];
                  return (
                    <TableRow
                      key={d.id}
                      data-ocid={`admin.live_drivers.item.${onlineDrivers.length + idx + 1}`}
                    >
                      <TableCell className="font-medium text-sm">
                        {d.name}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {d.city}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Offline
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs">
                        {lastOnline ? fmt(lastOnline.timestamp) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {onlineDrivers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={mapRef}
              style={{ height: "400px", width: "100%", borderRadius: "8px" }}
              data-ocid="admin.live_drivers.canvas_target"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
