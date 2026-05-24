# SlapDroid — Project Context & Architecture Matrix

SlapDroid is a high-performance, low-latency mobile/web application designed for competitive cloud slappers. The app maps physical device acceleration data to interactive audio cues and live-synchronizes score metrics to a global leaderboard.

---

## 🎨 System Theme & GUI Aesthetic
- **Visual Aesthetic:** Dark Twilight Cyberpunk / High-Contrast Minimalist.
- **Color Palette:** Pure OLED Black (`bg-black`), deep wine and vivid crimson accents (`text-red-400`, `bg-red-950/30`), and muted zinc/neutral borders.
- **Core Interface Layout:**
  - **Top:** Fixed, blurred Hardware Status Pill (`🟢 Accelerometer Ready`).
  - **Center:** Responsive `SlapCounter` with a crimson drop-shadow bloom pulse (`rgba(220, 38, 38, 0.8)`) overlapping interactive `FloatingLips` and the primary `SlapZone` touch target.
  - **Bottom:** Monospace user handle tracking indicator (`Logged in as @username`) sitting over the slide-up **Leaderboard** sheet trigger button.

---

## 🔄 App & Data Lifecycles

### 1. Onboarding & Unique Device Identity
- On boot, `usePlayer.ts` evaluates device `localStorage` for the key `slap_username`.
- If empty, `isNewUser` is set to `true`, forcing the `<UsernameDialog />` interceptor modal to lock down the UI viewport.
- The user provides an alphanumeric handle. The frontend strips out illegal characters and submits it to Supabase via `createPlayer()`.
- **Constraint Handling:** If the username is already taken, the database throws an error, causing the hook to return `false` to prompt the user. On success, the handle is saved locally to lock down the session forever.

### 2. High-Frequency Impact Loop
- **Physical Trigger:** The `useSlap.ts` hook opens a persistent event listener tracking the device's hardware accelerometer via Capacitor. When the total vector force passes `> 5`, the event fires.
- **Manual Trigger:** Clicking/tapping the desktop `SlapZone` acts as a responsive fallback engine.
- **The Event Pipeline:**
  1. **Optimistic UI Update:** The local state counter instantly jumps `+1`.
  2. **Visual Climax:** The counter container scales up and flashes its crimson drop-shadow glow.
  3. **Low-Latency Audio:** Howler.js selects the next non-repeating track asset out of the sound pool and fires it utilizing the multichannel Web Audio API to allow overlapping sound effects.
  4. **Background Sync:** A fire-and-forget request calls the database RPC `increment_slaps(username)` asynchronously, resolving silently to safeguard offline activity.

### 3. Global Leaderboard Drawer
- Tapping the bottom layout trigger slides up the `<LeaderboardSheet />` container.
- It pulls the Top 100 players from the backend, running a 30-second automated interval refetch background poll.
- A local `useMemo` filter live-filters rows instantly as the user types into the input box.
- The current user's profile row is highlighted dynamically using a custom `YOU` badge.

---

## 🗄️ Database Schema & Security Strategy

Execute this configuration matrix inside the Supabase SQL editor to link up the cloud backend infrastructure:

```sql
-- =======================================================
-- 1. TABLE DEFINITION & CONFIGURATION
-- =======================================================
CREATE TABLE public.players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(16) NOT NULL UNIQUE,
    total_slaps BIGINT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optimization Indices
CREATE INDEX idx_players_username ON public.players(username);
CREATE INDEX idx_players_leaderboard ON public.players(total_slaps DESC);

-- =======================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- =======================================================
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Allow public read access for compiling the Leaderboard
CREATE POLICY "Allow public read access" 
ON public.players 
FOR SELECT 
USING (true);

-- Allow new profiles to register through the Onboarding modal
CREATE POLICY "Allow profile registration" 
ON public.players 
FOR INSERT 
WITH CHECK (true);

-- Completely block direct REST/HTTP score manipulation updates
CREATE POLICY "Block direct slap modification" 
ON public.players 
FOR UPDATE 
USING (false);

-- =======================================================
-- 3. ATOMIC DATA RPC INCREMENT ENGINE
-- =======================================================
CREATE OR REPLACE FUNCTION public.increment_slaps(target_username VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE public.players
    SET total_slaps = total_slaps + 1
    WHERE username = target_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Authorize public execution privileges
GRANT EXECUTE ON FUNCTION public.increment_slaps(VARCHAR) TO anon, authenticated;