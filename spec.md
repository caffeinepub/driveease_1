# DriveEase

## Current State
Version 35 live. Maps use OpenStreetMap/Leaflet. Fare calculator uses tiered pricing. Admin Live Drivers tab exists but not showing data. Admin portal live button has no distinct green/white style. Driver login panel exists but map route not shown when starting a ride. OTP login sends alerts. API key `si_oUku_5_hjQmk...` used in some places.

## Requested Changes (Diff)

### Add
- Maps API key `12fe02cf73a21d19d48b1de8af073ab6` (LocationIQ format) used for:
  - Geocoding/reverse geocoding in booking, live drivers, driver nav
  - Route display for driver (pickup → drop) on map when ride starts
  - OTP-based login message/alert when booking is confirmed or driver accepts
- Driver login panel: when driver has an active/accepted booking, show full interactive map with route from pickup to drop (using LocationIQ tiles + OSRM routing)
- AI-based billing: calculate fare directly from KM distance, show breakdown instantly (₹/km * distance = total), with a clear amount display

### Modify
- Admin portal "Live Drivers" tab button: change to green background, white font, black label text style
- Admin portal Live Drivers tab: fix data loading so it actually fetches and displays live driver data from backend
- Billing/fare calculation method: replace tiered static pricing with AI-style direct KM calculation (show per-km rate × distance = amount clearly)
- Driver nav/login: show map route prominently when ride is active (pickup marker, drop marker, route polyline)
- OTP login: show alert/notification message when OTP is sent and verified

### Remove
- Nothing removed

## Implementation Plan
1. Create a constants file with the new maps API key `12fe02cf73a21d19d48b1de8af073ab6`
2. Update BookingPage: use LocationIQ for geocoding, update fare calculator to show AI-style direct KM-based amount (rate × km = total, displayed clearly)
3. Update DriverLoginPage: when driver has accepted booking, show Leaflet map with pickup/drop route; show OTP alert notification when booking received
4. Update DriverNavPage: use LocationIQ tiles, show full route map with markers
5. Update LiveDriversPage: fix data fetching to always load from backend, ensure drivers display
6. Update AdminDashboard: Live Drivers tab button → green bg, white/black text; fix Live Drivers data rendering in that tab
7. Update OtpLoginPage: show success alert/message after OTP verification
