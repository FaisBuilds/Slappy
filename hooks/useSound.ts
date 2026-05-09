import { Howl } from 'howler';
import { useRef, useEffect, useState } from 'react';

type SlapIntensity = 'soft' | 'medium' | 'hard';

export const useSound = () => {
  const soundsRef = useRef<Record<SlapIntensity, Howl | null>>({
    soft: null,
    medium: null,
    hard: null,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const soundTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // ✅ Enable HTML5 audio for mobile
    Howler.usingWebAudio = true;

    soundsRef.current = {
      soft: new Howl({
        src: ['/sounds/soft.mp3'],
        preload: true,
        html5: true, // ✅ Enable HTML5 fallback
        onend: () => setIsPlaying(false),
      }),
      medium: new Howl({
        src: ['/sounds/medium.mp3'],
        preload: true,
        html5: true, // ✅ Enable HTML5 fallback
        onend: () => setIsPlaying(false),
      }),
      hard: new Howl({
        src: ['/sounds/hard.mp3'],
        preload: true,
        html5: true, // ✅ Enable HTML5 fallback
        onend: () => setIsPlaying(false),
      }),
    };

    return () => {
      Object.values(soundsRef.current).forEach((sound) => {
        if (sound) {
          sound.stop();
          sound.unload();
        }
      });
      if (soundTimeoutRef.current) {
        clearTimeout(soundTimeoutRef.current);
      }
    };
  }, []);

  const playSound = (intensity: SlapIntensity | number) => {
    let soundKey: SlapIntensity = 'soft';
    if (typeof intensity === 'number') {
      if (intensity < 12) soundKey = 'soft';
      else if (intensity <= 20) soundKey = 'medium';
      else soundKey = 'hard';
    } else {
      soundKey = intensity;
    }

    const sound = soundsRef.current[soundKey];
    
    if (sound) {
      sound.stop();
      sound.play();
      setIsPlaying(true);

      if (soundTimeoutRef.current) {
        clearTimeout(soundTimeoutRef.current);
      }
      soundTimeoutRef.current = setTimeout(() => {
        setIsPlaying(false);
      }, 500);
    }
  };

  return { playSound, isPlaying };
};