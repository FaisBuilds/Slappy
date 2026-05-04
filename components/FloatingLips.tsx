"use client";
import { useEffect, useRef, memo } from "react";
import Image from "next/image";

interface Lip {
  x: number;
  y: number;
  vx: number;
  vy: number;
  depth: number;
  imageIndex: number; // randomized, not tied to array index
}

const FloatingLipsComponent = memo(() => {
  const lipsRef = useRef<Lip[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Shuffle all 7 image indices across 12 lips so every image appears ~fairly
    const imagePool = Array.from({ length: 12 }, (_, i) => (i % 7) + 1);
    // Fisher-Yates shuffle
    for (let i = imagePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [imagePool[i], imagePool[j]] = [imagePool[j], imagePool[i]];
    }

    const lips: Lip[] = Array.from({ length: 12 }, (_, i) => {
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

    const animate = () => {
      const time = Date.now() * 0.001;

      // Slowly rotating wind — full 360° over ~120 seconds
      // This means lips drift in every direction over time, entering from all edges
      const windAngle = time * (Math.PI * 2 / 120);
      const windStrength = 0.0025;
      const windX = Math.cos(windAngle) * windStrength;
      const windY = Math.sin(windAngle) * windStrength;

      lips.forEach((lip, i) => {
        // WIND (rotating direction)
        lip.vx += windX * lip.depth;
        lip.vy += windY * lip.depth;

        // RANDOM NOISE
        lip.vx += (Math.random() - 0.5) * 0.008;
        lip.vy += (Math.random() - 0.5) * 0.008;

        // MOUSE REPULSION
        const dx = lip.x - mouse.current.x;
        const dy = lip.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          lip.vx += dx * 0.0005;
          lip.vy += dy * 0.0005;
        }

        // FRICTION
        lip.vx *= 0.985;
        lip.vy *= 0.985;

        // POSITION
        lip.x += lip.vx * 16;
        lip.y += lip.vy * 16;

        // WRAP
        if (lip.x > window.innerWidth + 120) lip.x = -120;
        if (lip.x < -120) lip.x = window.innerWidth + 120;
        if (lip.y > window.innerHeight + 120) lip.y = -120;
        if (lip.y < -120) lip.y = window.innerHeight + 120;

        // APPLY
        if (containerRef.current) {
          const el = containerRef.current.children[i] as HTMLElement;
          const wobbleX = Math.sin(time * 0.8 + i * 1.3) * (6 * lip.depth);
          const wobbleY = Math.cos(time * 0.6 + i * 1.7) * (6 * lip.depth);
          const rotation = Math.sin(time * 0.7 + i * 1.2) * 15;
          el.style.transform = `
            translate(${lip.x + wobbleX}px, ${lip.y + wobbleY}px)
            scale(${lip.depth})
            rotate(${rotation}deg)
          `;
          el.style.opacity = `${0.3 + lip.depth * 0.7}`;
          // Reduced blur: was (1.4 - depth) * 4, now * 1.5
          el.style.filter = `blur(${(1.4 - lip.depth) * 1.5}px)`;
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {Array.from({ length: 12 }).map((_, i) => {
        // imageIndex isn't available at render time (set in useEffect),
        // so we pre-shuffle statically for SSR-safe rendering too
        const staticShuffle = [1, 5, 3, 7, 2, 6, 4, 1, 5, 3, 7, 2];
        return (
          <div
            key={i}
            className="absolute"
            style={{ width: "90px", height: "90px", willChange: "transform" }}
          >
            <Image
              src={`/lips/${staticShuffle[i]}.png`}
              alt="lip"
              width={150}
              height={150}
              className="object-contain w-full h-full"
              style={{ filter: "drop-shadow(0 0 25px rgba(255,255,255,0.2))" }}
            />
          </div>
        );
      })}
    </div>
  );
});

FloatingLipsComponent.displayName = "FloatingLips";
export default FloatingLipsComponent;