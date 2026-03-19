# DriveEase - Dashboard Fix & Admin Earnings Panel

## Current State
- Admin dashboard exists at /admin with tabs: Bookings, Drivers, Registrations, Customers, Enquiries, Settings, Live Drivers
- Navbar has Services dropdown with: Plans, Insurance, Pay, My Bookings
- Live Drivers page shows driver count inline but no prominent counter for Find Drivers column
- No Driver Earnings panel in admin
- Bell icon links to My Bookings

## Requested Changes (Diff)

### Add
- New "Driver Earnings" tab in AdminDashboard: shows each driver, total bookings received, total earnings (sum of booking amounts), commission taken (18%), net payout per driver
- Live driver count badge/stat on the Live Drivers page header and on the DriversPage (Find Driver section)
- Total driver count shown prominently on Find Drivers page

### Modify
- Remove "My Bookings" from navbar Services dropdown and from mobile menu
- Remove bell icon link to /my-bookings from navbar (or keep bell but don't show My Bookings in Services)
- Fix Pay, Plans, Insurance links in Services dropdown to ensure they route to /payment, /subscriptions, /insurance correctly
- Admin dashboard: ensure all tabs auto-refresh every 10s from backend + localStorage fallback, and all data is linked properly
- Live Drivers page: show total driver count prominently ("X drivers available")

### Remove
- "My Bookings" from Services dropdown in Navbar
- "My Bookings" from mobile menu Services section

## Implementation Plan
1. Navbar.tsx: Remove My Bookings from servicesLinks array (both desktop and mobile)
2. AdminDashboard.tsx: Add "driver-earnings" to Tab type, add nav item "Driver Earnings", render earnings panel that groups bookings by driverName, sums amounts, shows commission (18%), net payout
3. LiveDriversPage.tsx: Already shows count - verify count display is prominent
4. DriversPage.tsx: Add a stat showing total drivers listed
5. Validate and build
