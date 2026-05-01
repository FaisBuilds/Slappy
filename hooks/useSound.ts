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

  useEffect(() => {
    soundsRef.current = {
      soft: new Howl({
        src: ['/sounds/soft.mp3'],
        preload: true,
        onend: () => setIsPlaying(false),
      }),
      medium: new Howl({
        src: ['/sounds/medium.mp3'],
        preload: true,
        onend: () => setIsPlaying(false),
      }),
      hard: new Howl({
        src: ['/sounds/hard.mp3'],
        preload: true,
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
    };
  }, []);

  const playSound = (intensity: SlapIntensity) => {
    const sound = soundsRef.current[intensity];
    
    if (sound && !isPlaying) {
      sound.stop();
      setIsPlaying(true);
      sound.play();
    }
  };

  return { playSound, isPlaying };
};