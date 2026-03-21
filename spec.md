# DriveEase

## Current State
- Homepage has a full-screen welcome screen overlay (3.5s duration, fades out) with animated car driving, road strip, particle dots, and neon DRIVEEASE logo in Orbitron font
- Homepage has animated racing car strip between sections, floating car widget
- LiveDriversPage and DriverLoginPage do NOT have any car animation or welcome overlay
- Welcome screen only appears once per session (sessionStorage flag)

## Requested Changes (Diff)

### Add
- Car animation strip (same racing cars as homepage) on LiveDriversPage and DriverLoginPage — shown as a header accent or section divider at the top
- 3D animated DriveEase logo on the welcome screen: large DRIVEEASE text using Orbitron font with 3D text-shadow layering, neon green glow, shimmer effect, and scale-in animation
- Welcome screen duration changed from 3.5s to 4.5s (animation fade starts at 3.7s)

### Modify
- Welcome screen: replace or enhance the existing logo/title with a 3D animated version — multiple stacked text-shadows to create depth, green shimmer gradient animation, scale bounce entrance
- LiveDriversPage: add a compact animated car strip (2 cars racing) at the very top of the page content below the navbar
- DriverLoginPage: add a compact animated car strip at the top of the page below the navbar

### Remove
- Nothing removed

## Implementation Plan
1. In HomePage.tsx: update welcome screen timer from 3500ms to 4500ms, update fadeOut animation delay from 3s to 3.7s; enhance the DriveEase logo section with a 3D Orbitron text with stacked shadows, shimmer gradient, and scale-bounce keyframe
2. Extract a reusable `CarAnimationStrip` component (or inline) into a shared file `src/frontend/src/components/CarAnimationStrip.tsx` with the racing cars CSS animation
3. Import and render `CarAnimationStrip` at the top of LiveDriversPage and DriverLoginPage
