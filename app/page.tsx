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
  const { stats, isLoaded, addSlap, clearStats } = useLocalStorage();
  const [webSlapCount, setWebSlapCount] = useState(0);
  const lastSavedRef = useRef(0);
  

  // Initialize webSlapCount from localStorage when page loads
  useEffect(() => {
    if (isLoaded && stats) {
      setWebSlapCount(stats.totalSlaps);
      lastSavedRef.current = stats.totalSlaps;
    }
  }, [isLoaded, stats]);

  // Play sound when intensity changes
  useEffect(() => {
    if (intensity) {
      playSound(intensity);
    }
  }, [intensity, playSound]);

  // Save slap to localStorage ONLY when webSlapCount increases
  useEffect(() => {
    if (isLoaded && webSlapCount > lastSavedRef.current) {
      lastSavedRef.current = webSlapCount;
      addSlap("soft");
    }
  }, [webSlapCount, isLoaded, addSlap]);

  // Manual tap handler
  const handleManualSlap = () => {
    const isMobile =
      typeof window !== "undefined" && "ontouchstart" in window;

    if (!isMobile) {
      const fakeForce = Math.random() * 30;
      if (fakeForce < 10) {
        playSound("soft");
      } else if (fakeForce < 20) {
        playSound("medium");
      } else {
        playSound("hard");
      }
    } else {
      playSound("soft");
    }

    setWebSlapCount((prev) => prev + 1);
  };

  const displayCount = isListening ? slapCount : webSlapCount;

  return (
    <div className="relative w-full h-screen bg-[#1a1a1a] overflow-hidden">
      <FloatingLips />

      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <SlapCounter count={displayCount} />
        <SlapZone onSlap={handleManualSlap} disabled={isPlaying} />

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
            <div>
              <p className="text-gray-400 text-xs mt-2">
                Total stored: {stats.totalSlaps}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}