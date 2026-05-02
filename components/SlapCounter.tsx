"use client";

interface SlapCounterProps {
  count: number;
}

export default function SlapCounter({ count }: SlapCounterProps) {
  return (
    <div className="text-center mb-12">
      <p className="text-gray-400 text-sm font-semibold tracking-widest mb-2">
        SLAPS
      </p>
      <p className="text-red-600 text-7xl font-black drop-shadow-lg shadow-red-600/50">
        {count}
      </p>
    </div>
  );
}