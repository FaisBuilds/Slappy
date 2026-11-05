# Slappy Project Scope

## Purpose

Slappy is a lightweight, playful mobile app that turns a device movement or
an on-screen tap into a slap sound and a counter increment. Its main target is
Android, with a web-based interface that can also run in a browser.

## In scope

- A single-screen interface with a slap counter, a manual **SLAP** control, and
  sensor and sound readiness indicators.
- Detecting sudden device movement through the Capacitor Motion accelerometer
  API, with calibration and a short cooldown to reduce accidental repeated
  triggers.
- A manual tap fallback for devices or environments where motion sensing is
  unavailable.
- Playing bundled sound effects from the app's sound pool.
- Storing the slap total locally on the device.
- Packaging the web app as an Android app with Capacitor and using static
  Next.js export for the web assets.

## Out of scope

- Cloud accounts, score synchronization, and online leaderboards.
- Background or always-on motion monitoring. Motion input is used while the
  app is visible; this project does not promise operation when suspended or in
  the background.
- Social features, messaging, tournaments, rewards, analytics, or monetization.
- Configurable soft/medium/hard slap levels, slap-history reports, or other
  functionality not currently connected to the main app flow.
- A production backend hosted or operated by this repository.

## Platform and service assumptions

- Android is the primary packaged platform; a browser is useful as a
  development and manual-interaction fallback.
- Accelerometer access depends on device hardware, operating-system behavior,
  and runtime permissions or availability. Manual interaction remains the
  fallback.
- The slap total is stored in browser local storage on the device and is not
  backed up or synchronized.
- The project is a casual entertainment app, not a measurement, fitness,
  safety, or medical tool. Users should not strike or damage their devices.

## Completion criteria

A release within this scope should build as a static Next.js export, open in
the Android Capacitor shell, allow a user to trigger a sound and increment the
counter using either supported motion input or the manual control, and provide
the same locally stored total across app restarts without requiring network
access or environment variables.
