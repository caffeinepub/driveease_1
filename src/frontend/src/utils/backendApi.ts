/**
 * backendApi.ts
 * Wraps all ICP backend canister calls for shared cross-device data storage.
 * Uses the legacy backend interface (getAllBookings, getAllRegistrations, etc.)
 * which is the actual deployed interface. Falls back to localStorage on error.
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

function tsToIST(ts: unknown): string {
  try {
    const n = Number(ts);
    if (!n) return String(ts);
    // timestamps from bigint could be seconds or milliseconds
    const ms = n > 1e12 ? n : n * 1000;
    return new Date(ms).toISOString();
  } catch {
    return String(ts);
  }
}

export async function apiSaveBooking(
  b: Omit<ApiBooking, "id">,
): Promise<number> {
  try {
    const actor = await getActor();
    // Try new custom saveBooking (may exist in newer deployments)
    if (typeof actor.saveBooking === "function") {
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
    }
    // Fall back to legacy createBooking
    const driverIdNum = Number.isNaN(Number(b.driverId))
      ? 0
      : Number(b.driverId);
    const startMs = new Date(b.startDate).getTime() || Date.now();
    const endMs = new Date(b.endDate).getTime() || Date.now();
    const id = await actor.createBooking(
      BigInt(driverIdNum),
      b.customerName,
      b.customerPhone,
      b.customerEmail,
      b.pickupAddress,
      b.dropAddress,
      BigInt(startMs),
      BigInt(endMs),
      BigInt(b.days),
      BigInt(b.total),
      b.insurance,
    );
    return Number(id);
  } catch (e) {
    console.warn("Backend saveBooking failed, using localStorage", e);
    return Date.now();
  }
}

export async function apiGetBookings(): Promise<ApiBooking[]> {
  const localData: ApiBooking[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("driveease_bookings") || "[]");
    } catch {
      return [];
    }
  })();

  try {
    const actor = await getActor();
    const items = await actor.getAllBookings();
    if (!Array.isArray(items) || items.length === 0) {
      return localData;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const backendData: ApiBooking[] = items.map((b: any) => {
      // Support both new DriveBooking format (text fields) and legacy Booking (bigint fields)
      const isLegacy =
        typeof b.driverId === "bigint" || typeof b.driverId === "number";
      return {
        id: Number(b.id),
        customerName: b.customerName || "",
        customerPhone: b.customerPhone || "",
        customerEmail: b.customerEmail || "",
        driverName: b.driverName || "",
        driverId: isLegacy ? String(b.driverId) : b.driverId || "",
        pickupAddress: b.pickupAddress || "",
        dropAddress: b.dropAddress || "",
        startDate: isLegacy ? tsToIST(b.startDate) : b.startDate || "",
        endDate: isLegacy ? tsToIST(b.endDate) : b.endDate || "",
        days: Number(b.days ?? b.daysCount ?? 1),
        total: Number(b.total ?? b.totalPrice ?? 0),
        insurance: !!(b.insurance ?? b.insuranceOpted),
        status:
          typeof b.status === "object"
            ? Object.keys(b.status)[0]
            : b.status || "pending",
        driverPhone: b.driverPhone || "",
        createdAt: isLegacy
          ? tsToIST(b.createdTimestamp || b.createdAt)
          : b.createdAt || new Date().toISOString(),
      };
    });

    // Merge: backend IDs take priority, append local-only items
    const backendIds = new Set(backendData.map((b) => b.id));
    const merged = [
      ...backendData,
      ...localData.filter((l) => !backendIds.has(l.id)),
    ];
    return merged.sort((a, b) => b.id - a.id);
  } catch (e) {
    console.warn("Backend getAllBookings failed, using localStorage", e);
    return localData;
  }
}

export async function apiUpdateBookingStatus(
  id: number,
  status: string,
): Promise<void> {
  try {
    const actor = await getActor();
    if (typeof actor.updateBookingStatus === "function") {
      await actor.updateBookingStatus(BigInt(id), status);
    } else if (
      status === "confirmed" &&
      typeof actor.confirmBooking === "function"
    ) {
      await actor.confirmBooking(BigInt(id));
    } else if (
      status === "cancelled" &&
      typeof actor.cancelBooking === "function"
    ) {
      await actor.cancelBooking(BigInt(id));
    }
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
    if (typeof actor.saveRegistration === "function") {
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
    }
    // Legacy registerDriver - no vehicleType etc., but saves the driver
    // Note: requires ExternalBlob for documents, not available here - skip
  } catch (e) {
    console.warn("Backend saveRegistration failed, using localStorage", e);
  }
  return Date.now();
}

export async function apiGetRegistrations(): Promise<ApiRegistration[]> {
  const localData: ApiRegistration[] = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("driveease_registrations") || "[]",
      );
    } catch {
      return [];
    }
  })();

  try {
    const actor = await getActor();
    const items = await actor.getAllRegistrations();
    if (!Array.isArray(items) || items.length === 0) {
      return localData;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const backendData: ApiRegistration[] = items.map((r: any) => {
      // Support both new DriveRegistration (text status) and legacy DriverRegistrationRequest (enum status)
      const statusVal =
        typeof r.status === "object"
          ? Object.keys(r.status)[0]
          : r.status ||
            (typeof r.verificationStatus === "object"
              ? Object.keys(r.verificationStatus)[0]
              : r.verificationStatus || "pending");
      return {
        id: Number(r.id),
        name: r.name || "",
        phone: r.phone || "",
        email: r.email || "",
        city: r.city || "",
        state: r.state || "",
        status: statusVal,
        submittedAt:
          r.submittedAt ||
          (r.submissionTimestamp
            ? tsToIST(r.submissionTimestamp)
            : new Date().toISOString()),
        vehicleType: r.vehicleType || "",
        licenseNumber: r.licenseNumber || r.licenseDoc?.getDirectURL?.() || "",
        experience: r.experience || "",
        languages: r.languages || "",
        workAreas: r.workAreas || "",
      };
    });

    const backendIds = new Set(backendData.map((r) => r.id));
    const merged = [
      ...backendData,
      ...localData.filter((l) => !backendIds.has(l.id)),
    ];
    return merged.sort((a, b) => b.id - a.id);
  } catch (e) {
    console.warn("Backend getAllRegistrations failed, using localStorage", e);
    return localData;
  }
}

export async function apiUpdateRegistrationStatus(
  id: number,
  status: string,
): Promise<void> {
  try {
    const actor = await getActor();
    if (typeof actor.updateRegistrationStatus === "function") {
      await actor.updateRegistrationStatus(BigInt(id), status);
    } else if (typeof actor.approveDriverRegistration === "function") {
      await actor.approveDriverRegistration(BigInt(id), status === "approved");
    }
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
    if (typeof actor.saveOtpLogin === "function") {
      await actor.saveOtpLogin(name, phone, loginTime);
    } else if (typeof actor.recordOtpLogin === "function") {
      await actor.recordOtpLogin(phone, name);
    }
  } catch (e) {
    console.warn("Backend saveOtpLogin failed", e);
  }
  // Also save to localStorage
  try {
    const logins = JSON.parse(
      localStorage.getItem("driveease_otplogins") || "[]",
    );
    logins.unshift({ id: Date.now(), name, phone, loginTime });
    localStorage.setItem(
      "driveease_otplogins",
      JSON.stringify(logins.slice(0, 200)),
    );
  } catch {
    /* ignore */
  }
}

