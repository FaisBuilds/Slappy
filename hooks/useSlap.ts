import { useEffect, useState, useRef } from "react";
import { Motion } from "@capacitor/motion";

export type SlapIntensity = "soft" | "medium" | "hard" | null;

interface SlapThresholds {
  soft: number;
  medium: number;
  hard: number;
}

export const useSlap = () => {
  const [intensity, setIntensity] = useState<SlapIntensity>(null);
  const [slapCount, setSlapCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  const cooldownRef = useRef(false);
  const listenerAddedRef = useRef(false);
  const baselineRef = useRef<number | null>(null);
  const stdDevRef = useRef<number | null>(null);
  const thresholdsRef = useRef<SlapThresholds | null>(null);
  const calibrationSamplesRef = useRef<number[]>([]);
  const currentZScoreRef = useRef<number>(0);
  const isAppVisibleRef = useRef(true);
  const resumeStabilizationRef = useRef(false);

  // Peak tracking across a short burst window for missed slaps
  const burstPeakRef = useRef<number>(0);
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (listenerAddedRef.current) return;
    listenerAddedRef.current = true;

    let listener: any;
    const CALIBRATION_MS = 1500;
    const calibrationStart = Date.now();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isAppVisibleRef.current = false;
      } else {
        isAppVisibleRef.current = true;
        resumeStabilizationRef.current = true;
        setTimeout(() => {
          resumeStabilizationRef.current = false;
        }, 2000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const startListening = async () => {
      try {
        listener = await Motion.addListener("accel", (event) => {
          const acc =
            event.acceleration?.x != null
              ? event.acceleration
              : event.accelerationIncludingGravity;

          if (!acc) return;

          const x = acc.x ?? 0;
          const y = acc.y ?? 0;
          const z = acc.z ?? 0;
          const force = Math.sqrt(x * x + y * y + z * z);

          // Phase 1: calibration window
          if (Date.now() - calibrationStart < CALIBRATION_MS) {
            calibrationSamplesRef.current.push(force);
            return;
          }

          // Phase 2: compute baseline once
          if (baselineRef.current === null) {
            const s = calibrationSamplesRef.current;
            const avg = s.reduce((a, b) => a + b, 0) / s.length;
            const variance =
              s.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / s.length;
            baselineRef.current = avg;
            // Clamp stdDev — prevents division by near-zero on very stable devices
            stdDevRef.current = Math.max(Math.sqrt(variance), 0.5);

            const saved = localStorage.getItem("slapThresholds");
            if (saved) {
              thresholdsRef.current = JSON.parse(saved);
              setIsCalibrating(false);
            } else {
              setNeedsSetup(true);
              setIsCalibrating(false);
            }
            return;
          }

          const zScore =
            stdDevRef.current && stdDevRef.current > 0
              ? (force - baselineRef.current!) / stdDevRef.current
              : 0;
          currentZScoreRef.current = zScore;

          if (!thresholdsRef.current) return;
          if (cooldownRef.current) return;
          if (resumeStabilizationRef.current) return;
          if (!isAppVisibleRef.current) return;

          const { soft, medium, hard } = thresholdsRef.current;

          // Minimum trigger = 40% of soft threshold (was 50% — more sensitive)
          const minThreshold = soft * 0.4;

          if (zScore <= minThreshold) return;

          // Burst window: collect the true peak over 80ms
          // This catches slaps where the sharpest spike arrives a few frames late
          if (burstPeakRef.current < zScore) {
            burstPeakRef.current = zScore;
          }

          if (!burstTimerRef.current) {
            burstTimerRef.current = setTimeout(() => {
              const peak = burstPeakRef.current;
              burstPeakRef.current = 0;
              burstTimerRef.current = null;

              // Classify using the true peak of the burst
              // Boundaries: soft < medium threshold, medium < hard threshold, else hard
              let level: SlapIntensity;
              if (peak < medium) level = "soft";
              else if (peak < hard) level = "medium";
              else level = "hard";

              setIntensity(level);
              setSlapCount((prev) => prev + 1);

              cooldownRef.current = true;
              setTimeout(() => {
                cooldownRef.current = false;
                setIntensity(null);
              }, 400); // slightly tighter cooldown (was 500ms)
            }, 80); // 80ms burst window — ~5 accelerometer frames
          }
        });

        setIsListening(true);
      } catch (error) {
        console.error("Motion listener error:", error);
      }
    };

    startListening();

    return () => {
      if (listener) listener.remove();
      listenerAddedRef.current = false;
      setIsListening(false);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    };
  }, []);

  const capturePeak = (durationMs: number): Promise<number> => {
    return new Promise((resolve) => {
      let peak = 0;
      const interval = setInterval(() => {
        if (currentZScoreRef.current > peak) {
          peak = currentZScoreRef.current;
        }
      }, 16);
      setTimeout(() => {
        clearInterval(interval);
        resolve(peak);
      }, durationMs);
    });
  };

  const saveThresholds = (thresholds: SlapThresholds) => {
    thresholdsRef.current = thresholds;
    localStorage.setItem("slapThresholds", JSON.stringify(thresholds));
    setNeedsSetup(false);
  };

  const resetThresholds = () => {
    localStorage.removeItem("slapThresholds");
    thresholdsRef.current = null;
    setNeedsSetup(true);
  };

  return {
    intensity,
    slapCount,
    isListening,
    isCalibrating,
    needsSetup,
    capturePeak,
    saveThresholds,
    resetThresholds,
  };
};