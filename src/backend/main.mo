import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Int "mo:core/Int";
import List "mo:core/List";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  // ===== LEGACY STABLE VARS (kept for upgrade compatibility) =====
  // These match the previous backend's stable state exactly.
  // They are not used by new functions but must be declared to allow upgrade.

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Legacy types (matching old backend)
  type LegacyBookingStatus = { #pending; #confirmed; #cancelled };
  type LegacyBooking = {
    id : Nat;
    driverId : Nat;
    customerPrincipal : Principal;
    customerName : Text;
    customerPhone : Text;
    customerEmail : Text;
    pickupAddress : Text;
    dropAddress : Text;
    startDate : Int;
    endDate : Int;
    daysCount : Nat;
    totalPrice : Nat;
    status : LegacyBookingStatus;
    sosFlag : Bool;
    insuranceOpted : Bool;
    createdTimestamp : Int;
    feedbackMessage : ?Text;
  };
  type LegacyDriverProfile = {
    id : Nat;
    name : Text;
    city : Text;
    state : Text;
    experienceYears : Nat;
    languages : [Text];
    rating : Nat;
    pricePerDay : Nat;
    isAvailable : Bool;
    isVerified : Bool;
    trustBadges : [Text];
    phone : Text;
    photoUrl : Text;
  };
  type LegacyRegistrationStatus = { #pending; #approved; #rejected };
  type LegacyDriverRegistrationRequest = {
    id : Nat;
    requesterPrincipal : Principal;
    name : Text;
    phone : Text;
    email : Text;
    city : Text;
    state : Text;
    aadharDoc : Storage.ExternalBlob;
    panDoc : Storage.ExternalBlob;
    licenseDoc : Storage.ExternalBlob;
    selfieDoc : Storage.ExternalBlob;
    paymentStatus : Bool;
    verificationStatus : LegacyRegistrationStatus;
    submissionTimestamp : Int;
  };
  type LegacySavedAddress = {
    customerId : Principal;
    addressLabel : Text;
    address : Text;
  };
  type LegacySubscriptionEnquiry = {
    id : Nat;
    requesterPrincipal : Principal;
    name : Text;
    phone : Text;
    email : Text;
    planType : Text;
    familyMembersCount : Nat;
    city : Text;
    message : Text;
    timestamp : Int;
  };
  type LegacyOtpLoginRecord = {
    phone : Text;
    name : Text;
    timestamp : Int;
  };
  type LegacyUserProfile = {
    name : Text;
    phone : Text;
    email : Text;
  };

  // Legacy stable variables — declare with old names/types so upgrade works
  let bookings = Map.empty<Nat, LegacyBooking>();
  let drivers = Map.empty<Nat, LegacyDriverProfile>();
  let registrationRequests = Map.empty<Nat, LegacyDriverRegistrationRequest>();
  let savedAddresses = Map.empty<Principal, List.List<LegacySavedAddress>>();
  let subscriptionEnquiries = Map.empty<Nat, LegacySubscriptionEnquiry>();
  let otpLoginRecords = Map.empty<Nat, LegacyOtpLoginRecord>();
  let userProfiles = Map.empty<Principal, LegacyUserProfile>();
  var nextBookingId = 1;
  var nextRegistrationId = 1;
  var nextEnquiryId = 1;
  var nextOtpLoginRecordId = 1;

  // ===== NEW TYPES =====

  public type DriveBooking = {
    id : Nat;
    customerName : Text;
    customerPhone : Text;
    customerEmail : Text;
    driverName : Text;
    driverId : Text;
    pickupAddress : Text;
    dropAddress : Text;
    startDate : Text;
    endDate : Text;
    days : Nat;
    total : Nat;
    insurance : Bool;
    status : Text;
    driverPhone : Text;
    createdAt : Text;
  };

  public type DriveRegistration = {
    id : Nat;
    name : Text;
    phone : Text;
    email : Text;
    city : Text;
    state : Text;
    status : Text;
    submittedAt : Text;
    vehicleType : Text;
    licenseNumber : Text;
    experience : Text;
    languages : Text;
    workAreas : Text;
  };

  public type DriveOtpLogin = {
    id : Nat;
    name : Text;
    phone : Text;
    loginTime : Text;
  };

  public type DriveEnquiry = {
    id : Nat;
    name : Text;
    phone : Text;
    email : Text;
    planType : Text;
    city : Text;
    familyMembers : Nat;
    message : Text;
    submittedAt : Text;
    status : Text;
  };

  public type DriverStatus = {
    phone : Text;
    name : Text;
    city : Text;
    driverId : Text;
    status : Text;
    lastUpdated : Text;
  };

  // ===== NEW STABLE STATE =====

  let driveBookings = Map.empty<Nat, DriveBooking>();
  let driveRegistrations = Map.empty<Nat, DriveRegistration>();
  let driveOtpLogins = Map.empty<Nat, DriveOtpLogin>();
  let driveEnquiries = Map.empty<Nat, DriveEnquiry>();
  let driverStatuses = Map.empty<Text, DriverStatus>();

  var nextDriveBookingId = 1;
  var nextDriveRegistrationId = 1;
  var nextDriveOtpLoginId = 1;
  var nextDriveEnquiryId = 1;

  // ===== NEW PUBLIC API =====

  // ---- Bookings ----

  public shared func saveBooking(
    customerName : Text,
    customerPhone : Text,
    customerEmail : Text,
    driverName : Text,
    driverId : Text,
    pickupAddress : Text,
    dropAddress : Text,
    startDate : Text,
    endDate : Text,
    days : Nat,
    total : Nat,
    insurance : Bool,
    driverPhone : Text,
    createdAt : Text,
  ) : async Nat {
    let id = nextDriveBookingId;
    let booking : DriveBooking = {
      id;
      customerName;
      customerPhone;
      customerEmail;
      driverName;
      driverId;
      pickupAddress;
      dropAddress;
      startDate;
      endDate;
      days;
      total;
      insurance;
      status = "pending";
      driverPhone;
      createdAt;
    };
    driveBookings.add(id, booking);
    nextDriveBookingId += 1;
    id;
  };

  public query func getAllBookings() : async [DriveBooking] {
    driveBookings.values().toArray();
  };

  public shared func updateBookingStatus(id : Nat, status : Text) : async () {
    switch (driveBookings.get(id)) {
      case (?b) { driveBookings.add(id, { b with status }) };
      case (null) {};
    };
  };

  // ---- Registrations ----

  public shared func saveRegistration(
    name : Text,
    phone : Text,
    email : Text,
    city : Text,
    state : Text,
    submittedAt : Text,
    vehicleType : Text,
    licenseNumber : Text,
    experience : Text,
    langs : Text,
    workAreas : Text,
  ) : async Nat {
    let id = nextDriveRegistrationId;
    let reg : DriveRegistration = {
      id;
      name;
      phone;
      email;
      city;
      state;
      status = "pending";
      submittedAt;
      vehicleType;
      licenseNumber;
      experience;
      languages = langs;
      workAreas;
    };
    driveRegistrations.add(id, reg);
    nextDriveRegistrationId += 1;
    id;
  };

  public query func getAllRegistrations() : async [DriveRegistration] {
    driveRegistrations.values().toArray();
  };

  public shared func updateRegistrationStatus(id : Nat, status : Text) : async () {
    switch (driveRegistrations.get(id)) {
      case (?r) { driveRegistrations.add(id, { r with status }) };
      case (null) {};
    };
  };

  // ---- OTP Logins ----

  public shared func saveOtpLogin(name : Text, phone : Text, loginTime : Text) : async Nat {
    let id = nextDriveOtpLoginId;
    let login : DriveOtpLogin = { id; name; phone; loginTime };
    driveOtpLogins.add(id, login);
    nextDriveOtpLoginId += 1;
    id;
  };

  public query func getAllOtpLogins() : async [DriveOtpLogin] {
    driveOtpLogins.values().toArray();
  };

  // ---- Enquiries ----

  public shared func saveEnquiry(
    name : Text,
    phone : Text,
    email : Text,
    planType : Text,
    city : Text,
    familyMembers : Nat,
    message : Text,
    submittedAt : Text,
  ) : async Nat {
    let id = nextDriveEnquiryId;
    let enquiry : DriveEnquiry = {
      id;
      name;
      phone;
      email;
      planType;
      city;
      familyMembers;
      message;
      submittedAt;
      status = "new";
    };
    driveEnquiries.add(id, enquiry);
    nextDriveEnquiryId += 1;
    id;
  };

  public query func getAllEnquiries() : async [DriveEnquiry] {
    driveEnquiries.values().toArray();
  };

  public shared func updateEnquiryStatus(id : Nat, status : Text) : async () {
    switch (driveEnquiries.get(id)) {
      case (?e) { driveEnquiries.add(id, { e with status }) };
      case (null) {};
    };
  };

  // ---- Driver Online Status ----

  public shared func setDriverOnlineStatus(
    phone : Text,
    name : Text,
    city : Text,
    driverId : Text,
    status : Text,
    lastUpdated : Text,
  ) : async () {
    let ds : DriverStatus = { phone; name; city; driverId; status; lastUpdated };
    driverStatuses.add(phone, ds);
  };

  public query func getDriverOnlineStatuses() : async [DriverStatus] {
    driverStatuses.values().toArray();
  };

  public query func getOnlineDrivers() : async [DriverStatus] {
    driverStatuses.values().toArray().filter(func(d : DriverStatus) : Bool {
      Text.equal(d.status, "online")
    });
  };

};
