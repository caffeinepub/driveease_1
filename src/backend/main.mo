import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";



actor {
  // Mixins
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserProfile = {
    name : Text;
    phone : Text;
    email : Text;
  };

  public type OtpLoginRecord = {
    phone : Text;
    name : Text;
    timestamp : Int;
  };

  public type DriverProfile = {
    id : Nat;
    name : Text;
    city : Text;
    state : Text;
    experienceYears : Nat;
    languages : [Text];
    rating : Nat; // 1-5
    pricePerDay : Nat; // In rupees
    isAvailable : Bool;
    isVerified : Bool;
    trustBadges : [Text];
    phone : Text;
    photoUrl : Text;
  };

  public type BookingStatus = {
    #pending;
    #confirmed;
    #cancelled;
  };

  public type Booking = {
    id : Nat;
    driverId : Nat;
    customerPrincipal : Principal;
    customerName : Text;
    customerPhone : Text;
    customerEmail : Text;
    pickupAddress : Text;
    dropAddress : Text;
    startDate : Int; // Timestamp
    endDate : Int; // Timestamp
    daysCount : Nat;
    totalPrice : Nat;
    status : BookingStatus;
    sosFlag : Bool;
    insuranceOpted : Bool;
    createdTimestamp : Int;
    feedbackMessage : ?Text;
  };

  public type RegistrationStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type DriverRegistrationRequest = {
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
    verificationStatus : RegistrationStatus;
    submissionTimestamp : Int;
  };

  public type SavedAddress = {
    customerId : Principal;
    addressLabel : Text;
    address : Text;
  };

  public type SubscriptionEnquiry = {
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

  module Booking {
    public func compareByCreatedTimestamp(a : Booking, b : Booking) : Order.Order {
      Int.compare(a.createdTimestamp, b.createdTimestamp);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let drivers = Map.empty<Nat, DriverProfile>();
  let bookings = Map.empty<Nat, Booking>();
  let registrationRequests = Map.empty<Nat, DriverRegistrationRequest>();
  let savedAddresses = Map.empty<Principal, List.List<SavedAddress>>();
  let subscriptionEnquiries = Map.empty<Nat, SubscriptionEnquiry>();
  let otpLoginRecords = Map.empty<Nat, OtpLoginRecord>();

  var nextBookingId = 1;
  var nextRegistrationId = 1;
  var nextEnquiryId = 1;
  var nextOtpLoginRecordId = 1;

  private func seedDrivers() {
    let driverData = [
      (
        1,
        "Rajesh Kumar",
        "Mumbai",
        "Maharashtra",
        8,
        ["Hindi", "Marathi"],
        6_00_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver1.png"
      ),
      (
        2,
        "Anil Sharma",
        "Delhi",
        "Delhi",
        5,
        ["Hindi", "English"],
        5_50_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver2.png"
      ),
      (
        3,
        "Vijay Singh",
        "Bangalore",
        "Karnataka",
        7,
        ["Hindi", "Kannada", "English"],
        7_00_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver3.png"
      ),
      (
        4,
        "Karthik Reddy",
        "Hyderabad",
        "Telangana",
        6,
        ["Telugu", "Hindi", "English"],
        5_80_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver4.png"
      ),
      (
        5,
        "Suresh Patil",
        "Pune",
        "Maharashtra",
        9,
        ["Marathi", "Hindi"],
        6_20_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver5.png"
      ),
      (
        6,
        "Arjun Gupta",
        "Mumbai",
        "Maharashtra",
        10,
        ["Hindi", "English", "Marathi"],
        6_50_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver6.png"
      ),
      (
        7,
        "Rahul Verma",
        "Delhi",
        "Delhi",
        7,
        ["Hindi", "English"],
        5_70_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver7.png"
      ),
      (
        8,
        "Manoj Desai",
        "Bangalore",
        "Karnataka",
        8,
        ["Kannada", "Hindi", "English"],
        7_20_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver8.png"
      ),
      (
        9,
        "Praveen Kumar",
        "Chennai",
        "Tamil Nadu",
        6,
        ["Tamil", "Hindi", "English"],
        6_80_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver9.png"
      ),
      (
        10,
        "Harish Nair",
        "Kochi",
        "Kerala",
        8,
        ["Malayalam", "Hindi", "English"],
        5_60_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver10.png"
      ),
      (
        11,
        "Mayank Shah",
        "Ahmedabad",
        "Gujarat",
        9,
        ["Gujarati", "Hindi", "English"],
        6_00_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver11.png"
      ),
      (
        12,
        "Aniket Joshi",
        "Pune",
        "Maharashtra",
        7,
        ["Hindi", "Marathi", "English"],
        6_30_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver12.png"
      ),
      (
        13,
        "Tarun Sharma",
        "Gurgaon",
        "Haryana",
        5,
        ["Hindi", "English"],
        5_50_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver13.png"
      ),
      (
        14,
        "Santosh Singh",
        "Lucknow",
        "Uttar Pradesh",
        8,
        ["Hindi", "English"],
        6_10_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver14.png"
      ),
      (
        15,
        "Vishal Rao",
        "Bangalore",
        "Karnataka",
        6,
        ["Kannada", "Hindi", "English"],
        7_40_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver15.png"
      ),
      (
        16,
        "Raj Kiran",
        "Delhi",
        "Delhi",
        7,
        ["Hindi", "English"],
        5_90_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver16.png"
      ),
      (
        17,
        "Sudhir Mishra",
        "Mumbai",
        "Maharashtra",
        10,
        ["Hindi", "Marathi", "English"],
        6_70_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver17.png"
      ),
      (
        18,
        "Ankit Patel",
        "Ahmedabad",
        "Gujarat",
        9,
        ["Gujarati", "Hindi", "English"],
        6_20_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver18.png"
      ),
      (
        19,
        "Rohit Joshi",
        "Pune",
        "Maharashtra",
        8,
        ["Marathi", "Hindi", "English"],
        6_40_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver19.png"
      ),
      (
        20,
        "Sunil Kumar",
        "Hyderabad",
        "Telangana",
        7,
        ["Telugu", "Hindi", "English"],
        6_00_000,
        "https://driveease_images.s3.ap-south-1.amazonaws.com/driver20.png"
      ),
    ];

    for ((id, name, city, state, experienceYears, languages, pricePerDay, photoUrl) in driverData.values()) {
      let driver : DriverProfile = {
        id;
        name;
        city;
        state;
        experienceYears;
        languages;
        rating = 5; // Default rating
        pricePerDay;
        isAvailable = true;
        isVerified = true; // All seeded drivers are verified
        trustBadges = ["Safety First", "Experienced", "Punctual"];
        phone = "9999999999";
        photoUrl;
      };
      drivers.add(id, driver);
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func initializeApp() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize the app");
    };
    seedDrivers();
  };

  // OTP Login Record Functionality
  public shared ({ caller }) func recordOtpLogin(phone : Text, name : Text) : async () {
    let record : OtpLoginRecord = {
      phone;
      name;
      timestamp = Time.now();
    };
    otpLoginRecords.add(nextOtpLoginRecordId, record);
    nextOtpLoginRecordId += 1;
  };

  public query ({ caller }) func getOtpLoginRecords() : async [OtpLoginRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view OTP records");
    };
    otpLoginRecords.values().toArray();
  };

  // Public read-only functions (no auth required)
  public query ({ caller }) func listAvailableDrivers() : async [DriverProfile] {
    drivers.values().toArray();
  };

  public query ({ caller }) func filterDriversByCity(city : Text) : async [DriverProfile] {
    drivers.values().toArray().filter(func(d) { Text.equal(d.city, city) });
  };

  public query ({ caller }) func getDriverById(driverId : Nat) : async ?DriverProfile {
    drivers.get(driverId);
  };

  // User functions (require authentication)
  public shared ({ caller }) func createBooking(
    driverId : Nat,
    customerName : Text,
    customerPhone : Text,
    customerEmail : Text,
    pickupAddress : Text,
    dropAddress : Text,
    startDate : Int,
    endDate : Int,
    daysCount : Nat,
    totalPrice : Nat,
    insuranceOpted : Bool,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bookings");
    };

    let booking : Booking = {
      id = nextBookingId;
      driverId;
      customerPrincipal = caller;
      customerName;
      customerPhone;
      customerEmail;
      pickupAddress;
      dropAddress;
      startDate;
      endDate;
      daysCount;
      totalPrice;
      status = #pending;
      sosFlag = false;
      insuranceOpted;
      createdTimestamp = Time.now();
      feedbackMessage = null;
    };
    bookings.add(nextBookingId, booking);
    nextBookingId += 1;
    booking.id;
  };

  public shared ({ caller }) func registerDriver(
    name : Text,
    phone : Text,
    email : Text,
    city : Text,
    state : Text,
    aadharDoc : Storage.ExternalBlob,
    panDoc : Storage.ExternalBlob,
    licenseDoc : Storage.ExternalBlob,
    selfieDoc : Storage.ExternalBlob,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register as drivers");
    };

    let registration : DriverRegistrationRequest = {
      id = nextRegistrationId;
      requesterPrincipal = caller;
      name;
      phone;
      email;
      city;
      state;
      aadharDoc;
      panDoc;
      licenseDoc;
      selfieDoc;
      paymentStatus = false;
      verificationStatus = #pending;
      submissionTimestamp = Time.now();
    };
    registrationRequests.add(nextRegistrationId, registration);
    nextRegistrationId += 1;
    registration.id;
  };

  public shared ({ caller }) func saveAddress(addressLabel : Text, address : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save addresses");
    };

    let newAddress : SavedAddress = {
      customerId = caller;
      addressLabel;
      address;
    };

    let existingAddresses = switch (savedAddresses.get(caller)) {
      case (null) { List.empty<SavedAddress>() };
      case (?addresses) { addresses };
    };

    existingAddresses.add(newAddress);
    savedAddresses.add(caller, existingAddresses);
  };

  public query ({ caller }) func getSavedAddresses() : async [SavedAddress] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view saved addresses");
    };

    switch (savedAddresses.get(caller)) {
      case (?addresses) { addresses.toArray() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func submitSubscriptionEnquiry(
    name : Text,
    phone : Text,
    email : Text,
    planType : Text,
    familyMembersCount : Nat,
    city : Text,
    message : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit subscription enquiries");
    };

    let enquiry : SubscriptionEnquiry = {
      id = nextEnquiryId;
      requesterPrincipal = caller;
      name;
      phone;
      email;
      planType;
      familyMembersCount;
      city;
      message;
      timestamp = Time.now();
    };
    subscriptionEnquiries.add(nextEnquiryId, enquiry);
    nextEnquiryId += 1;
    enquiry.id;
  };

  public shared ({ caller }) func markSosForBooking(bookingId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark SOS");
    };

    switch (bookings.get(bookingId)) {
      case (?booking) {
        // Verify the booking belongs to the caller or caller is admin
        if (booking.customerPrincipal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only mark SOS for your own bookings");
        };

        let updatedBooking = { booking with sosFlag = true };
        bookings.add(bookingId, updatedBooking);
      };
      case (null) {
        Runtime.trap("Booking not found");
      };
    };
  };

  public query ({ caller }) func getBookingsByCustomer() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };

    let allBookings = bookings.values().toArray();
    allBookings.filter(func(b) { Principal.equal(b.customerPrincipal, caller) });
  };

  // Admin functions
  public query ({ caller }) func getAllBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    bookings.values().toArray().sort(Booking.compareByCreatedTimestamp);
  };

  public shared ({ caller }) func confirmBooking(bookingId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can confirm bookings");
    };
    switch (bookings.get(bookingId)) {
      case (?booking) {
        let updatedBooking = { booking with status = #confirmed };
        bookings.add(bookingId, updatedBooking);
      };
      case (null) {
        Runtime.trap("Booking not found");
      };
    };
  };

  public shared ({ caller }) func cancelBooking(bookingId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can cancel bookings");
    };
    switch (bookings.get(bookingId)) {
      case (?booking) {
        let updatedBooking = { booking with status = #cancelled };
        bookings.add(bookingId, updatedBooking);
      };
      case (null) {
        Runtime.trap("Booking not found");
      };
    };
  };

  public query ({ caller }) func getAllDrivers() : async [DriverProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all drivers");
    };
    drivers.values().toArray();
  };

  public shared ({ caller }) func removeDriver(driverId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove drivers");
    };
    switch (drivers.get(driverId)) {
      case (?_) {
        drivers.remove(driverId);
      };
      case (null) {
        Runtime.trap("Driver not found");
      };
    };
  };

  public shared ({ caller }) func updateDriverRate(driverId : Nat, newPricePerDay : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update driver rates");
    };

    switch (drivers.get(driverId)) {
      case (?driver) {
        let updatedDriver = { driver with pricePerDay = newPricePerDay };
        drivers.add(driverId, updatedDriver);
      };
      case (null) {
        Runtime.trap("Driver not found");
      };
    };
  };

  public shared ({ caller }) func approveDriverRegistration(registrationId : Nat, isApproved : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve registrations");
    };
    switch (registrationRequests.get(registrationId)) {
      case (?request) {
        let updatedRequest = {
          request with
          verificationStatus = if (isApproved) { #approved } else { #rejected }
        };
        registrationRequests.add(registrationId, updatedRequest);

        if (isApproved) {
          let newDriver : DriverProfile = {
            id = registrationId;
            name = request.name;
            city = request.city;
            state = request.state;
            experienceYears = 0;
            languages = ["Hindi"];
            rating = 5;
            pricePerDay = 0;
            isAvailable = true;
            isVerified = true;
            trustBadges = [];
            phone = request.phone;
            photoUrl = "";
          };
          drivers.add(registrationId, newDriver);
        };
      };
      case (null) {
        Runtime.trap("Registration request not found");
      };
    };
  };

  public query ({ caller }) func getAllRegistrations() : async [DriverRegistrationRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all registrations");
    };
    registrationRequests.values().toArray();
  };

  public query ({ caller }) func getAllEnquiries() : async [SubscriptionEnquiry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all enquiries");
    };
    subscriptionEnquiries.values().toArray();
  };

  public shared ({ caller }) func sendFeedbackMessage(bookingId : Nat, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can send feedback messages");
    };
    switch (bookings.get(bookingId)) {
      case (?booking) {
        let updatedBooking = { booking with feedbackMessage = ?message };
        bookings.add(bookingId, updatedBooking);
      };
      case (null) {
        Runtime.trap("Booking not found");
      };
    };
  };
};
