/* eslint-disable */
// @ts-nocheck
// Manually written to match new DriveEase backend

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export interface Booking {
  'id': bigint;
  'customerName': string;
  'customerPhone': string;
  'customerEmail': string;
  'driverName': string;
  'driverId': string;
  'pickupAddress': string;
  'dropAddress': string;
  'startDate': string;
  'endDate': string;
  'days': bigint;
  'total': bigint;
  'insurance': boolean;
  'status': string;
  'driverPhone': string;
  'createdAt': string;
}

export interface Registration {
  'id': bigint;
  'name': string;
  'phone': string;
  'email': string;
  'city': string;
  'state': string;
  'status': string;
  'submittedAt': string;
  'vehicleType': string;
  'licenseNumber': string;
  'experience': string;
  'languages': string;
  'workAreas': string;
}

export interface OtpLogin {
  'id': bigint;
  'name': string;
  'phone': string;
  'loginTime': string;
}

export interface Enquiry {
  'id': bigint;
  'name': string;
  'phone': string;
  'email': string;
  'planType': string;
  'city': string;
  'familyMembers': bigint;
  'message': string;
  'submittedAt': string;
  'status': string;
}

export interface DriverStatus {
  'phone': string;
  'name': string;
  'city': string;
  'driverId': string;
  'status': string;
  'lastUpdated': string;
}

export interface _SERVICE {
  'saveBooking': ActorMethod<[string, string, string, string, string, string, string, string, string, bigint, bigint, boolean, string, string], bigint>;
  'getAllBookings': ActorMethod<[], Array<Booking>>;
  'updateBookingStatus': ActorMethod<[bigint, string], undefined>;
  'saveRegistration': ActorMethod<[string, string, string, string, string, string, string, string, string, string, string], bigint>;
  'getAllRegistrations': ActorMethod<[], Array<Registration>>;
  'updateRegistrationStatus': ActorMethod<[bigint, string], undefined>;
  'saveOtpLogin': ActorMethod<[string, string, string], bigint>;
  'getAllOtpLogins': ActorMethod<[], Array<OtpLogin>>;
  'saveEnquiry': ActorMethod<[string, string, string, string, string, bigint, string, string], bigint>;
  'getAllEnquiries': ActorMethod<[], Array<Enquiry>>;
  'updateEnquiryStatus': ActorMethod<[bigint, string], undefined>;
  'setDriverOnlineStatus': ActorMethod<[string, string, string, string, string, string], undefined>;
  'getDriverOnlineStatuses': ActorMethod<[], Array<DriverStatus>>;
  'getOnlineDrivers': ActorMethod<[], Array<DriverStatus>>;
}

export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
