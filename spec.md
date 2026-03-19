# DriveEase - Version 28

## Current State
DriveEase is a full-stack PWA for booking personal drivers across India. It has: OTP customer login, driver registration/approval flow, admin dashboard with CRM features, live drivers page, booking with map, ride tracking, subscription plans, and a white/green themed homepage with professional hero image. Data syncs via ICP backend canister with stable storage.

## Requested Changes (Diff)

### Add
- **IST Date/Time utility**: A shared `formatIST(ts)` function that converts any timestamp/date to `DD-MM-YYYY hh:mm:ss AM/PM IST` format (Asia/Kolkata, UTC+5:30). Falls back to current IST time if no timestamp given.
- **All India States/Cities/Pincodes data file**: A comprehensive `indiaData.ts` file with all 28 states + 8 UTs, their cities, and pincode prefixes. Used in dropdowns with searchable/filterable state dropdown and city dropdown.
- **State + City dropdown with search**: On booking page, live drivers filter, and registration form — replace plain text city fields with a searchable state dropdown (type to filter) that then populates city options for that state.
- **Driver online session timer**: On the driver login page, show a live timer of how long the driver has been online in the current session (HH:MM:SS format, ticking every second from login time). Store `driverOnlineAt` in localStorage.
- **Admin commission column**: In the admin Driver Earnings tab, add a visible "Commission" column showing platform commission amount per driver. Only visible in admin portal.
- **Homepage 3D bold hero buttons**: Replace current hero buttons with massive 3D-styled bold text buttons: "Driver Login" and "Book a Driver" — with CSS 3D text-shadow/transform effects, deep green and dark glow styling, very impactful and cool-looking. The entire homepage hero section gets a premium visual upgrade.
- **AI route map option**: On the booking confirmation page and driver nav page, add an "AI Route View" button that opens a Leaflet map showing the pickup → drop route with a dashed line path and markers. Label it "AI Route Map" prominently.
- **Location auto-fetch**: On booking page (pickup address field) and live drivers page (city filter), add a "Use My Location" button that calls `navigator.geolocation.getCurrentPosition` and reverse-geocodes via LocationIQ (or fallback to Nominatim free API: `https://nominatim.openstreetmap.org/reverse`) to auto-fill pickup address and detect city.
- **Plan enquiry submit fix**: Fix the Services dropdown plan buttons — clicking any plan should open a slide-up enquiry modal with pre-filled plan name, customer name/phone if logged in, a message field, and a Submit button that saves to backend enquiries (visible in admin Enquiries tab).

### Modify
- **All booking date/time displays**: Everywhere a booking timestamp, login time, or booking request time is shown (AdminDashboard bookings table, DriverLoginPage request cards, MyBookingsPage booking history, LiveDriversPage booking info) — apply `formatIST()` consistently. Format: `19-03-2026 05:42:42 PM IST`.
- **Driver login timestamp**: When driver goes online, record `driverOnlineAt: new Date().toISOString()` in localStorage. Display login time in IST format in the driver panel.
- **Admin bookings table**: Add formatted IST time column. Replace any raw date strings.
- **Booking receipt/invoice**: Show booking time in IST format.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/utils/istFormat.ts` with `formatIST(input?)` function.
2. Create `src/frontend/src/utils/indiaData.ts` with all states, cities, pincode prefixes.
3. Create `src/frontend/src/components/StatesCitiesSelect.tsx` — searchable state dropdown + city dropdown component.
4. Update `HomePage.tsx` — add 3D bold CSS-styled "Driver Login" and "Book a Driver" hero buttons with CSS text-shadow 3D effect. Make the hero section look premium and bold.
5. Update `BookingPage.tsx` — add location auto-fetch button for pickup, add StatesCitiesSelect for location fields, apply formatIST to booking timestamps, add AI Route Map panel post-booking.
6. Update `DriverLoginPage.tsx` — record `driverOnlineAt` on going online, show live session timer, apply formatIST to booking request times.
7. Update `AdminDashboard.tsx` — apply formatIST to all date columns, add Commission column to Driver Earnings tab.
8. Update `MyBookingsPage.tsx` — apply formatIST to booking date/time fields.
9. Update `LiveDriversPage.tsx` — add location auto-fetch for city filter.
10. Update `SubscriptionsPage.tsx` — fix plan Select buttons to open enquiry modal, save to backend.
11. Update `Navbar.tsx` — ensure Services dropdown plan links open enquiry modal (can use URL hash param to trigger modal on plans page).
