"use client";

import { useSlap } from "@/hooks/useSlap";
import { useSound } from "@/hooks/useSound";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import FloatingLips from "@/components/FloatingLips";
import SlapZone from "@/components/SlapZone";
import SlapCounter from "@/components/SlapCounter";
import { useEffect, useState } from "react";

export default function Home() {
  const { intensity, slapCount, isListening } = useSlap();
  const { playSound } = useSound();
  const { stats, isLoaded, addSlap } = useLocalStorage();
  const [webSlapCount, setWebSlapCount] = useState(0);

  // Play sound when intensity changes
  useEffect(() => {
    if (intensity) {
      playSound(intensity);
    }
  }, [intensity, playSound]);

  // Save slap to localStorage when count changes
  useEffect(() => {
    if (isLoaded && stats && webSlapCount > 0) {
      addSlap("soft"); // Will change based on actual intensity in MVP2
    }
  }, [webSlapCount, isLoaded, stats, addSlap]);

  // Manual tap handler for web testing
  const handleManualSlap = () => {
    const isMobile = typeof window !== "undefined" && "ontouchstart" in window;

    let slapIntensity: "soft" | "medium" | "hard" = "soft";

    if (!isMobile) {
      const fakeForce = Math.random() * 30;
      if (fakeForce < 10) {
        slapIntensity = "soft";
        playSound("soft");
      } else if (fakeForce < 20) {
        slapIntensity = "medium";
        playSound("medium");
      } else {
        slapIntensity = "hard";
        playSound("hard");
      }
    } else {
      playSound("soft");
    }

    // Save to localStorage
    addSlap(slapIntensity);
    setWebSlapCount((prev) => prev + 1);
  };

  const displayCount = isListening ? slapCount : webSlapCount;

  return (
    <div className="relative w-full h-screen bg-[#1a1a1a] overflow-hidden">
      <FloatingLips />

      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <SlapCounter count={displayCount} />

        <SlapZone onSlap={handleManualSlap} />

        <div className="mt-8 text-center">
          {isListening ? (
            <p className="text-green-400 text-sm font-semibold">
              🎤 Listening (Mobile)
            </p>
          ) : (
            <p className="text-yellow-400 text-sm font-semibold">
              💻 Web Mode (PC/Browser)
            </p>
          )}
          {stats && (
            <p className="text-gray-400 text-xs mt-2">
              Total stored: {stats.totalSlaps}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}