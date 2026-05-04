"use client";

import { useSlap } from "@/hooks/useSlap";
import { useSound } from "@/hooks/useSound";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import FloatingLips from "@/components/FloatingLips";
import SlapZone from "@/components/SlapZone";
import SlapCounter from "@/components/SlapCounter";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const { intensity, slapCount, isListening } = useSlap();
  const { playSound, isPlaying } = useSound();
  const { stats, isLoaded, addSlap } = useLocalStorage();
  const [webSlapCount, setWebSlapCount] = useState(0);
  const [isGlowActive, setIsGlowActive] = useState(false);
  const lastSavedRef = useRef(0);

  // Sync initial state
  useEffect(() => {
    if (isLoaded && stats) {
      setWebSlapCount(stats.totalSlaps);
      lastSavedRef.current = stats.totalSlaps;
    }
  }, [isLoaded, stats]);

  // Visual feedback trigger
  const triggerImpact = () => {
    setIsGlowActive(true);
    setTimeout(() => setIsGlowActive(false), 250);
  };

  // Physical Slap Handler (Accelerometer)
  useEffect(() => {
    if (intensity) {
      playSound(intensity);
      triggerImpact();
    }
  }, [intensity, playSound]);

  // Sync web slaps to storage
  useEffect(() => {
    if (isLoaded && webSlapCount > lastSavedRef.current) {
      lastSavedRef.current = webSlapCount;
      addSlap("soft"); // Default category for manual taps
    }
  }, [webSlapCount, isLoaded, addSlap]);

  const handleManualSlap = () => {
    const isMobile = typeof window !== "undefined" && "ontouchstart" in window;

    if (!isMobile) {
      const fakeForce = Math.random() * 30;
      playSound(fakeForce < 10 ? "soft" : fakeForce < 20 ? "medium" : "hard");
    } else {
      playSound("soft");
    }

    setWebSlapCount((prev) => prev + 1);
    triggerImpact();
  };

  const displayCount = isListening ? slapCount : webSlapCount;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <FloatingLips />

      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {/* Animated Counter Wrapper */}
        <div 
          className={`transition-all duration-200 transform ${
            isGlowActive ? "scale-110" : "scale-100"
          }`}
          style={{
            filter: isGlowActive 
              ? "drop-shadow(0 0 30px rgba(220, 38, 38, 0.8))" 
              : "drop-shadow(0 0 10px rgba(0, 0, 0, 0))"
          }}
        >
          <SlapCounter count={displayCount} />
        </div>

        <SlapZone onSlap={handleManualSlap} disabled={isPlaying} />
      </div>
    </div>
  );
}