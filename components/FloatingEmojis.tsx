"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { loadEmojiManifest } from "@/lib/load-emojis";

type FloatingEmoji = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  phase: number;
};

export default function FloatingEmojis() {
  const [emojiImages, setEmojiImages] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    loadEmojiManifest()
      .then((images) => {
        if (!cancelled) setEmojiImages(images);
      })
      .catch((error) => {
        console.error("Emoji manifest load failed:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const elements = Array.from(containerRef.current?.children ?? []) as HTMLElement[];
    let width = window.innerWidth;
    let height = window.innerHeight;
    let frameId = 0;
    let previousTime = 0;
    let frameSkip = 0;
    const pointer = { x: -9999, y: -9999 };
    const emojis: FloatingEmoji[] = Array.from({ length: elements.length }, () => {
      const scale = [0.6, 1, 1.4][Math.floor(Math.random() * 3)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15 * scale,
        vy: (Math.random() - 0.5) * 0.15 * scale,
        scale,
        phase: Math.random() * Math.PI * 2,
      };
    });

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
    };
    const onMouseMove = (event: MouseEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      pointer.x = touch.clientX;
      pointer.y = touch.clientY;
    };
    const onTouchEnd = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    const animate = (time: number) => {
      frameId = requestAnimationFrame(animate);
      if (isAndroid && ++frameSkip % 2 !== 0) return;

      const delta = Math.min(time - previousTime, 32);
      previousTime = time;
      const seconds = time * 0.001;

      emojis.forEach((emoji, index) => {
        const element = elements[index];
        if (!element) return;

        emoji.vx += Math.cos(seconds * Math.PI / 60) * 0.0025 * emoji.scale;
        emoji.vy += Math.sin(seconds * Math.PI / 60) * 0.0025 * emoji.scale;
        emoji.vx += (Math.random() - 0.5) * 0.006;
        emoji.vy += (Math.random() - 0.5) * 0.006;

        const dx = emoji.x - pointer.x;
        const dy = emoji.y - pointer.y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < 22500 && distanceSquared > 0) {
          emoji.vx += dx * 0.0005;
          emoji.vy += dy * 0.0005;
        }

        emoji.vx *= 0.985;
        emoji.vy *= 0.985;
        emoji.x += emoji.vx * delta;
        emoji.y += emoji.vy * delta;

        if (emoji.x > width + 120) emoji.x = -120;
        else if (emoji.x < -120) emoji.x = width + 120;
        if (emoji.y > height + 120) emoji.y = -120;
        else if (emoji.y < -120) emoji.y = height + 120;

        const wobbleX = Math.sin(seconds * 0.8 + emoji.phase) * 6 * emoji.scale;
        const wobbleY = Math.cos(seconds * 0.6 + emoji.phase + 0.5) * 6 * emoji.scale;
        const rotation = Math.sin(seconds * 0.7 + emoji.phase + 1) * 15;
        element.style.transform = `translate(${(emoji.x + wobbleX) | 0}px,${(emoji.y + wobbleY) | 0}px) scale(${emoji.scale}) rotate(${rotation.toFixed(1)}deg)`;
        element.style.opacity = `${(0.3 + emoji.scale * 0.7).toFixed(2)}`;
      });
    };

    frameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [emojiImages]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ isolation: "isolate" }}
    >
      {emojiImages.map((src, index) => (
        <div
          key={src}
          className="absolute left-0 top-0 h-[90px] w-[90px] will-change-transform"
        >
          <Image
            src={`/${src}`}
            alt=""
            width={128}
            height={128}
            className="h-full w-full object-contain"
            priority={index < 3}
          />
        </div>
      ))}
    </div>
  );
}
