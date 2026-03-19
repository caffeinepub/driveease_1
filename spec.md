# DriveEase — Version 27

## Current State
- BookingPage exists with map picker (Leaflet/LocationIQ), supports hourly/daily/outstation booking types, shows booking confirmation with receipt
- MyBookingsPage shows booking history for logged-in customers
- LiveDriversPage shows online drivers with city filter, links to /book/:driverId
- Navbar has Services dropdown with Plans, Insurance, Pay, My History; Driver Nav is NOT in Services dropdown
- SubscriptionsPage has plan cards but the Subscribe/Select buttons may not properly link/scroll to inquiry form
- No dedicated CustomerProfilePage exists
- Admin dashboard has Enquiries tab reading from backend
- City-based driver matching: BookingPage fetches live registrations but does not strictly filter by matching city between customer and driver

## Requested Changes (Diff)

### Add
- CustomerProfilePage (`/profile`) — shows customer name, phone, city, total bookings count, and links to booking history
- "Driver Nav" link under Services dropdown in Navbar (desktop + mobile)
- "My Profile" link under Services dropdown in Navbar for logged-in customers
- CustomerInquiryPage or inline inquiry form accessible from navbar/services that saves to backend enquiries (admin can see)
- Route `/profile` in App.tsx
- City-based driver filtering in BookingPage and LiveDriversPage: when a logged-in customer has a city set (from OTP login or profile), auto-filter drivers to show only drivers whose city matches the customer's city; still allow customer to change city filter manually

### Modify
- BookingPage: ensure map picker works for pickup AND drop location; after successful booking, prominently show assigned driver details (name, phone masked, vehicle, city) + receipt with booking ID; store booking with driverId and driverName fields
- MyBookingsPage: ensure it shows full booking details including driver name/vehicle/city and receipt download
- SubscriptionsPage: fix all Subscribe/Select Plan buttons — they should either scroll to an inquiry form on the page or navigate to `/login` if not logged in, then to a plan inquiry submission form; add a working inquiry form at the bottom of the plans page that saves to backend enquiries with plan name
- Navbar Services dropdown: add "Driver Nav" link (`/driver-nav`) and "My Profile" link (`/profile`, only for logged-in customers) under Services
- LiveDriversPage: when customer is logged in with a city, auto-set city filter to customer's city; show city match badge on driver cards

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/pages/CustomerProfilePage.tsx` — shows name, phone, city (editable and saved to localStorage), booking count, links to My Bookings
2. Update `Navbar.tsx` — add "Driver Nav" to servicesLinks array; add "My Profile" for logged-in customers in Services dropdown
3. Update `App.tsx` — add `/profile` route pointing to CustomerProfilePage
4. Update `BookingPage.tsx` — after booking success, fetch and display the booked driver's details (name, masked phone, vehicle type, city, experience); ensure city-based auto-filter when customer city is available
5. Update `LiveDriversPage.tsx` — auto-populate city filter from customer's stored city; show "Matches your city" badge
6. Update `SubscriptionsPage.tsx` — fix Subscribe buttons to scroll to inquiry form; add working plan inquiry form at bottom that POSTs to backend and shows success
7. Ensure all pages work responsively on mobile and desktop
