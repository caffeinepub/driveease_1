# DriveEase - Version 40: Full API Integration + Sync Fix

## Current State
DriveEase is a full-stack driver booking PWA with Motoko backend and React frontend. It has: OTP customer login, driver registration/approval, live driver tracking, admin dashboard, fare calculator, LocationIQ maps, and booking/OTP flow. Admin panel has sync issues (not reflecting live driver details), and Live Drivers button shows stale data. No integrated Auth API, no AI chatbot, no blob storage for uploads, no Stripe payments, no SMS/email alert API.

## Requested Changes (Diff)

### Add
- **Auth API** (authorization component): Role-based access for customers, drivers, and admin
- **Storage API** (blob-storage component): Driver document uploads (Aadhar, DL, Selfie, payment screenshot), profile photos stored server-side so visible across all devices
- **Payment API** (stripe component): Customer payment on ride completion; driver earnings updates; admin payout controls
- **HTTP Outcalls** (http-outcalls component): SMS/WhatsApp alerts (via LocationIQ/messaging API), AI chatbot responses using HTTP outcalls to an AI provider
- **AI Chatbot**: Floating chatbot button on every page; answers DriveEase questions using HTTP outcall to an AI API; powered by http-outcalls component
- **SMS/Alert API**: OTP delivery via SMS for customer login; booking notifications to driver; alert type configurable (SMS/WhatsApp/Push) from admin settings
- **Maps API**: LocationIQ key `12fe02cf73a21d19d48b1de8af073ab6` used everywhere – booking form, tracking, driver nav, admin live map; consistent geocoding and routing
- **Admin Panel - Full Sync**: All tabs (Bookings, Drivers, Registrations, Customers, Enquiries, Live Drivers) pull data directly from backend canister with auto-sync; no localStorage fallback for critical data; sync status indicator always accurate
- **Live Drivers Sync Fix**: Live Drivers page pulls approved drivers directly from backend; online/offline status refreshes every 15 seconds; BOOK NOW button works
- **Admin API Management Panel**: New "API Integrations" section in Settings tab showing status of all 6 APIs (Auth, Maps, Payments, Storage, SMS/Alerts, AI); each with key field, status badge, and test button

### Modify
- Driver registration: uploads (Aadhar, DL, Selfie, payment screenshot) stored via blob-storage so admin can view from any device
- Customer login: OTP can be delivered via SMS using http-outcalls (configurable)
- Booking flow: payment step uses Stripe integration for card payments
- Admin Settings tab: expanded to show all API keys and statuses
- Live Drivers page: fix data fetching to always use backend canister, never localStorage
- Admin Drivers/Registrations tabs: real-time sync from backend, not local state

### Remove
- localStorage-only driver data fallback for Live Drivers page
- Stale data patterns that caused admin panel desync

## Implementation Plan
1. Select components: authorization, blob-storage, stripe, http-outcalls
2. Generate updated Motoko backend with new stable data structures supporting auth roles, blob references, payment records
3. Frontend updates:
   a. ChatbotWidget component (floating button, slide-up panel, AI HTTP outcall)
   b. AdminDashboard: fix all sync logic to use only backend canister; add API Integrations tab; live drivers sync fix
   c. LiveDriversPage: fix to always fetch from backend
   d. DriverRegistrationPage: use blob-storage for document uploads
   e. BookingPage/PaymentPage: Stripe payment integration
   f. OtpLoginPage: SMS OTP via http-outcalls when API key configured
   g. Admin Settings: show all 6 API integration statuses with keys
