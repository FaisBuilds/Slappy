# SlapDroid — CONTEXT.md

## What is SlapDroid?
A viral Android app inspired by SlapMac. Slap the back of your phone and it moans.
Built with Next.js + Capacitor. Exported as a real APK. No Play Store needed.

## Repos
- slapdroid-landing → Vercel (landing page)
- slapdroid-app → Capacitor (APK)

## Tech Stack
- Next.js (App Router)
- Tailwind CSS
- Capacitor (@capacitor/core, @capacitor/motion)
- Howler.js (sound engine)
- No Supabase, No auth, No backend

## MVP1 Features (LOCKED)
- Slap back of phone → moan plays
- 3 intensity levels based on accelerometer force:
  - force < 10 → soft moan
  - force 10-20 → medium moan
  - force > 20 → loud moan
- Tap button in center (fallback for PC/weak slaps)
- Slap counter on screen
- Background mode (accelerometer alive when app minimized)
- Floating lips UI (different expressions, dark grey background)

## MVP2 (DO NOT BUILD YET)
- Global slap counter (Supabase)
- Sound packs / voice selection
- Animations on slap

## File Structure — slapdroid-app
```
slapdroid-app/
├── app/
│   ├── page.tsx          ← main slap screen
│   └── layout.tsx        ← PWA + Capacitor meta
├── components/
│   ├── SlapZone.tsx      ← the tappable area
│   └── SlapCounter.tsx   ← displays slap count
├── hooks/
│   ├── useSlap.ts        ← accelerometer logic via @capacitor/motion
│   └── useSound.ts       ← Howler.js sound management
├── public/
│   └── sounds/           ← soft.mp3, medium.mp3, hard.mp3
└── capacitor.config.ts   ← app name, id, webDir config
```

## File Structure — slapdroid-landing
```
slapdroid-landing/
├── app/
│   └── page.tsx          ← landing page
└── public/
    └── lips/             ← lip expression images
```

## Design
- Background: dark grey (#1a1a1a)
- Floating lips with different expressions everywhere
- Minimal UI, one big tap button in center
- Slap counter displayed prominently
- Same aesthetic on both landing page and app

## Landing Page
- App name: SlapDroid
- Tagline: "Slap your Android. It moans back."
- One download button → links to GitHub Releases APK
- Direct APK link format:
  https://github.com/[username]/slapdroid-app/releases/download/v1.0/slapdroid.apk

## Capacitor Config
- App ID: com.faisal.slapdroid
- App Name: SlapDroid
- webDir: out (Next.js static export)

## Key Technical Notes
- Use @capacitor/motion for real accelerometer access
- Howler.js handles sound playback reliably on mobile
- Next.js must be static export for Capacitor:
  output: 'export' in next.config.js
- Background mode requires Android Foreground Service
- APK hosted on GitHub Releases, not Vercel

## Build Commands
- pnpm build → builds Next.js
- npx cap sync → syncs to Android
- npx cap open android → opens Android Studio
- Build APK from Android Studio
