# DriveEase

## Current State
All data (bookings, registrations, OTP logins, enquiries, driver online status) is stored in browser localStorage. This means data is per-device only — customers booking on their phones is invisible to the admin on a different device. Live drivers page only reads localStorage so newly approved drivers don't appear cross-device.

## Requested Changes (Diff)

### Add
- Backend canister functions with NO auth requirement (public) for: saveBooking, saveRegistration, saveOtpLogin, saveEnquiry, setDriverOnlineStatus, getDriverOnlineStatuses
- Backend admin functions (password: "126312" checked client-side) for: getAllBookings, getAllRegistrations, getAllOtpLogins, getAllEnquiries, updateBookingStatus, updateRegistrationStatus, updateEnquiryStatus
- Total driver count = seed drivers + approved registrations from backend

### Modify
- BookingPage: save bookings to backend canister (in addition to localStorage fallback)
- DriverRegistrationPage: save registrations to backend canister
- OtpLoginPage: save OTP login records to backend canister
- SubscriptionsPage: save enquiries to backend canister
- AdminDashboard: read all 5 tabs (Bookings, Registrations, Customers, Enquiries, Live Drivers) from backend canister, still auto-refresh every 10s
- LiveDriversPage: read driver online status from backend canister, approved registrations from backend, refresh every 10s
- DriverLoginPage: persist online/offline status to backend canister so it's visible cross-device

### Remove
- localStorage-only reads in AdminDashboard for bookings/registrations/customers/enquiries

## Implementation Plan
1. Generate Motoko backend with simple public store functions for all 5 data types + driver online status
2. Update frontend utils to write to backend canister (with localStorage fallback for offline)
3. Update AdminDashboard to read from backend API for all tabs with 10s polling
4. Update LiveDriversPage to read online statuses from backend
5. Update DriverLoginPage to push status to backend on toggle
