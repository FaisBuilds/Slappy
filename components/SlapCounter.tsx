"use client";

interface SlapCounterProps {
  count: number;
}

export default function SlapCounter({ count }: SlapCounterProps) {
  return (
    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center">
      <p className="text-white text-sm font-semibold opacity-80">SLAPS</p>
      <p className="text-5xl font-bold text-red-500">{count}</p>
    </div>
  );
}
