// LocalStore: persists all user-facing data for the admin dashboard
// Keys: driveease_bookings, driveease_registrations, driveease_otplogins, driveease_enquiries

export interface LocalBooking {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  driverName: string;
  driverId: number;
  pickupAddress: string;
  dropAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
  startDate: string;
  endDate: string;
  days: number;
  total: number;
  insurance: boolean;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  driverPhone?: string;
  createdAt: string;
}

export interface LocalRegistration {
  id: number;
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

export interface LocalOtpLogin {
  id: number;
  name: string;
  phone: string;
  loginTime: string;
}

export interface LocalEnquiry {
  id: number;
  name: string;
  phone: string;
  email: string;
  planType: string;
  city: string;
  familyMembers: number;
  message: string;
  submittedAt: string;
  status: "new" | "contacted" | "closed";
}

// ---- Bookings ----
export function getBookings(): LocalBooking[] {
  try {
    return JSON.parse(localStorage.getItem("driveease_bookings") || "[]");
  } catch {
    return [];
  }
}

export function saveBooking(booking: LocalBooking) {
  const bookings = getBookings();
  bookings.unshift(booking);
  localStorage.setItem("driveease_bookings", JSON.stringify(bookings));
}

export function updateBookingStatus(
  id: number,
  status: LocalBooking["status"],
) {
  const bookings = getBookings().map((b) =>
    b.id === id ? { ...b, status } : b,
  );
  localStorage.setItem("driveease_bookings", JSON.stringify(bookings));
}

// ---- Registrations ----
export function getRegistrations(): LocalRegistration[] {
  try {
    return JSON.parse(localStorage.getItem("driveease_registrations") || "[]");
  } catch {
    return [];
  }
}

export function saveRegistration(reg: LocalRegistration) {
  const regs = getRegistrations();
  regs.unshift(reg);
  localStorage.setItem("driveease_registrations", JSON.stringify(regs));
}

export function updateRegistrationStatus(
  id: number,
  status: LocalRegistration["status"],
) {
  const regs = getRegistrations().map((r) =>
    r.id === id ? { ...r, status } : r,
  );
  localStorage.setItem("driveease_registrations", JSON.stringify(regs));
}

// ---- OTP Logins ----
export function getOtpLogins(): LocalOtpLogin[] {
  try {
    return JSON.parse(localStorage.getItem("driveease_otplogins") || "[]");
  } catch {
    return [];
  }
}

export function saveOtpLogin(login: LocalOtpLogin) {
  const logins = getOtpLogins();
  logins.unshift(login);
  localStorage.setItem("driveease_otplogins", JSON.stringify(logins));
}

// ---- Enquiries ----
export function getEnquiries(): LocalEnquiry[] {
  try {
    return JSON.parse(localStorage.getItem("driveease_enquiries") || "[]");
  } catch {
    return [];
  }
}

export function saveEnquiry(enquiry: LocalEnquiry) {
  const enquiries = getEnquiries();
  enquiries.unshift(enquiry);
  localStorage.setItem("driveease_enquiries", JSON.stringify(enquiries));
}

export function updateEnquiryStatus(
  id: number,
  status: LocalEnquiry["status"],
) {
  const enquiries = getEnquiries().map((e) =>
    e.id === id ? { ...e, status } : e,
  );
  localStorage.setItem("driveease_enquiries", JSON.stringify(enquiries));
}
