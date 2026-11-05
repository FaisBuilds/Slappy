# Slappy

Slappy is a playful, local-only app that turns device movement or a manual tap
into a sound effect and a locally saved counter increment. Avoid hitting or
damaging your device.

## Features

- Motion detection with calibration and cooldown on supported devices.
- A manual **SLAP** button when motion sensing is unavailable.
- Bundled sound effects and a slap counter saved on the device.
- Android packaging with Capacitor and a static Next.js export.

## Development

```bash
pnpm install
pnpm dev
```

Build the static web export with `pnpm build`. The Android project is in
`android/`.
