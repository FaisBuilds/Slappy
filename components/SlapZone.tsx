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
        h-40 w-40 rounded-full border-2 font-bold text-2xl uppercase tracking-wider
        transition-all duration-150 ease-out
        active:scale-95
        focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4b65f]
        ${
          disabled
            ? "cursor-not-allowed border-[#775047] bg-[#382a28] text-[#c4aaa2] shadow-lg shadow-black/20"
            : "border-[#ff927f] bg-[#ff755f] text-[#28120e] shadow-[0_12px_30px_rgba(255,117,95,0.24)] hover:border-[#ffad9e] hover:bg-[#ff8875] hover:shadow-[0_16px_38px_rgba(255,117,95,0.3)]"
        }
      `}
    >
      SLAP
    </button>
  );
}