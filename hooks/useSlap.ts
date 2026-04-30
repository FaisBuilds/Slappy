import { useEffect, useState, useRef } from "react";
import { Motion } from "@capacitor/motion";

export type SlapIntensity = "soft" | "medium" | "hard" | null;

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
        // Request permission if necessary (iOS requires this)
        // On Android/Web it's usually handled by the plugin automatically
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((Motion as any).requestPermissions) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const permission = await (Motion as any).requestPermissions();
          if (permission.acceleration !== "granted") {
            console.error("Motion permission not granted");
            return;
          }
        }

        listener = await Motion.addListener("accel", (event) => {
          const { x, y, z } = event.acceleration;

          // Calculate force (magnitude of the acceleration vector)
          // Using linear acceleration (no gravity)
          const force = Math.sqrt(x * x + y * y + z * z);

          // Only trigger if force is above minimum threshold of 8
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

            // Apply cooldown to prevent multiple triggers for a single slap
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
      setIsListening(false);
    };
  }, []);

  return { intensity, slapCount, isListening };
};
