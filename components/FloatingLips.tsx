"use client";
import { useEffect, useRef, memo } from "react";
import Image from "next/image";

interface Lip {
  x: number;
  y: number;
  vx: number;
  vy: number;
  depth: number;
  imageIndex: number;
}

const FloatingLipsComponent = memo(() => {
  const lipsRef = useRef<Lip[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const mouse = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const lipCount = isAndroid ? 7 : 12;

    // Mouse support
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    // Touch support
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      mouse.current.x = touch.clientX;
      mouse.current.y = touch.clientY;
    };

    const handleTouchEnd = () => {
      mouse.current.x = -999;
      mouse.current.y = -999;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    // Shuffle image indices
    const imagePool = Array.from({ length: lipCount }, (_, i) => (i % 7) + 1);
    for (let i = imagePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [imagePool[i], imagePool[j]] = [imagePool[j], imagePool[i]];
    }

    const lips: Lip[] = Array.from({ length: lipCount }, (_, i) => {
      let depth;
      const layer = Math.random();
      if (layer < 0.33) depth = 0.6;
      else if (layer < 0.66) depth = 1;
      else depth = 1.4;

      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.15 * depth,
        vy: (Math.random() - 0.5) * 0.15 * depth,
        depth,
        imageIndex: imagePool[i],
      };
    });
    lipsRef.current = lips;

    // Pre-apply GPU hints to all elements
    if (containerRef.current) {
      Array.from(containerRef.current.children).forEach((child) => {
        const el = child as HTMLElement;
        el.style.willChange = "transform";
        el.style.backfaceVisibility = "hidden";
        (el.style as any).webkitBackfaceVisibility = "hidden";
      });
    }

    // Throttle for Android — skip every other frame
    let frameSkip = 0;

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);

      // On Android skip every other frame for performance
      if (isAndroid) {
        frameSkip++;
        if (frameSkip % 2 !== 0) return;
      }

      const time = Date.now() * 0.001;
      const windAngle = time * ((Math.PI * 2) / 120);
      const windStrength = 0.0025;
      const windX = Math.cos(windAngle) * windStrength;
      const windY = Math.sin(windAngle) * windStrength;

      lips.forEach((lip, i) => {
        // Wind
        lip.vx += windX * lip.depth;
        lip.vy += windY * lip.depth;

        // Random noise — reduced on Android
        const noiseFactor = isAndroid ? 0.005 : 0.008;
        lip.vx += (Math.random() - 0.5) * noiseFactor;
        lip.vy += (Math.random() - 0.5) * noiseFactor;

        // Touch/Mouse repulsion
        const dx = lip.x - mouse.current.x;
        const dy = lip.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0) {
          lip.vx += dx * 0.0005;
          lip.vy += dy * 0.0005;
        }

        // Friction
        lip.vx *= 0.985;
        lip.vy *= 0.985;

        // Position
        lip.x += lip.vx * 16;
        lip.y += lip.vy * 16;

        // Wrap
        if (lip.x > window.innerWidth + 120) lip.x = -120;
        if (lip.x < -120) lip.x = window.innerWidth + 120;
        if (lip.y > window.innerHeight + 120) lip.y = -120;
        if (lip.y < -120) lip.y = window.innerHeight + 120;

        // Apply
        if (containerRef.current) {
          const el = containerRef.current.children[i] as HTMLElement;
          if (!el) return;
          const wobbleX = Math.sin(time * 0.8 + i * 1.3) * (6 * lip.depth);
          const wobbleY = Math.cos(time * 0.6 + i * 1.7) * (6 * lip.depth);
          const rotation = Math.sin(time * 0.7 + i * 1.2) * 15;
          el.style.transform = `translate(${lip.x + wobbleX}px, ${lip.y + wobbleY}px) scale(${lip.depth}) rotate(${rotation}deg)`;
          el.style.opacity = `${0.3 + lip.depth * 0.7}`;
          el.style.filter = `none`;
        }
      });
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isAndroid = typeof window !== "undefined" && /Android/i.test(navigator.userAgent);
  const lipCount = isAndroid ? 7 : 12;
  const staticShuffle = [1, 5, 3, 7, 2, 6, 4, 1, 5, 3, 7, 2];

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {Array.from({ length: lipCount }).map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: "90px",
            height: "90px",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        >
          <Image
            src={`/lips/${staticShuffle[i]}.png`}
            alt="lip"
            width={150}
            height={150}
            className="object-contain w-full h-full"
            style={{}}
          />
        </div>
      ))}
    </div>
  );
});

FloatingLipsComponent.displayName = "FloatingLips";
export default FloatingLipsComponent;