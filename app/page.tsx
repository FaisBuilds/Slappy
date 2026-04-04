"use client";

import { useSlap } from "@/hooks/useSlap";
import { useSound } from "@/hooks/useSound";
import { Button } from "@/components/ui/button";
import FloatingLips from "@/components/FloatingLips";
import SlapZone from "@/components/SlapZone";
import SlapCounter from "@/components/SlapCounter";
import { useEffect } from "react";

export default function Home() {
  const { intensity, slapCount, isListening } = useSlap();
  const { playSound } = useSound();

  // Play sound when intensity changes
  useEffect(() => {
    if (intensity) {
      playSound(intensity);
    }
  }, [intensity, playSound]);

  return (
    <div className="relative w-full h-screen bg-[#1a1a1a] overflow-hidden">
      {/* Floating Lips Background */}
      <FloatingLips />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {/* Slap Counter */}
        <SlapCounter count={slapCount} />

        {/* Slap Zone (Tappable Button) */}
        <SlapZone onSlap={() => playSound(intensity || "soft")} />

        {/* Status Indicator */}
        <div className="mt-8 text-center">
          {isListening ? (
            <p className="text-green-400 text-sm font-semibold">
              🎤 Listening...
            </p>
          ) : (
            <p className="text-red-400 text-sm font-semibold">
              ⚠️ Not listening
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
