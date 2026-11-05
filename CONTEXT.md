# Slappy — Project Context & Architecture

Slappy is a local-only mobile/web app that maps physical device movement or
a manual tap to a sound effect and a locally stored slap total.

## Interface

- Dark background with red and neutral accents.
- A sensor and sound readiness indicator appears at the top.
- The main area contains the slap counter and `SlapZone` manual tap target,
  with floating emoji artwork behind the controls.

## Slap counter and sound

- On startup, `usePlayer.ts` loads the slap total from device `localStorage`.
- `useSlap.ts` listens to the accelerometer through Capacitor Motion, calibrates
  against movement noise, and applies a cooldown between triggers.
- Tapping `SlapZone` manually triggers the same slap flow.
- Each slap increments the locally stored counter, activates the visual pulse,
  and plays a non-repeating sound selected from the bundled sound pool.

## Platform

- The Android app wraps the static Next.js export with Capacitor.
- Browser interaction is available as a development and manual-input fallback.
- Motion detection requires an available accelerometer; the manual button
  remains available if motion input cannot be used.
