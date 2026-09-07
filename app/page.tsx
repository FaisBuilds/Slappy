"use client";

import { useSlap } from "@/hooks/useSlap";
import { usePlayer } from "@/hooks/usePlayer";
import { useLeaderboard } from "@/hooks/useLeaderboard";

import FloatingLips from "@/components/FloatingLips";
import SlapZone from "@/components/SlapZone";
import SlapCounter from "@/components/SlapCounter";
import LeaderboardSheet from "@/components/LeaderboardSheet";
import UsernameDialog from "@/components/UsernameDialog";
import { useCallback, useState } from "react";

export default function Home() {
  const { username, totalSlaps, isNewUser, createAccount, addSlap } = usePlayer();
  const { players, isLoading, refetch } = useLeaderboard();
  const [isGlowActive, setIsGlowActive] = useState(false);

  const triggerImpact = useCallback(() => {
    setIsGlowActive(true);
    setTimeout(() => setIsGlowActive(false), 250);
  }, []);

  const handleSlap = useCallback(() => {
    addSlap();
    void refetch();
  }, [addSlap, refetch]);

  const { isListening, isCalibrated, soundsReady, registerManualSlap } = useSlap({
    isEnabled: !isNewUser,
    onImpact: triggerImpact,
    onSlap: handleSlap,
  });

  const handleManualSlap = () => {
    if (isNewUser) return;
    registerManualSlap();
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      
      {/* Sensor Readiness Status Pill */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50">
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md ${
          isListening 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
            : "bg-red-500/10 text-red-400 border-red-500/20"
        }`}>
          <span className={`w-2 h-2 rounded-full ${isListening ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`} />
          {!soundsReady
            ? "🟡 Loading sounds…"
            : isListening
              ? isCalibrated
                ? "🟢 Accelerometer Ready"
                : "🟡 Calibrating… hold still"
              : "🔴 Sensor Unavailable"}
        </span>
      </div>

      <FloatingLips />
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div
          className={`transition-all duration-200 transform ${isGlowActive ? "scale-110" : "scale-100"}`}
          style={{
            filter: isGlowActive
              ? "drop-shadow(0 0 30px rgba(220, 38, 38, 0.8))"
              : "none",
          }}
        >
          <SlapCounter count={totalSlaps} />
        </div>
        
        <SlapZone onSlap={handleManualSlap} />

        {/* Floating details badge directly tracking user identity under the zone */}
        {username && (
          <p className="absolute bottom-24 text-[11px] font-mono tracking-wider text-neutral-500 uppercase">
            Logged in as @{username}
          </p>
        )}

        {/* Modularized Leaderboard Interface Context */}
        <LeaderboardSheet 
          players={players} 
          isLoading={isLoading} 
          username={username} 
          refetch={refetch} 
        />
      </div>

      {/* Modularized Account Verification Gateway */}
      <UsernameDialog 
        isOpen={isNewUser} 
        createAccount={createAccount} 
      />
    </div>
  );
}
