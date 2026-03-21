# DriveEase - Admin Panel Fix + Contact Update

## Current State
Admin panel (/admin, password: 126312) has all tabs: bookings, drivers, registrations, customers, enquiries, live-drivers, driver-earnings, pricing, kyc, settings. Backend has custom stable functions: saveBooking, getAllBookings, saveRegistration, getAllRegistrations, saveOtpLogin, getAllOtpLogins, saveEnquiry, getAllEnquiries, setDriverOnlineStatus, getDriverOnlineStatuses, getOnlineDrivers. backendApi.ts wraps these calls. Data loading uses apiGetBookings, apiGetRegistrations, apiGetOtpLogins, apiGetEnquiries, apiGetAllDriverStatuses.

Drivers tab derives `allDriverRows` from `registrations` state. If registrations backend call fails, drivers tab is empty. All tabs show empty if backend sync fails.

## Requested Changes (Diff)

### Add
- Contact info (+91-7836887228, Krishnalivekeeping01@gmail.com) in Footer and any ContactPage
- Visible error state in admin when sync fails (show reason)
- Auto-load on admin login (call loadAll immediately on auth)
- "Retry" button if sync fails with error message

### Modify
- backendApi.ts: improve error handling, log actual errors to console, ensure all 5 API calls work
- AdminDashboard: fix loadAll to auto-trigger on mount after auth, show loading spinner until data arrives, show error message if backend fails
- AdminDashboard: fix Drivers tab - also include any locally-cached driver data if backend returns empty
- AdminDashboard: fix Live Drivers tab - show all drivers from backend, display online/offline badge, Book Now button
- AdminDashboard: fix KYC tab - list registrations with document view
- Footer.tsx: update contact section with phone +91-7836887228 and email Krishnalivekeeping01@gmail.com
- All API calls in admin must properly await actor methods; if actor method doesn't exist, fallback gracefully

### Remove
- Nothing

## Implementation Plan
1. Update Footer.tsx with correct contact phone and email
2. Update backendApi.ts to log errors clearly and improve fallback
3. Update AdminDashboard: auto-sync on login, show loading/error state clearly, fix Drivers tab data source, fix Live Drivers data display
4. Ensure KYC tab shows registration list with document viewing
5. Ensure registrations tab shows payment screenshot and details
