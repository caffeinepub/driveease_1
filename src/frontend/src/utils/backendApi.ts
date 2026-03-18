/**
 * backendApi.ts
 * Wraps all ICP backend canister calls for shared cross-device data storage.
 * Falls back to localStorage if the backend call fails.
 */

import { createActorWithConfig } from "../config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getActor(): Promise<any> {
  return await createActorWithConfig();
}

// ---- Bookings ----

export interface ApiBooking {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  driverName: string;
  driverId: string;
  pickupAddress: string;
  dropAddress: string;
  startDate: string;
  endDate: string;
  days: number;
  total: number;
  insurance: boolean;
  status: string;
  driverPhone: string;
  createdAt: string;
}

export async function apiSaveBooking(
  b: Omit<ApiBooking, "id">,
): Promise<number> {
  try {
    const actor = await getActor();
    const id = await actor.saveBooking(
      b.customerName,
      b.customerPhone,
      b.customerEmail,
      b.driverName,
      b.driverId,
      b.pickupAddress,
      b.dropAddress,
      b.startDate,
      b.endDate,
      BigInt(b.days),
      BigInt(b.total),
      b.insurance,
      b.driverPhone,
      b.createdAt,
    );
    return Number(id);
  } catch (e) {
    console.warn("Backend saveBooking failed, using localStorage", e);
    return Date.now();
  }
}

export async function apiGetBookings(): Promise<ApiBooking[]> {
  try {
    const actor = await getActor();
    const items = await actor.getAllBookings();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return items.map((b: any) => ({
      id: Number(b.id),
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      customerEmail: b.customerEmail,
      driverName: b.driverName,
      driverId: b.driverId,
      pickupAddress: b.pickupAddress,
      dropAddress: b.dropAddress,
      startDate: b.startDate,
      endDate: b.endDate,
      days: Number(b.days),
      total: Number(b.total),
      insurance: b.insurance,
      status: b.status,
      driverPhone: b.driverPhone,
      createdAt: b.createdAt,
    }));
  } catch (e) {
    console.warn("Backend getAllBookings failed, using localStorage", e);
    try {
      return JSON.parse(localStorage.getItem("driveease_bookings") || "[]");
    } catch {
      return [];
    }
  }
}

export async function apiUpdateBookingStatus(
  id: number,
  status: string,
): Promise<void> {
  try {
    const actor = await getActor();
    await actor.updateBookingStatus(BigInt(id), status);
  } catch (e) {
    console.warn("Backend updateBookingStatus failed", e);
  }
  // Also update localStorage
  try {
    const bookings = JSON.parse(
      localStorage.getItem("driveease_bookings") || "[]",
    );
    const updated = bookings.map((b: ApiBooking) =>
      b.id === id ? { ...b, status } : b,
    );
    localStorage.setItem("driveease_bookings", JSON.stringify(updated));
  } catch {
    /* ignore */
  }
}

// ---- Registrations ----

export interface ApiRegistration {
  id: number;
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  status: string;
  submittedAt: string;
  vehicleType?: string;
  licenseNumber?: string;
  experience?: string;
  languages?: string;
  workAreas?: string;
}

export async function apiSaveRegistration(
  r: Omit<ApiRegistration, "id" | "status">,
): Promise<number> {
  try {
    const actor = await getActor();
    const id = await actor.saveRegistration(
      r.name,
      r.phone,
      r.email,
      r.city,
      r.state,
      r.submittedAt,
      r.vehicleType || "",
      r.licenseNumber || "",
      r.experience || "",
      r.languages || "",
      r.workAreas || "",
    );
    return Number(id);
  } catch (e) {
    console.warn("Backend saveRegistration failed, using localStorage", e);
    return Date.now();
  }
}

export async function apiGetRegistrations(): Promise<ApiRegistration[]> {
  try {
    const actor = await getActor();
    const items = await actor.getAllRegistrations();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return items.map((r: any) => ({
      id: Number(r.id),
      name: r.name,
      phone: r.phone,
      email: r.email,
      city: r.city,
      state: r.state,
      status: r.status,
      submittedAt: r.submittedAt,
      vehicleType: r.vehicleType,
      licenseNumber: r.licenseNumber,
      experience: r.experience,
      languages: r.languages,
      workAreas: r.workAreas,
    }));
  } catch (e) {
    console.warn("Backend getAllRegistrations failed, using localStorage", e);
    try {
      return JSON.parse(
        localStorage.getItem("driveease_registrations") || "[]",
      );
    } catch {
      return [];
    }
  }
}

export async function apiUpdateRegistrationStatus(
  id: number,
  status: string,
): Promise<void> {
  try {
    const actor = await getActor();
    await actor.updateRegistrationStatus(BigInt(id), status);
  } catch (e) {
    console.warn("Backend updateRegistrationStatus failed", e);
  }
  try {
    const regs = JSON.parse(
      localStorage.getItem("driveease_registrations") || "[]",
    );
    const updated = regs.map((r: ApiRegistration) =>
      r.id === id ? { ...r, status } : r,
    );
    localStorage.setItem("driveease_registrations", JSON.stringify(updated));
  } catch {
    /* ignore */
  }
}

