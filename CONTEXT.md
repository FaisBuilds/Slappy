Refactor this Next.js + Capacitor Android app called SlapDroid. Keep all existing files and structure. Only reorganize and add new logic as described below.
CURRENT STACK:
Next.js (static export), Capacitor, Tailwind CSS, Shadcn UI, Howler.js, @capacitor/motion, Supabase, pnpm
WHAT TO BUILD:
1. lib/supabase.ts
Initialize Supabase client using NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars. Export as default.
2. lib/players.ts
Pure async functions, no React:

createPlayer(username: string): Promise<Player | null> — inserts new row into players table
getPlayer(username: string): Promise<Player | null> — fetches player by username
incrementSlaps(username: string): Promise<void> — calls RPC function increment_slaps
getLeaderboard(): Promise<Player[]> — fetches top 100 players ordered by total_slaps descending

Player type: { id: string, username: string, total_slaps: number, updated_at: string }
3. lib/sound-pool.ts
Pure logic, no React, no Howler:

Takes an array of sound file paths
Returns a shuffled queue manager with method getNext(): string that returns next sound path
Reshuffles entire pool when exhausted
Never returns same sound twice in a row
Export as createSoundPool(paths: string[])

4. hooks/useSlap.ts — REFACTOR EXISTING
Keep @capacitor/motion accelerometer detection. Remove ALL intensity level logic (soft/medium/hard). On any slap (force > 5): fire callback onSlap(). Return { isListening, slapCount }. Accept onSlap as parameter.
5. hooks/useSound.ts — REFACTOR EXISTING
Use Howler.js. On mount, scan /public/sounds/ folder — accept array of sound paths as prop. Use lib/sound-pool.ts for queue management. Export playNext(): void and isPlaying: boolean.
6. hooks/useLeaderboard.ts — NEW HOOK

Fetches leaderboard from lib/players.ts
Returns { players, isLoading, error, refetch }
Auto-refetches every 30 seconds

7. hooks/usePlayer.ts — NEW HOOK

On mount checks localStorage for slap_username
If not found: isNewUser = true so UI can show username picker
If found: fetch player from Supabase, sync local count
Returns { username, totalSlaps, isNewUser, createAccount, addSlap }
addSlap() increments local count immediately, syncs to Supabase async (fire and forget)
createAccount(username) creates player in Supabase, stores username in localStorage

8. app/page.tsx — REFACTOR EXISTING
Wire everything together:

If isNewUser → show username picker modal (Shadcn Dialog) before anything else
Main UI: floating lips (keep existing FloatingLips component), slap counter (big number center screen)
Sensor status pill top of screen: 🟢 Accelerometer Ready / 🔴 Sensor Unavailable
Leaderboard: Shadcn Sheet sliding from bottom, triggered by a fixed bottom button labeled "LEADERBOARD"
Sheet contains: search bar (filter by username), ranked list (rank, username, slap count), current user row highlighted

SUPABASE TABLE (already exists):
sqlplayers (id uuid, username text unique, total_slaps integer, created_at timestamp, updated_at timestamp)
RPC: increment_slaps(player_username text)
RULES:

TypeScript strict throughout
Keep FloatingLips.tsx exactly as is
Keep all existing Tailwind + Shadcn styling patterns
No breaking changes to existing component structure
Wrap all Supabase calls in try/catch, fail silently when offline
Sound pool works even with 1 sound file — scales to any number automatically


