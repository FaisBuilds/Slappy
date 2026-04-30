"use client";

import { Button } from "@/components/ui/button";

interface SlapZoneProps {
  onSlap: () => void;
}

export default function SlapZone({ onSlap }: SlapZoneProps) {
  return (
    <div className="flex items-center justify-center">
      <Button
        onClick={onSlap}
        className="w-40 h-40 rounded-full bg-red-600 hover:bg-red-700 text-white text-2xl font-bold shadow-lg active:scale-95 transition-transform"
      >
        SLAP
      </Button>
    </div>
  );
}