export async function apiGetOtpLogins(): Promise<ApiOtpLogin[]> {
  const localData: ApiOtpLogin[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("driveease_otplogins") || "[]");
    } catch {
      return [];
    }
  })();

  try {
    const actor = await getActor();
    let items: unknown[] = [];
    if (typeof actor.getAllOtpLogins === "function") {
      items = await actor.getAllOtpLogins();
    } else if (typeof actor.getOtpLoginRecords === "function") {
      items = await actor.getOtpLoginRecords();
    }
    if (!Array.isArray(items) || items.length === 0) return localData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const backendData: ApiOtpLogin[] = items.map((l: any, idx: number) => ({
      id: Number(l.id ?? idx + 1),
      name: l.name || "",
      phone: l.phone || "",
      loginTime:
        l.loginTime || tsToIST(l.timestamp) || new Date().toISOString(),
    }));
    const phones = new Set(backendData.map((l) => l.phone));
    const merged = [
      ...backendData,
      ...localData.filter((l) => !phones.has(l.phone)),
    ];
    return merged.sort((a, b) => b.id - a.id);
  } catch (e) {
    console.warn("Backend getAllOtpLogins failed, using localStorage", e);
    return localData;
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
    if (typeof actor.saveEnquiry === "function") {
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
    } else if (typeof actor.submitSubscriptionEnquiry === "function") {
      await actor.submitSubscriptionEnquiry(
        e.name,
        e.phone,
        e.email,
        e.planType,
        BigInt(e.familyMembers),
        e.city,
        e.message,
      );
    }
  } catch (err) {
    console.warn("Backend saveEnquiry failed", err);
  }
  // Also save to localStorage
  try {
    const enqs = JSON.parse(
      localStorage.getItem("driveease_enquiries") || "[]",
    );
    enqs.unshift({ id: Date.now(), ...e, status: "new" });
    localStorage.setItem(
      "driveease_enquiries",
      JSON.stringify(enqs.slice(0, 200)),
    );
  } catch {
    /* ignore */
  }
}

