"use client";

interface SlapCounterProps {
  count: number;
}

export default function SlapCounter({ count }: SlapCounterProps) {
  return (
    <div className="counter-panel mb-12 text-center">
      <p className="mb-2 text-sm font-semibold tracking-[0.24em] text-muted-foreground">
        SLAPS
      </p>
      <p
        aria-live="polite"
        className="counter-value text-7xl font-black tabular-nums drop-shadow-[0_5px_18px_rgba(255,117,95,0.12)]"
      >
        {count}
      </p>
    </div>
  );
}