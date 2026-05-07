import { useEffect, useState, useRef } from "react";
import { Motion } from "@capacitor/motion";
import { registerPlugin } from "@capacitor/core";

export type SlapIntensity = "soft" | "medium" | "hard" | null;

const SlapService = registerPlugin<{
  start: () => Promise<void>;
  stop: () => Promise<void>;
}>("SlapService");

export const useSlap = () => {
  const [intensity, setIntensity] = useState<SlapIntensity>(null);
  const [slapCount, setSlapCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const cooldownRef = useRef(false);

  useEffect(() => {
    let listener: any;

    const startListening = async () => {
      try {
        if ((Motion as any).requestPermissions) {
          const permission = await (Motion as any).requestPermissions();
          if (permission.acceleration !== "granted") {
            console.error("Motion permission not granted");
            return;
          }
        }

        // Start foreground service
        try {
          await SlapService.start();
          console.log("✅ Foreground service started");
        } catch (e) {
          console.warn("⚠️ SlapService not available:", e);
        }

        listener = await Motion.addListener("accel", (event) => {
          const { x, y, z } = event.acceleration;
          const force = Math.sqrt(x * x + y * y + z * z);

          // ✅ LOWER THRESHOLD + Better detection
          if (force > 5 && !cooldownRef.current) {
            let level: SlapIntensity = null;

            if (force < 12) {
              level = "soft";
            } else if (force <= 20) {
              level = "medium";
            } else {
              level = "hard";
            }

            console.log(`📊 Force: ${force.toFixed(2)} → ${level}`);
            setIntensity(level);
            setSlapCount((prev) => prev + 1);

            cooldownRef.current = true;
            setTimeout(() => {
              cooldownRef.current = false;
              setIntensity(null);
            }, 300);
          }
        });

        setIsListening(true);
      } catch (error) {
        console.error("❌ Error starting motion listener:", error);
      }
    };

    startListening();

    return () => {
      if (listener) {
        listener.remove();
      }

      SlapService.stop().catch((e) =>
        console.warn("⚠️ SlapService stop failed:", e)
      );

      setIsListening(false);
    };
  }, []);

  return { intensity, slapCount, isListening };
};