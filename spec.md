# DriveEase Version 11

## Current State
DriveEase is a full-stack personal driver booking platform with:
- Homepage with hero, trust indicators, business model, brand ambassador
- Driver registration, login portal (Ola-style), driver nav page
- Customer OTP login, booking page with map, tracking page
- Live drivers page (currently broken - not showing registered/approved+online drivers)
- Admin dashboard with tabs: Bookings, Drivers, Registrations, Customers, Enquiries, Settings, Live Drivers
- Services navbar dropdown (currently not navigating correctly)
- MyBookings page
- PWA support

## Requested Changes (Diff)

### Add
- **Live Drivers Fix**: Read from `driveease_registrations` (approved) AND `driveease_drivers` (seed data) in localStorage. Show drivers whose `isOnline=true` or `status='online'`. "Krishna Kant Pandey" registered with phone 7836887228 must appear when online.
- **Customer Booking History**: Store each booking in `driveease_customer_bookings_<phone>` key. MyBookings page shows past bookings with date, driver, route, status, fare.
- **Admin Driver Online Timer**: In admin Live Drivers tab, show real-time counter of how long each driver has been online. When driver goes offline, save timestamp. Show "Last online: X" history. Store `driveease_driver_activity_<id>` with sessions array.
- **Customer Feedback after ride**: After ride completes (status=completed), show feedback modal with star rating (1-5) and comment text. Save to `driveease_feedback` array. Admin can see driver performance (avg rating, all reviews).
- **Admin: Driver details with documents**: In Registrations/Drivers tab, clicking a driver shows modal with: documents (Aadhar, PAN, DL, Selfie), working details (city, experience, rate), approval status. Filter by name, city, status.
- **Admin: Excel export**: Add "Download Excel" button on Bookings tab and Drivers tab. Uses SheetJS (xlsx) CDN or manual CSV generation to download data as .csv file.
- **Admin: Filter bookings by customer name/phone**
- **Admin link for drivers**: When driver is online, show timer in driver login page showing how long they've been online today.
- **LocationIQ map in Booking panel**: Full interactive Leaflet map centered on India with LocationIQ geocoding. Custom markers for pickup/drop. City name dropdown with all Indian states and cities.
- **Google Maps navigator option**: In booking confirmation and tracking, "Navigate with Google Maps" button.

### Modify
- **Navbar Services dropdown**: Fix routing so Plans links to `/subscriptions`, Insurance to `/insurance`, Pay to `/payment`, My Bookings to `/my-bookings`. Ensure dropdown actually opens and links work.
- **LiveDriversPage**: Fix data source - merge seed drivers + registered+approved drivers. Check online status from `driveease_driver_status` localStorage key.
- **AdminDashboard**: Add name filter to Drivers tab, customer/phone filter to Bookings tab. Add driver documents viewer modal. Add Excel/CSV download. Add driver online time tracker with history.
- **HomePage**: Remove "Drive with Us" / driver recruitment section/panel.
- **MyBookingsPage**: Show full booking history for logged-in customer, pulled from localStorage.

### Remove
- "Drive with Us" recruitment/CTA panel/section from HomePage

## Implementation Plan
1. Fix LiveDriversPage to read both seed drivers and registered drivers from localStorage, show online ones
2. Fix Navbar Services dropdown links to work properly
3. Update MyBookingsPage to show customer booking history from localStorage
4. Update AdminDashboard: add name filter, booking filter, Excel/CSV download, driver documents modal, online timer with history
5. Add customer feedback modal in TrackingPage/MyBookingsPage for completed rides
6. Remove Drive with Us section from HomePage
7. Add LocationIQ map with all India cities to BookingPage
8. Add driver online timer display in DriverLoginPage
