"use client";

import { useState, useRef } from "react";

type Step = "intro" | "soft" | "medium" | "hard" | "done";

interface Props {
  capturePeak: (ms: number) => Promise<number>;
  saveThresholds: (t: { soft: number; medium: number; hard: number }) => void;
}

export default function CalibrationScreen({ capturePeak, saveThresholds }: Props) {
  const [step, setStep] = useState<Step>("intro");
  const [capturing, setCapturing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const peaksRef = useRef<number[]>([]);

  const capture = async (level: "soft" | "medium" | "hard") => {
    setCapturing(true);
    setFeedback("slap now!");

    const peak = await capturePeak(3000);
    peaksRef.current = [...peaksRef.current, peak];

    setFeedback(`got it! z=${peak.toFixed(1)}`);
    setCapturing(false);

    setTimeout(() => {
      setFeedback("");
      if (level === "soft") setStep("medium");
      else if (level === "medium") setStep("hard");
      else {
        const [s, m, h] = peaksRef.current;
        saveThresholds({
          soft: s * 0.7,
          medium: m * 0.7,
          hard: h * 0.7,
        });
        setStep("done");
      }
    }, 800);
  };

  const config: Record<string, { label: string; hint: string; color: string; next: () => void }> = {
    soft: {
      label: "soft slap",
      hint: "tap the back of your phone gently",
      color: "#1D9E75",
      next: () => capture("soft"),
    },
    medium: {
      label: "medium slap",
      hint: "a proper slap — not too hard",
      color: "#BA7517",
      next: () => capture("medium"),
    },
    hard: {
      label: "hard slap",
      hint: "go for it. full send.",
      color: "#E24B4A",
      next: () => capture("hard"),
    },
  };

  const steps = ["soft", "medium", "hard"];

  return (
    <div className="absolute inset-0 z-30 bg-black flex flex-col items-center justify-center px-8 text-white">
      {step === "intro" && (
        <>
          <p className="text-3xl font-bold mb-3">calibrate your slap</p>
          <p className="text-gray-400 text-center mb-10">
            we'll record 3 slaps so the app knows your phone and your style. slap with your palm for best results
          </p>
          <button
            onClick={() => setStep("soft")}
            className="w-full py-4 rounded-2xl bg-white text-black font-semibold text-lg"
          >
            let's go
          </button>
        </>
      )}

      {(step === "soft" || step === "medium" || step === "hard") && (
        <>
          <div className="text-6xl mb-6">👋</div>
          <p className="text-2xl font-bold mb-2" style={{ color: config[step].color }}>
            {config[step].label}
          </p>
          <p className="text-gray-400 text-center mb-10">{config[step].hint}</p>

          {feedback ? (
            <p className="text-xl font-mono" style={{ color: config[step].color }}>
              {feedback}
            </p>
          ) : (
            <button
              onClick={config[step].next}
              disabled={capturing}
              className="w-full py-4 rounded-2xl font-semibold text-lg text-black"
              style={{ background: config[step].color }}
            >
              tap to slap
            </button>
          )}

          <div className="flex gap-2 mt-10">
            {steps.map((s) => (
              <div
                key={s}
                className="w-2 h-2 rounded-full"
                style={{
                  background:
                    s === step
                      ? "white"
                      : peaksRef.current.length > steps.indexOf(s)
                      ? "#666"
                      : "#333",
                }}
              />
            ))}
          </div>
        </>
      )}

      {step === "done" && (
        <>
          <p className="text-4xl mb-4">✅</p>
          <p className="text-2xl font-bold mb-2">you're set</p>
          <p className="text-gray-400 text-center">slap detection calibrated to your device</p>
        </>
      )}
    </div>
  );
}