"use client";

interface SlapZoneProps {
  onSlap: () => void;
  disabled?: boolean;
}

export default function SlapZone({ onSlap, disabled = false }: SlapZoneProps) {
  return (
    <button
      onClick={onSlap}
      disabled={disabled}
      className={`
        w-40 h-40 rounded-full font-bold text-2xl
        transition-all duration-100 ease-out
        active:scale-90
        ${
          disabled
            ? "bg-red-900 opacity-60 cursor-not-allowed shadow-lg shadow-red-600/30"
            : "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/50 hover:shadow-red-600/80 hover:shadow-2xl"
        }
        text-white uppercase tracking-wider
        border-2 border-red-500
        hover:border-red-400
      `}
    >
      SLAP
    </button>
  );
}