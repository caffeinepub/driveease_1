// @ts-nocheck
export const idlFactory = ({ IDL }) => {
  const Booking = IDL.Record({
    'id': IDL.Nat,
    'customerName': IDL.Text,
    'customerPhone': IDL.Text,
    'customerEmail': IDL.Text,
    'driverName': IDL.Text,
    'driverId': IDL.Text,
    'pickupAddress': IDL.Text,
    'dropAddress': IDL.Text,
    'startDate': IDL.Text,
    'endDate': IDL.Text,
    'days': IDL.Nat,
    'total': IDL.Nat,
    'insurance': IDL.Bool,
    'status': IDL.Text,
    'driverPhone': IDL.Text,
    'createdAt': IDL.Text,
  });
  const Registration = IDL.Record({
    'id': IDL.Nat,
    'name': IDL.Text,
    'phone': IDL.Text,
    'email': IDL.Text,
    'city': IDL.Text,
    'state': IDL.Text,
    'status': IDL.Text,
    'submittedAt': IDL.Text,
    'vehicleType': IDL.Text,
    'licenseNumber': IDL.Text,
    'experience': IDL.Text,
    'languages': IDL.Text,
    'workAreas': IDL.Text,
  });
  const OtpLogin = IDL.Record({
    'id': IDL.Nat,
    'name': IDL.Text,
    'phone': IDL.Text,
    'loginTime': IDL.Text,
  });
  const Enquiry = IDL.Record({
    'id': IDL.Nat,
    'name': IDL.Text,
    'phone': IDL.Text,
    'email': IDL.Text,
    'planType': IDL.Text,
    'city': IDL.Text,
    'familyMembers': IDL.Nat,
    'message': IDL.Text,
    'submittedAt': IDL.Text,
    'status': IDL.Text,
  });
  const DriverStatus = IDL.Record({
    'phone': IDL.Text,
    'name': IDL.Text,
    'city': IDL.Text,
    'driverId': IDL.Text,
    'status': IDL.Text,
    'lastUpdated': IDL.Text,
  });
  return IDL.Service({
    'saveBooking': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat, IDL.Nat, IDL.Bool, IDL.Text, IDL.Text], [IDL.Nat], []),
    'getAllBookings': IDL.Func([], [IDL.Vec(Booking)], ['query']),
    'updateBookingStatus': IDL.Func([IDL.Nat, IDL.Text], [], []),
    'saveRegistration': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
    'getAllRegistrations': IDL.Func([], [IDL.Vec(Registration)], ['query']),
    'updateRegistrationStatus': IDL.Func([IDL.Nat, IDL.Text], [], []),
    'saveOtpLogin': IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
    'getAllOtpLogins': IDL.Func([], [IDL.Vec(OtpLogin)], ['query']),
    'saveEnquiry': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text], [IDL.Nat], []),
    'getAllEnquiries': IDL.Func([], [IDL.Vec(Enquiry)], ['query']),
    'updateEnquiryStatus': IDL.Func([IDL.Nat, IDL.Text], [], []),
    'setDriverOnlineStatus': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text], [], []),
    'getDriverOnlineStatuses': IDL.Func([], [IDL.Vec(DriverStatus)], ['query']),
    'getOnlineDrivers': IDL.Func([], [IDL.Vec(DriverStatus)], ['query']),
  });
};
export const idlInitArgs = [];
export const init = ({ IDL }) => { return []; };
