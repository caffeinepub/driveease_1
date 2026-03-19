import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  FileText,
  MessageSquare,
  Star,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { seedDrivers } from "../data/drivers";
import { Link } from "../router";
import { apiGetBookings } from "../utils/backendApi";

interface LocalBooking {
  id: number;
  status: string;
  customerName: string;
  customerPhone?: string;
  pickupAddress: string;
  dropAddress: string;
  total: number;
  startDate: string;
  endDate?: string;
  driverName: string;
  driverId?: number;
  bookingType?: string;
  days?: number;
  createdAt?: string;
  insurance?: boolean;
}

interface FeedbackRecord {
  bookingId: number;
  driverId?: number;
  driverName: string;
  rating: number;
  comment: string;
  customerPhone: string;
  date: string;
}

function getFeedback(): FeedbackRecord[] {
  try {
    return JSON.parse(localStorage.getItem("driveease_feedback") || "[]");
  } catch {
    return [];
  }
}

function saveFeedback(rec: FeedbackRecord) {
  const all = getFeedback().filter((f) => f.bookingId !== rec.bookingId);
  localStorage.setItem("driveease_feedback", JSON.stringify([...all, rec]));
}

function getCustomerPhone(): string {
  try {
    const p = localStorage.getItem("driveease_customer_phone");
    if (p) return p;
    const otp = JSON.parse(localStorage.getItem("otp_customer") || "null");
    if (otp?.phone) return otp.phone;
    const users = JSON.parse(
      localStorage.getItem("driveease_otp_users") || "[]",
    );
    if (users.length > 0) return users[0].phone ?? "";
  } catch {
    /* */
  }
  return "";
}

function getLocalBookings(): LocalBooking[] {
  try {
    const a = JSON.parse(localStorage.getItem("driveease_bookings") || "[]");
    const b = JSON.parse(
      localStorage.getItem("driveease_all_bookings") || "[]",
    );
    const merged = [...a, ...b];
    const seen = new Set<number>();
    return merged.filter((x) => {
      if (seen.has(x.id)) return false;
      seen.add(x.id);
      return true;
    });
  } catch {
    return [];
  }
}

function getDriverExtras(
  driverId?: number,
  driverName?: string,
): { city?: string; vehicleType?: string } {
  try {
    const regs = JSON.parse(
      localStorage.getItem("driveease_registrations") || "[]",
    );
    // Try by ID first
    if (driverId) {
      const reg = regs.find((r: any) => r.id === driverId);
      if (reg) return { city: reg.city, vehicleType: reg.vehicleType };
    }
    // Try by name
    if (driverName) {
      const reg = regs.find((r: any) => r.name === driverName);
      if (reg) return { city: reg.city, vehicleType: reg.vehicleType };
    }
  } catch {
    /* */
  }
  return {};
}