// ---- OTP Logins ----

export interface ApiOtpLogin {
  id: number;
  name: string;
  phone: string;
  loginTime: string;
}

export async function apiSaveOtpLogin(
  name: string,
  phone: string,
  loginTime: string,
): Promise<void> {
  try {
    const actor = await getActor();
    await actor.saveOtpLogin(name, phone, loginTime);
  } catch (e) {
    console.warn("Backend saveOtpLogin failed", e);
  }
}

export async function apiGetOtpLogins(): Promise<ApiOtpLogin[]> {
  try {
    const actor = await getActor();
    const items = await actor.getAllOtpLogins();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return items.map((l: any) => ({
      id: Number(l.id),
      name: l.name,
      phone: l.phone,
      loginTime: l.loginTime,
    }));
  } catch (e) {
    console.warn("Backend getAllOtpLogins failed, using localStorage", e);
    try {
      return JSON.parse(localStorage.getItem("driveease_otplogins") || "[]");
    } catch {
      return [];
    }
  }
}

// ---- Enquiries ----

export interface ApiEnquiry {
  id: number;
  name: string;
  phone: string;
  email: string;
  planType: string;
  city: string;
  familyMembers: number;
  message: string;
  submittedAt: string;
  status: string;
}

export async function apiSaveEnquiry(
  e: Omit<ApiEnquiry, "id" | "status">,
): Promise<void> {
  try {
    const actor = await getActor();
    await actor.saveEnquiry(
      e.name,
      e.phone,
      e.email,
      e.planType,
      e.city,
      BigInt(e.familyMembers),
      e.message,
      e.submittedAt,
    );
  } catch (err) {
    console.warn("Backend saveEnquiry failed", err);
  }
}

export async function apiGetEnquiries(): Promise<ApiEnquiry[]> {
  try {
    const actor = await getActor();
    const items = await actor.getAllEnquiries();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return items.map((e: any) => ({
      id: Number(e.id),
      name: e.name,
      phone: e.phone,
      email: e.email,
      planType: e.planType,
      city: e.city,
      familyMembers: Number(e.familyMembers),
      message: e.message,
      submittedAt: e.submittedAt,
      status: e.status,
    }));
  } catch (err) {
    console.warn("Backend getAllEnquiries failed, using localStorage", err);
    try {
      return JSON.parse(localStorage.getItem("driveease_enquiries") || "[]");
    } catch {
      return [];
    }
  }
}

export async function apiUpdateEnquiryStatus(
  id: number,
  status: string,
): Promise<void> {
  try {
    const actor = await getActor();
    await actor.updateEnquiryStatus(BigInt(id), status);
  } catch (e) {
    console.warn("Backend updateEnquiryStatus failed", e);
  }
  try {
    const enquiries = JSON.parse(
      localStorage.getItem("driveease_enquiries") || "[]",
    );
    const updated = enquiries.map((e: ApiEnquiry) =>
      e.id === id ? { ...e, status } : e,
    );
    localStorage.setItem("driveease_enquiries", JSON.stringify(updated));
  } catch {
    /* ignore */
  }
}

// ---- Driver Online Status ----

export interface ApiDriverStatus {
  phone: string;
  name: string;
  city: string;
  driverId: string;
  status: string; // 'online' | 'offline'
  lastUpdated: string;
}

export async function apiSetDriverOnlineStatus(
  ds: ApiDriverStatus,
): Promise<void> {
  try {
    const actor = await getActor();
    await actor.setDriverOnlineStatus(
      ds.phone,
      ds.name,
      ds.city,
      ds.driverId,
      ds.status,
      ds.lastUpdated,
    );
  } catch (e) {
    console.warn("Backend setDriverOnlineStatus failed", e);
  }
  // Also update localStorage for same-device fast reads
  try {
    const statusMap = JSON.parse(
      localStorage.getItem("driveease_driver_status") || "{}",
    );
    statusMap[ds.phone] = ds.status;
    statusMap[ds.driverId] = ds.status;
    localStorage.setItem("driveease_driver_status", JSON.stringify(statusMap));
  } catch {
    /* ignore */
  }
}

export async function apiGetOnlineDrivers(): Promise<ApiDriverStatus[]> {
  try {
    const actor = await getActor();
    const items = await actor.getOnlineDrivers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return items.map((d: any) => ({
      phone: d.phone,
      name: d.name,
      city: d.city,
      driverId: d.driverId,
      status: d.status,
      lastUpdated: d.lastUpdated,
    }));
  } catch (e) {
    console.warn("Backend getOnlineDrivers failed, using localStorage", e);
    // Fallback: return nothing (live drivers page will use localStorage)
    return [];
  }
}

export async function apiGetAllDriverStatuses(): Promise<ApiDriverStatus[]> {
  try {
    const actor = await getActor();
    const items = await actor.getDriverOnlineStatuses();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return items.map((d: any) => ({
      phone: d.phone,
      name: d.name,
      city: d.city,
      driverId: d.driverId,
      status: d.status,
      lastUpdated: d.lastUpdated,
    }));
  } catch (e) {
    console.warn("Backend getDriverOnlineStatuses failed", e);
    return [];
  }
}
