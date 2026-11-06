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

  const {
    isListening,
    isCalibrated,
    soundsReady,
    soundLoadFailed,
    registerManualSlap,
  } = useSlap({
    isEnabled: isLoaded,
    onImpact: triggerImpact,
    onSlap: handleSlap,
  });

  const handleManualSlap = () => {
    registerManualSlap();
  };

  const readiness = !soundsReady
    ? soundLoadFailed
      ? { label: "Sounds unavailable", tone: "unavailable" }
      : { label: "Loading sounds…", tone: "pending" }
    : isListening
      ? isCalibrated
        ? { label: "Accelerometer ready", tone: "ready" }
        : { label: "Calibrating… hold still", tone: "pending" }
      : { label: "Sensor unavailable", tone: "unavailable" };

  return (
    <div className="app-shell relative min-h-[100svh] w-full overflow-hidden select-none text-foreground">
      <div className="absolute top-6 left-1/2 z-50 -translate-x-1/2">
        <span
          role="status"
          aria-live="polite"
          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold shadow-lg backdrop-blur-md ${
            readiness.tone === "ready"
              ? "border-amber-300/20 bg-amber-300/10 text-amber-200"
              : readiness.tone === "pending"
                ? "border-amber-300/15 bg-amber-300/5 text-amber-100"
                : "border-[#ff806b]/25 bg-[#ff806b]/10 text-[#ffab9d]"
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${
              readiness.tone === "unavailable"
                ? "bg-[#ff806b]"
                : "bg-[#f5bd63]"
            } ${readiness.tone === "pending" ? "animate-pulse" : ""}`}
          />
          {readiness.label}
        </span>
      </div>

      <FloatingEmojis />

      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center">
        <div
          className={`transition-all duration-200 transform ${isGlowActive ? "scale-110" : "scale-100"}`}
          style={{
            filter: isGlowActive
              ? "drop-shadow(0 0 30px rgba(255, 117, 95, 0.45))"
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
