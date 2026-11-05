"use client";

import { useSlap } from "@/hooks/useSlap";
import { usePlayer } from "@/hooks/usePlayer";

import FloatingEmojis from "@/components/FloatingEmojis";
import SlapZone from "@/components/SlapZone";
import SlapCounter from "@/components/SlapCounter";
import { useCallback, useState } from "react";

export default function Home() {
  const { totalSlaps, isLoaded, addSlap } = usePlayer();
  const [isGlowActive, setIsGlowActive] = useState(false);

  const triggerImpact = useCallback(() => {
    setIsGlowActive(true);
    setTimeout(() => setIsGlowActive(false), 250);
  }, []);

  const handleSlap = useCallback(() => {
    addSlap();
  }, [addSlap]);

  const { isListening, isCalibrated, soundsReady, registerManualSlap } = useSlap({
    isEnabled: isLoaded,
    onImpact: triggerImpact,
    onSlap: handleSlap,
  });

  const handleManualSlap = () => {
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

      <FloatingEmojis />

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
        
        <SlapZone onSlap={handleManualSlap} disabled={!isLoaded} />
      </div>
    </div>
  );
}
