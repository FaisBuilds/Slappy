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
  wobbleOffset: number;
}

const FloatingLipsComponent = memo(() => {
  const lipsRef = useRef<Lip[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  // Cache DOM element refs so we never touch .children[] in the loop
  const elRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const lipCount = isAndroid ? 6 : 10;

    // Cache width/height — only update on resize
    let W = window.innerWidth;
    let H = window.innerHeight;
    const onResize = () => { W = window.innerWidth; H = window.innerHeight; };
    window.addEventListener("resize", onResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      mouse.current.x = e.touches[0].clientX;
      mouse.current.y = e.touches[0].clientY;
    };
    const handleTouchEnd = () => {
      mouse.current.x = -9999;
      mouse.current.y = -9999;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    // Cache DOM elements once
    if (containerRef.current) {
      elRefs.current = Array.from(containerRef.current.children) as HTMLElement[];
      elRefs.current.forEach((el) => {
        el.style.willChange = "transform";
        el.style.position = "absolute";
        el.style.setProperty("-webkit-backface-visibility", "hidden");
        el.style.backfaceVisibility = "hidden";
      });
    }

    const staticShuffle = [1, 5, 3, 7, 2, 6, 4, 1, 5, 3];
    const lips: Lip[] = Array.from({ length: lipCount }, (_, i) => {
      const depth = [0.6, 1, 1.4][Math.floor(Math.random() * 3)];
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.15 * depth,
        vy: (Math.random() - 0.5) * 0.15 * depth,
        depth,
        imageIndex: staticShuffle[i],
        wobbleOffset: Math.random() * Math.PI * 2, // unique phase per lip
      };
    });
    lipsRef.current = lips;

    let lastTime = 0;
    let frameSkip = 0;

    const animate = (timestamp: number) => {
      rafRef.current = requestAnimationFrame(animate);

      // Android: skip every other frame
      if (isAndroid) {
        frameSkip++;
        if (frameSkip % 2 !== 0) return;
      }

      const dt = Math.min(timestamp - lastTime, 32); // cap at 32ms (no spiral on tab switch)
      lastTime = timestamp;
      const t = timestamp * 0.001;

      // Wind — compute once outside loop
      const windAngle = t * ((Math.PI * 2) / 120);
      const windX = Math.cos(windAngle) * 0.0025;
      const windY = Math.sin(windAngle) * 0.0025;

      const mx = mouse.current.x;
      const my = mouse.current.y;
      const els = elRefs.current;

      for (let i = 0; i < lips.length; i++) {
        const lip = lips[i];
        const el = els[i];
        if (!el) continue;

        lip.vx += windX * lip.depth;
        lip.vy += windY * lip.depth;

        // Noise
        lip.vx += (Math.random() - 0.5) * 0.006;
        lip.vy += (Math.random() - 0.5) * 0.006;

        // Repulsion — use squared distance, skip sqrt
        const dx = lip.x - mx;
        const dy = lip.y - my;
        const distSq = dx * dx + dy * dy;
        if (distSq < 22500 && distSq > 0) { // 150^2 = 22500
          const factor = 0.0005;
          lip.vx += dx * factor;
          lip.vy += dy * factor;
        }

        // Friction
        lip.vx *= 0.985;
        lip.vy *= 0.985;

        // Position — dt-scaled so it's frame-rate independent
        lip.x += lip.vx * dt;
        lip.y += lip.vy * dt;

        // Wrap
        if (lip.x > W + 120) lip.x = -120;
        else if (lip.x < -120) lip.x = W + 120;
        if (lip.y > H + 120) lip.y = -120;
        else if (lip.y < -120) lip.y = H + 120;

        // Wobble using per-lip offset for variety
        const wobbleX = Math.sin(t * 0.8 + lip.wobbleOffset) * (6 * lip.depth);
        const wobbleY = Math.cos(t * 0.6 + lip.wobbleOffset + 0.5) * (6 * lip.depth);
        const rotation = Math.sin(t * 0.7 + lip.wobbleOffset + 1) * 15;

        // Single string concat — fastest way to set transform
        el.style.transform = `translate(${(lip.x + wobbleX) | 0}px,${(lip.y + wobbleY) | 0}px) scale(${lip.depth}) rotate(${rotation.toFixed(1)}deg)`;
        el.style.opacity = `${(0.3 + lip.depth * 0.7).toFixed(2)}`;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isAndroid = typeof window !== "undefined" && /Android/i.test(navigator.userAgent);
  const lipCount = isAndroid ? 6 : 10;
  const staticShuffle = [1, 5, 3, 7, 2, 6, 4, 1, 5, 3];

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ isolation: "isolate" }}
    >
      {Array.from({ length: lipCount }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: "90px",
            height: "90px",
            top: 0,
            left: 0,
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        >
          <Image
            src={`/lips/${staticShuffle[i]}.png`}
            alt=""
            width={150}
            height={150}
            className="object-contain w-full h-full"
            priority={i < 3}
          />
        </div>
      ))}
    </div>
  );
});

FloatingLipsComponent.displayName = "FloatingLips";
export default FloatingLipsComponent;