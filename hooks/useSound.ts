import { Howl } from 'howler';
import { useRef, useEffect } from 'react';

type SlapIntensity = 'soft' | 'medium' | 'hard';

export const useSound = () => {
  const soundsRef = useRef<Record<SlapIntensity, Howl | null>>({
    soft: null,
    medium: null,
    hard: null,
  });

  useEffect(() => {
    // Initialize Howl instances for each intensity
    soundsRef.current = {
      soft: new Howl({
        src: ['/sounds/soft.mp3'],
        preload: true,
      }),
      medium: new Howl({
        src: ['/sounds/medium.mp3'],
        preload: true,
      }),
      hard: new Howl({
        src: ['/sounds/hard.mp3'],
        preload: true,
      }),
    };

    // Cleanup: stop and unload all sounds on unmount
    return () => {
      Object.values(soundsRef.current).forEach((sound) => {
        if (sound) {
          sound.stop();
          sound.unload();
        }
      });
    };
  }, []);

  const playSound = (intensity: SlapIntensity) => {
    const sound = soundsRef.current[intensity];
    
    if (sound) {
      // If a sound is already playing, stop it and play the new one
      sound.stop();
      sound.play();
    }
  };

  return { playSound };
};