function downloadInvoice(booking: LocalBooking) {
  const insuranceAmount = booking.insurance ? 99 : 0;
  const baseFare = booking.total - insuranceAmount;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice - DriveEase Booking #${booking.id}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #1a1a1a; background: #fff; }
    .header { background: #14532d; color: white; padding: 24px 32px; border-radius: 8px; margin-bottom: 32px; }
    .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; }
    .logo span { color: #86efac; }
    .invoice-title { font-size: 13px; opacity: 0.8; margin-top: 4px; }
    .booking-id { font-size: 18px; font-weight: 700; margin-top: 8px; }
    .section { margin-bottom: 24px; }
    .section h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .label { color: #6b7280; }
    .value { font-weight: 600; text-align: right; max-width: 60%; }
    .amount-row { border-top: 2px solid #14532d; padding-top: 12px; margin-top: 8px; }
    .amount-row .value { color: #14532d; font-size: 18px; }
    .status-badge { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
    .note { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; font-size: 12px; color: #6b7280; margin-top: 24px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Drive<span>Ease</span></div>
    <div class="invoice-title">Personal Driver Network — Official Invoice</div>
    <div class="booking-id">Booking ID: #${booking.id}</div>
  </div>

  <div class="section">
    <h3>Customer Details</h3>
    <div class="row"><span class="label">Name</span><span class="value">${booking.customerName || "—"}</span></div>
    <div class="row"><span class="label">Phone</span><span class="value">${booking.customerPhone || "—"}</span></div>
  </div>

  <div class="section">
    <h3>Driver Details</h3>
    <div class="row"><span class="label">Driver Name</span><span class="value">${booking.driverName || "—"}</span></div>
  </div>

  <div class="section">
    <h3>Ride Details</h3>
    <div class="row"><span class="label">Pickup</span><span class="value">${booking.pickupAddress}</span></div>
    <div class="row"><span class="label">Drop</span><span class="value">${booking.dropAddress}</span></div>
    <div class="row"><span class="label">Booking Type</span><span class="value">${booking.bookingType || "Standard"}</span></div>
    <div class="row"><span class="label">Start Date</span><span class="value">${booking.startDate}</span></div>
    ${booking.endDate && booking.endDate !== booking.startDate ? `<div class="row"><span class="label">End Date</span><span class="value">${booking.endDate}</span></div>` : ""}
    ${booking.days ? `<div class="row"><span class="label">Duration</span><span class="value">${booking.days} day${booking.days > 1 ? "s" : ""}</span></div>` : ""}
    <div class="row"><span class="label">Status</span><span class="value"><span class="status-badge">${booking.status}</span></span></div>
  </div>

  <div class="section">
    <h3>Amount Breakdown</h3>
    <div class="row"><span class="label">Base Fare</span><span class="value">₹${baseFare.toLocaleString("en-IN")}</span></div>
    ${insuranceAmount > 0 ? `<div class="row"><span class="label">Ride Insurance</span><span class="value">₹${insuranceAmount}</span></div>` : ""}
    <div class="row amount-row"><span class="label" style="font-weight:700;color:#1a1a1a">Total Amount</span><span class="value">₹${booking.total?.toLocaleString("en-IN")}</span></div>
  </div>

  <div class="note">
    <strong>Payment Info:</strong> Axis Bank · Krishna Kant Pandey · A/C: 922010062230782 · IFSC: UTIB0004620 · PhonePe: 7836887228
  </div>

  <div class="footer">
    <p><strong>Thank you for choosing DriveEase — India's Personal Driver Network</strong></p>
    <p style="margin-top:4px">This is a computer-generated invoice. No signature required.</p>
    <p style="margin-top:4px">For support: +91-7836887228 | caffeine.ai</p>
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (w) {
    w.onafterprint = () => URL.revokeObjectURL(url);
  }
}

function downloadInquiryReceipt(booking: LocalBooking) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Booking Inquiry Receipt - #${booking.id}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #1a1a1a; background: #fff; }
    .header { background: #14532d; color: white; padding: 24px 32px; border-radius: 8px; margin-bottom: 32px; text-align: center; }
    .logo { font-size: 28px; font-weight: 900; } .logo span { color: #86efac; }
    .check { font-size: 48px; margin: 16px 0; }
    .title { font-size: 20px; font-weight: 700; margin-top: 8px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .label { color: #6b7280; } .value { font-weight: 600; }
    .footer { text-align: center; margin-top: 40px; color: #6b7280; font-size: 12px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
    .note { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 6px; padding: 12px; font-size: 13px; color: #92400e; margin-top: 24px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Drive<span>Ease</span></div>
    <div class="check">✅</div>
    <div class="title">Booking Request Submitted</div>
    <div style="font-size:14px;opacity:0.85;margin-top:4px">Reference ID: #${booking.id}</div>
  </div>

  <div class="row"><span class="label">Customer Name</span><span class="value">${booking.customerName || "—"}</span></div>
  <div class="row"><span class="label">Phone</span><span class="value">${booking.customerPhone || "—"}</span></div>
  <div class="row"><span class="label">Pickup Location</span><span class="value">${booking.pickupAddress}</span></div>
  <div class="row"><span class="label">Drop Location</span><span class="value">${booking.dropAddress}</span></div>
  <div class="row"><span class="label">Booking Type</span><span class="value">${booking.bookingType || "Standard"}</span></div>
  <div class="row"><span class="label">Date</span><span class="value">${booking.startDate}</span></div>
  <div class="row"><span class="label">Requested Driver</span><span class="value">${booking.driverName || "—"}</span></div>
  <div class="row"><span class="label">Status</span><span class="value" style="color:#d97706">Pending Confirmation</span></div>

  <div class="note">
    ⏳ Your booking request has been submitted and is awaiting driver confirmation. You will be notified once the driver accepts your request.
  </div>

  <div class="footer">
    <p><strong>DriveEase — India's Personal Driver Network</strong></p>
    <p>This is a computer-generated inquiry receipt. For support: +91-7836887228</p>
    <p style="margin-top:4px">This is NOT a confirmed booking invoice.</p>
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (w) {
    w.onafterprint = () => URL.revokeObjectURL(url);
  }
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<LocalBooking[]>([]);
  const [customerPhone, setCustomerPhone] = useState("");
  const [feedback, setFeedback] = useState<FeedbackRecord[]>(getFeedback());
  const [notifications, setNotifications] = useState<
    Array<{
      bookingId: number;
      message: string;
      read: boolean;
      timestamp: number;
    }>
  >([]);

  const [feedbackModal, setFeedbackModal] = useState<{
    bookingId: number;
    driverName: string;
    driverId?: number;
  } | null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const reload = useCallback(async () => {
    const phone = getCustomerPhone();
    setCustomerPhone(phone);
    const localAll = getLocalBookings();
    // Also fetch from backend and merge (backend takes priority)
    try {
      const backendBks = await apiGetBookings();
      // Merge: backend entries override local ones by ID
      const merged = [...backendBks] as unknown[] as LocalBooking[];
      for (const lb of localAll) {
        if (!merged.some((b) => b.id === lb.id)) merged.push(lb);
      }
      const filtered = phone
        ? merged.filter((b) => !b.customerPhone || b.customerPhone === phone)
        : merged;
      setBookings(filtered);
    } catch {
      // Fallback to local only
      const filtered = phone
        ? localAll.filter((b) => !b.customerPhone || b.customerPhone === phone)
        : localAll;
      setBookings(filtered);
    }
    try {
      const notifs = JSON.parse(
        localStorage.getItem("booking_notifications") || "[]",
      );
      setNotifications(notifs);
    } catch {
      /* */
    }
    setFeedback(getFeedback());
  }, []);

  useEffect(() => {
    reload();
    const iv = setInterval(reload, 5000);
    return () => clearInterval(iv);
  }, [reload]);

  const markAllRead = () => {
    try {
      const notifs = JSON.parse(
        localStorage.getItem("booking_notifications") || "[]",
      );
      const updated = notifs.map((n: { read: boolean }) => ({
        ...n,
        read: true,
      }));
      localStorage.setItem("booking_notifications", JSON.stringify(updated));
      setNotifications(updated);
    } catch {
      /* */
    }
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackModal) return;
    const rec: FeedbackRecord = {
      bookingId: feedbackModal.bookingId,
      driverId: feedbackModal.driverId,
      driverName: feedbackModal.driverName,
      rating: stars,
      comment,
      customerPhone,
      date: new Date().toISOString(),
    };
    saveFeedback(rec);
    setFeedback(getFeedback());
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackModal(null);
      setFeedbackSent(false);
      setStars(5);
      setComment("");
    }, 1800);
  };

  const hasFeedback = (bookingId: number) =>
    feedback.some((f) => f.bookingId === bookingId);

  const statusBadge = (status: string) => {
    if (status === "confirmed")
      return (
        <Badge className="bg-green-100 text-green-700">
          <CheckCircle size={10} className="mr-1" />
          Confirmed
        </Badge>
      );
    if (status === "rejected" || status === "cancelled")
      return (
        <Badge className="bg-red-100 text-red-700">
          <XCircle size={10} className="mr-1" />
          Cancelled
        </Badge>
      );
    if (status === "completed")
      return (
        <Badge className="bg-blue-100 text-blue-700">
          <CheckCircle size={10} className="mr-1" />
          Completed
        </Badge>
      );
    return (
      <Badge className="bg-yellow-100 text-yellow-700">
        <Clock size={10} className="mr-1" />
        Pending
      </Badge>
    );
  };

  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">My Ride History</h1>
          <Badge className="bg-green-100 text-green-700">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          Your past and upcoming driver bookings. Download invoices and receipts
          below.
        </p>

        {/* Notification Banner */}
        {unread.length > 0 && (
          <div
            className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start justify-between gap-3"
            data-ocid="bookings.success_state"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                {unread.map((n) => (
                  <p
                    key={n.bookingId}
                    className="text-green-800 font-medium text-sm"
                  >
                    {n.message} Booking ID: #{n.bookingId}
                  </p>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs text-green-600 hover:text-green-800 font-medium whitespace-nowrap border border-green-300 rounded-lg px-2 py-1"
              data-ocid="bookings.secondary_button"
            >
              Mark as read
            </button>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-16" data-ocid="bookings.empty_state">
            <AlertCircle size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No bookings yet.</p>
            <p className="text-gray-400 text-sm mt-1">
              Book a driver to see your booking history here.
            </p>
            <Link to="/drivers" className="text-green-600 underline mt-3 block">
              Find a driver
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b, idx) => {
              const driver = seedDrivers.find(
                (d) => d.id === Number(b.driverId),
              );
              const driverName =
                b.driverName || driver?.name || `Driver #${b.driverId}`;
              const isCompleted =
                b.status === "confirmed" || b.status === "completed";
              const isPending = b.status === "pending";
              return (
                <Card
                  key={b.id}
                  className="shadow-sm"
                  data-ocid={`bookings.item.${idx + 1}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          Booking #{b.id}
                        </CardTitle>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {driverName}
                          {(() => {
                            const extras = getDriverExtras(
                              b.driverId,
                              b.driverName,
                            );
                            return extras.city ? (
                              <span className="ml-1 text-gray-400">
                                · {extras.city}
                              </span>
                            ) : null;
                          })()}
                        </p>
                        {(() => {
                          const extras = getDriverExtras(
                            b.driverId,
                            b.driverName,
                          );
                          return extras.vehicleType ? (
                            <span className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              🚗 {extras.vehicleType}
                            </span>
                          ) : null;
                        })()}
                        {b.bookingType && (
                          <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded px-1.5 py-0.5 mt-1 inline-block">
                            {b.bookingType}
                          </span>
                        )}
                      </div>
                      {statusBadge(b.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">📍 {b.pickupAddress}</p>
                      <p className="text-gray-600">🏁 {b.dropAddress}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-gray-400">
                        <p>
                          {b.startDate}
                          {b.endDate && b.endDate !== b.startDate
                            ? ` → ${b.endDate}`
                            : ""}
                        </p>
                        {b.days && b.days > 0 && (
                          <p>
                            {b.days} day{b.days > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                      <p className="text-green-600 font-bold text-base">
                        ₹{b.total?.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {isCompleted && !hasFeedback(b.id) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setFeedbackModal({
                              bookingId: b.id,
                              driverName,
                              driverId: b.driverId,
                            });
                            setStars(5);
                            setComment("");
                            setFeedbackSent(false);
                          }}
                          className="text-xs border-green-300 text-green-700 hover:bg-green-50 gap-1"
                          data-ocid={`bookings.edit_button.${idx + 1}`}
                        >
                          <MessageSquare size={12} /> Give Feedback
                        </Button>
                      )}
                      {hasFeedback(b.id) && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle size={12} /> Feedback submitted
                        </span>
                      )}
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        <Link to={`/track/${b.id}`}>Track Ride</Link>
                      </Button>

                      {/* Download Invoice (confirmed/completed) */}
                      {isCompleted && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadInvoice(b)}
                          className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50 gap-1"
                          data-ocid={`bookings.download_button.${idx + 1}`}
                        >
                          <Download size={12} /> Invoice
                        </Button>
                      )}

                      {/* Download Inquiry Receipt (pending) */}
                      {isPending && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadInquiryReceipt(b)}
                          className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50 gap-1"
                          data-ocid={`bookings.secondary_button.${idx + 1}`}
                        >
                          <FileText size={12} /> Inquiry Receipt
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      <Dialog
        open={!!feedbackModal}
        onOpenChange={(open) => {
          if (!open) setFeedbackModal(null);
        }}
      >
        <DialogContent data-ocid="bookings.dialog">
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
          </DialogHeader>
          {feedbackSent ? (
            <div
              className="text-center py-8"
              data-ocid="bookings.success_state"
            >
              <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
              <p className="text-lg font-semibold text-gray-900">
                Thank you for your feedback!
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Your review helps improve driver quality.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Driver:{" "}
                  <span className="font-semibold text-gray-900">
                    {feedbackModal?.driverName}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStars(s)}
                      className="p-1 transition-transform hover:scale-110"
                      data-ocid="bookings.toggle"
                    >
                      <Star
                        size={28}
                        className={
                          s <= stars
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Comment (optional)
                </p>
                <Textarea
                  placeholder="Share your experience with this driver..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  data-ocid="bookings.textarea"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleFeedbackSubmit}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white"
                  data-ocid="bookings.submit_button"
                >
                  Submit Feedback
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setFeedbackModal(null)}
                  data-ocid="bookings.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
