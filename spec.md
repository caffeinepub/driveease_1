# DriveEase Version 50

## Current State
DriveEase is a full PWA driver booking app. Current theme uses orange accents (from Version 49 Ola/Rapido style). Homepage has bubble-style buttons, sparkle particles, and driver photo in a glowing bubble. Animation welcome splash exists. Driver login page exists. All pages have car sidebar and animations.

## Requested Changes (Diff)

### Add
- HD animated DriveEase logo image (`/assets/generated/driveease-logo-hd.dim_600x200.png`) displayed prominently on every page header/navbar area
- Driver + car photo (`/assets/generated/driveease-driver-car.dim_800x600.png`) on homepage hero
- Premium car photo (`/assets/generated/driveease-car-premium.dim_800x500.png`) on homepage as secondary visual
- Sparkle/particle animation background on ALL pages (booking, plan/subscriptions, live drivers, driver login/captain login, OTP login, available drivers)
- Animation logo on every page — animated DriveEase logo with shimmer/glow that appears in navbar or page header
- "Captain Login" branding for the driver login page (rename Driver Login to Captain Login everywhere in UI text)

### Modify
- **Theme**: Remove all orange colors. Replace with deep emerald green (#059669, #10b981, #34d399) accent scheme throughout ALL pages
- **Bubble buttons**: Remove bubble-style pulsing CTA buttons from homepage; replace with clean modern green gradient buttons
- **Homepage hero**: Show driver+car photo and premium car photo side by side or stacked; keep sparkle background
- **Welcome splash**: Update to green theme with HD logo
- **Driver Login page**: Rename all "Driver Login" text to "Captain Login"; give it a premium dark green captain-themed design
- **Every page**: Consistent green theme — no orange anywhere
- **Color theme**: Mix each page with slightly different green shade/tint variation (booking=light green tint, live drivers=dark green, plan=mint green, captain login=deep green)

### Remove
- All orange color references (#f97316, orange-*, etc.)
- Bubble pulsing CSS animation on CTA buttons

## Implementation Plan
1. Update index.css / global styles to remove orange, establish green color tokens
2. Update Navbar to show animated HD DriveEase logo image
3. Update WelcomeSplash in App.tsx to green theme
4. Update HomePage: driver+car photos, remove bubble buttons, add sparkle background
5. Update DriverLoginPage: rename to Captain Login, deep green premium theme, sparkle background
6. Update LiveDriversPage: add sparkle background, ensure green theme
7. Update SubscriptionsPage (Plans): add sparkle background, green theme
8. Update BookingPage: add sparkle, green theme
9. Update OtpLoginPage: sparkle, green theme
10. Update AvailableDriversPage: sparkle, green theme
11. Create shared SparkleBackground component for reuse across pages
12. Create AnimatedLogo component showing HD logo with shimmer animation
