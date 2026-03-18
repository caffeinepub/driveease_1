# DriveEase - PWA Upgrade

## Current State
Full-featured web app with homepage, booking, drivers, admin dashboard, tracking, payment, OTP login, driver navigation.

## Requested Changes (Diff)

### Add
- PWA manifest.json with app name, icons, theme color, standalone display mode
- Service worker for offline caching and installability
- PWA meta tags in index.html (apple-mobile-web-app, theme-color, etc.)
- Mobile bottom navigation bar for key pages (Home, Drivers, My Bookings, Login)
- App install banner/prompt on mobile
- Splash screen support
- App icons (192x192, 512x512)

### Modify
- index.html: Add PWA meta tags, manifest link, theme color, apple touch icon
- App.tsx: Add bottom nav bar for mobile, PWA install prompt

### Remove
- Nothing

## Implementation Plan
1. Generate app icons
2. Create manifest.json
3. Create service worker (sw.js)
4. Update index.html with all PWA meta tags
5. Add BottomNav component for mobile
6. Wire install prompt in App.tsx