export async function apiGetEnquiries(): Promise<ApiEnquiry[]> {
  const localData: ApiEnquiry[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("driveease_enquiries") || "[]");
    } catch {
      return [];
    }
  })();

  try {
    const actor = await getActor();
    const items = await actor.getAllEnquiries();
    if (!Array.isArray(items) || items.length === 0) return localData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const backendData: ApiEnquiry[] = items.map((e: any) => ({
      id: Number(e.id),
      name: e.name || "",
      phone: e.phone || "",
      email: e.email || "",
      planType: e.planType || "",
      city: e.city || "",
      familyMembers: Number(e.familyMembers ?? e.familyMembersCount ?? 0),
      message: e.message || "",
      submittedAt:
        e.submittedAt || tsToIST(e.timestamp) || new Date().toISOString(),
      status: e.status || "new",
    }));
    const backendIds = new Set(backendData.map((e) => e.id));
    const merged = [
      ...backendData,
      ...localData.filter((l) => !backendIds.has(l.id)),
    ];
    return merged.sort((a, b) => b.id - a.id);
  } catch (err) {
    console.warn("Backend getAllEnquiries failed, using localStorage", err);
    return localData;
  }
}

export async function apiUpdateEnquiryStatus(
  id: number,
  status: string,
): Promise<void> {
  try {
    const actor = await getActor();
    if (typeof actor.updateEnquiryStatus === "function") {
      await actor.updateEnquiryStatus(BigInt(id), status);
    }
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
    if (typeof actor.setDriverOnlineStatus === "function") {
      await actor.setDriverOnlineStatus(
        ds.phone,
        ds.name,
        ds.city,
        ds.driverId,
        ds.status,
        ds.lastUpdated,
      );
    }
  } catch (e) {
    console.warn("Backend setDriverOnlineStatus failed", e);
  }
  // Always update localStorage for same-device fast reads
  try {
    const statusMap = JSON.parse(
      localStorage.getItem("driveease_driver_status") || "{}",
    );
    statusMap[ds.phone] = ds.status;
    statusMap[ds.driverId] = ds.status;
    localStorage.setItem("driveease_driver_status", JSON.stringify(statusMap));
    // Also update the online sessions
    const sessions = JSON.parse(
      localStorage.getItem("driveease_online_sessions") || "{}",
    );
    if (ds.status === "online") {
      sessions[ds.phone] = new Date().toISOString();
    } else {
      delete sessions[ds.phone];
    }
    localStorage.setItem("driveease_online_sessions", JSON.stringify(sessions));
  } catch {
    /* ignore */
  }
}

export async function apiGetOnlineDrivers(): Promise<ApiDriverStatus[]> {
  try {
    const actor = await getActor();
    if (typeof actor.getOnlineDrivers === "function") {
      const items = await actor.getOnlineDrivers();
      if (Array.isArray(items) && items.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return items.map((d: any) => ({
          phone: d.phone,
          name: d.name,
          city: d.city,
          driverId: d.driverId,
          status: d.status,
          lastUpdated: d.lastUpdated,
        }));
      }
    }
  } catch (e) {
    console.warn("Backend getOnlineDrivers failed", e);
  }
  return [];
}

export async function apiGetAllDriverStatuses(): Promise<ApiDriverStatus[]> {
  try {
    const actor = await getActor();
    if (typeof actor.getDriverOnlineStatuses === "function") {
      const items = await actor.getDriverOnlineStatuses();
      if (Array.isArray(items) && items.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return items.map((d: any) => ({
          phone: d.phone,
          name: d.name,
          city: d.city,
          driverId: d.driverId,
          status: d.status,
          lastUpdated: d.lastUpdated,
        }));
      }
    }
  } catch (e) {
    console.warn("Backend getDriverOnlineStatuses failed", e);
  }
  // Fallback: build from localStorage driver status map
  try {
    const statusMap = JSON.parse(
      localStorage.getItem("driveease_driver_status") || "{}",
    );
    const regs = JSON.parse(
      localStorage.getItem("driveease_registrations") || "[]",
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return regs
      .filter((r: any) => r.status === "approved")
      .map((r: any) => ({
        phone: r.phone,
        name: r.name,
        city: r.city,
        driverId: String(r.id),
        status: statusMap[r.phone] === "online" ? "online" : "offline",
        lastUpdated: new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}
