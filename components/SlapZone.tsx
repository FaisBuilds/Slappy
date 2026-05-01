interface SlapZoneProps {
  onSlap: () => void;
  disabled?: boolean;
}

export default function SlapZone({ onSlap, disabled = false }: SlapZoneProps) {
  return (
    <button
      onClick={onSlap}
      disabled={disabled}
      className="w-40 h-40 rounded-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:opacity-50 text-white font-bold text-2xl transition-all"
    >
      SLAP
    </button>
  );
}