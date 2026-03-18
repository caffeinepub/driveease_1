import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface SubscriptionEnquiry {
    id: bigint;
    familyMembersCount: bigint;
    city: string;
    name: string;
    email: string;
    message: string;
    timestamp: bigint;
    phone: string;
    planType: string;
    requesterPrincipal: Principal;
}
export interface DriverRegistrationRequest {
    id: bigint;
    paymentStatus: boolean;
    submissionTimestamp: bigint;
    city: string;
    name: string;
    selfieDoc: ExternalBlob;
    email: string;
    state: string;
    aadharDoc: ExternalBlob;
    licenseDoc: ExternalBlob;
    phone: string;
    panDoc: ExternalBlob;
    verificationStatus: RegistrationStatus;
    requesterPrincipal: Principal;
}
export interface SavedAddress {
    addressLabel: string;
    address: string;
    customerId: Principal;
}
export interface DriverProfile {
    id: bigint;
    city: string;
    name: string;
    languages: Array<string>;
    isAvailable: boolean;
    photoUrl: string;
    trustBadges: Array<string>;
    pricePerDay: bigint;
    state: string;
    experienceYears: bigint;
    isVerified: boolean;
    rating: bigint;
    phone: string;
}
export interface OtpLoginRecord {
    name: string;
    timestamp: bigint;
    phone: string;
}
export interface Booking {
    id: bigint;
    customerName: string;
    status: BookingStatus;
    driverId: bigint;
    endDate: bigint;
    customerPhone: string;
    customerPrincipal: Principal;
    feedbackMessage?: string;
    sosFlag: boolean;
    pickupAddress: string;
    daysCount: bigint;
    insuranceOpted: boolean;
    createdTimestamp: bigint;
    totalPrice: bigint;
    customerEmail: string;
    dropAddress: string;
    startDate: bigint;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    confirmed = "confirmed"
}
export enum RegistrationStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveDriverRegistration(registrationId: bigint, isApproved: boolean): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelBooking(bookingId: bigint): Promise<void>;
    confirmBooking(bookingId: bigint): Promise<void>;
    createBooking(driverId: bigint, customerName: string, customerPhone: string, customerEmail: string, pickupAddress: string, dropAddress: string, startDate: bigint, endDate: bigint, daysCount: bigint, totalPrice: bigint, insuranceOpted: boolean): Promise<bigint>;
    filterDriversByCity(city: string): Promise<Array<DriverProfile>>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllDrivers(): Promise<Array<DriverProfile>>;
    getAllEnquiries(): Promise<Array<SubscriptionEnquiry>>;
    getAllRegistrations(): Promise<Array<DriverRegistrationRequest>>;
    getBookingsByCustomer(): Promise<Array<Booking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDriverById(driverId: bigint): Promise<DriverProfile | null>;
    getOtpLoginRecords(): Promise<Array<OtpLoginRecord>>;
    getSavedAddresses(): Promise<Array<SavedAddress>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeApp(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listAvailableDrivers(): Promise<Array<DriverProfile>>;
    markSosForBooking(bookingId: bigint): Promise<void>;
    recordOtpLogin(phone: string, name: string): Promise<void>;
    registerDriver(name: string, phone: string, email: string, city: string, state: string, aadharDoc: ExternalBlob, panDoc: ExternalBlob, licenseDoc: ExternalBlob, selfieDoc: ExternalBlob): Promise<bigint>;
    removeDriver(driverId: bigint): Promise<void>;
    saveAddress(addressLabel: string, address: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendFeedbackMessage(bookingId: bigint, message: string): Promise<void>;
    submitSubscriptionEnquiry(name: string, phone: string, email: string, planType: string, familyMembersCount: bigint, city: string, message: string): Promise<bigint>;
    updateDriverRate(driverId: bigint, newPricePerDay: bigint): Promise<void>;
}
