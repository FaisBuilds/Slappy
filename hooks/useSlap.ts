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

  useEffect(() => {
    if (listenerAddedRef.current) return;
    listenerAddedRef.current = true;

    let listener: any;
    const CALIBRATION_MS = 1500;
    const calibrationStart = Date.now();

    // Handle app visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App went to background
        isAppVisibleRef.current = false;
      } else {
        // App came to foreground - start stabilization
        isAppVisibleRef.current = true;
        resumeStabilizationRef.current = true;
        setTimeout(() => {
          resumeStabilizationRef.current = false;
        }, 2000); // 2 second stabilization period
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

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

          // Phase 1: idle calibration
          if (Date.now() - calibrationStart < CALIBRATION_MS) {
            calibrationSamplesRef.current.push(force);
            return;
          }

          // Phase 2: compute baseline + stddev once
          if (baselineRef.current === null) {
            const s = calibrationSamplesRef.current;
            const avg = s.reduce((a, b) => a + b, 0) / s.length;
            const variance = s.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / s.length;
            baselineRef.current = avg;
            stdDevRef.current = Math.sqrt(variance);

            // Check for saved thresholds
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

          // Always track live z-score for setup screen to read
          const zScore =
            stdDevRef.current && stdDevRef.current > 0
              ? (force - baselineRef.current!) / stdDevRef.current
              : 0;
          currentZScoreRef.current = zScore;

          // Phase 3: detect slap if thresholds exist
          if (!thresholdsRef.current) return;
          if (cooldownRef.current) return;
          
          // Skip slap detection during app resume stabilization
          if (resumeStabilizationRef.current) return;
          
          // Only detect when app is visible
          if (!isAppVisibleRef.current) return;

          const { soft, medium, hard } = thresholdsRef.current;
          const minThreshold = soft * 0.5;

          if (zScore > minThreshold) {
            let level: SlapIntensity;
            if (zScore < medium) level = "soft";
            else if (zScore < hard) level = "medium";
            else level = "hard";

            setIntensity(level);
            setSlapCount((prev) => prev + 1);

            cooldownRef.current = true;
            setTimeout(() => {
              cooldownRef.current = false;
              setIntensity(null);
            }, 500);
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
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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