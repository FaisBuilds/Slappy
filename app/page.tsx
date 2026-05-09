"use client";

import { useSlap } from "@/hooks/useSlap";
import { useSound } from "@/hooks/useSound";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import FloatingLips from "@/components/FloatingLips";
import SlapZone from "@/components/SlapZone";
import SlapCounter from "@/components/SlapCounter";
import CalibrationScreen from "@/components/CalibrationScreen";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const {
    intensity,
    isCalibrating,
    needsSetup,
    capturePeak,
    saveThresholds,
    resetThresholds,
  } = useSlap();
  const { playSound, isPlaying } = useSound();
  const { stats, isLoaded, addSlap } = useLocalStorage();
  const [displayCount, setDisplayCount] = useState(0);
  const [isGlowActive, setIsGlowActive] = useState(false);
  const prevIntensityRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoaded && stats) {
      setDisplayCount(stats.totalSlaps);
    }
  }, [isLoaded]);

  const triggerImpact = () => {
    setIsGlowActive(true);
    setTimeout(() => setIsGlowActive(false), 250);
  };

  useEffect(() => {
    if (intensity && prevIntensityRef.current === null) {
      playSound(intensity);
      triggerImpact();
      setDisplayCount((prev) => prev + 1);
      addSlap(intensity);
    }
    prevIntensityRef.current = intensity;
  }, [intensity, playSound, addSlap]);

  const handleManualSlap = () => {
    const force = Math.random() * 30;
    const level = force < 12 ? "soft" : force < 20 ? "medium" : "hard";
    playSound(level);
    triggerImpact();
    setDisplayCount((prev) => prev + 1);
    addSlap(level);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">

      {isCalibrating && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
          <p className="text-white text-lg tracking-widest animate-pulse">
            hold still...
          </p>
        </div>
      )}

      {!isCalibrating && needsSetup && (
        <CalibrationScreen
          capturePeak={capturePeak}
          saveThresholds={saveThresholds}
        />
      )}

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
          <SlapCounter count={displayCount} />
        </div>
        <SlapZone
          onSlap={handleManualSlap}
          disabled={isPlaying || isCalibrating || needsSetup}
        />

        {/* Recalibrate button — small, bottom of screen */}
        {!needsSetup && !isCalibrating && (
          <button
            onClick={resetThresholds}
            className="absolute bottom-6 text-gray-600 text-xs tracking-widest"
          >
            recalibrate
          </button>
        )}
      </div>
    </div>
  );
}