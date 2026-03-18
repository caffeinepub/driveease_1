import {
  BarChart3,
  Car,
  CheckCircle,
  ClipboardList,
  LogOut,
  MessageSquare,
  Settings,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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
  | "settings";

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

  const loadAll = useCallback(() => {
    setBookings(getBookings());
    setRegistrations(getRegistrations());
    setOtpLogins(getOtpLogins());
    setEnquiries(getEnquiries());
    setDrivers(seedDrivers);
    try {
      const rates = JSON.parse(
        localStorage.getItem("driveease_driver_rates") || "{}",
      );
      setDriverRates(rates);
    } catch {
      setDriverRates({});
    }
  }, []);

  useEffect(() => {
    if (authed) {
      loadAll();
      const interval = setInterval(loadAll, 10000);
      return () => clearInterval(interval);
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
      count: drivers.length,
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
  ];

  // ── Summary cards ─────────────────────────────────────────────────────────
  const bookingSummary = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  };

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
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {navItems.find((n) => n.key === tab)?.label}
            </h1>
            <p className="text-xs text-gray-400">
              Auto-refreshes every 10 seconds
            </p>
          </div>
          <div className="flex items-center gap-2">
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

              {bookings.length === 0 ? (
                <div
                  className="text-center py-16 text-gray-400"
                  data-ocid="admin.bookings.empty_state"
                >
                  <ClipboardList
                    size={40}
                    className="mx-auto mb-3 opacity-30"
                  />
                  <p className="font-medium">No bookings yet</p>
                  <p className="text-sm">
                    Bookings made on the site will appear here automatically.
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
                      {bookings.map((b, idx) => (
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
                                onClick={() => {
                                  updateBookingStatus(b.id, "confirmed");
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
                                onClick={() => {
                                  updateBookingStatus(b.id, "rejected");
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
                <CardContent className="pt-4 pb-4">
                  <p className="text-sm text-gray-500">Total Drivers</p>
                  <p className="text-3xl font-black text-gray-900">
                    {drivers.length}
                  </p>
                </CardContent>
              </Card>

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
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.map((d, idx) => (
                      <TableRow
                        key={d.id}
                        data-ocid={`admin.drivers.row.${idx + 1}`}
                      >
                        <TableCell className="text-gray-400 text-xs">
                          {d.id}
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
                            status={d.isAvailable ? "confirmed" : "rejected"}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* ── REGISTRATIONS TAB ──────────────────────────────────────── */}
          {tab === "registrations" && (
            <div className="space-y-4">
              {registrations.length === 0 ? (
                <div
                  className="text-center py-16 text-gray-400"
                  data-ocid="admin.registrations.empty_state"
                >
                  <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No driver registrations yet</p>
                  <p className="text-sm">
                    New driver applications will appear here.
                  </p>
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
                      {registrations.map((r, idx) => (
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
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  updateRegistrationStatus(r.id, "approved");
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
                                onClick={() => {
                                  updateRegistrationStatus(r.id, "rejected");
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
                  <p className="text-sm text-gray-500">Total OTP Logins</p>
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
                  <p className="text-sm">
                    Customer OTP logins will appear here.
                  </p>
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
                  <p className="text-sm">
                    Enquiries from the Subscriptions page will appear here.
                  </p>
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
                                onClick={() => {
                                  updateEnquiryStatus(eq.id, "contacted");
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
                                onClick={() => {
                                  updateEnquiryStatus(eq.id, "closed");
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
                    Changes are saved locally.
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
        </div>
      </main>
    </div>
  );
}
