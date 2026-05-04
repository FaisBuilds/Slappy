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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let listener: any;

    const startListening = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((Motion as any).requestPermissions) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const permission = await (Motion as any).requestPermissions();
          if (permission.acceleration !== "granted") {
            console.error("Motion permission not granted");
            return;
          }
        }

        // Start foreground service so Android doesn't kill us in background
        try {
          await SlapService.start();
        } catch (e) {
          // Silently fail on web/dev where plugin doesn't exist
          console.warn("SlapService not available (web?):", e);
        }

        listener = await Motion.addListener("accel", (event) => {
          const { x, y, z } = event.acceleration;
          const force = Math.sqrt(x * x + y * y + z * z);

          if (force > 8 && !cooldownRef.current) {
            let level: SlapIntensity = null;

            if (force < 15) {
              level = "soft";
            } else if (force <= 30) {
              level = "medium";
            } else {
              level = "hard";
            }

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
        console.error("Error starting motion listener:", error);
      }
    };

    startListening();

    return () => {
      if (listener) {
        listener.remove();
      }

      // Stop foreground service on cleanup
      SlapService.stop().catch((e) =>
        console.warn("SlapService stop failed:", e)
      );

      setIsListening(false);
    };
  }, []);

  return { intensity, slapCount, isListening };
};