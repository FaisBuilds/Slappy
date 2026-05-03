"use client";

import { useEffect, useState, memo } from "react";
import Image from "next/image";

interface FloatingLip {
  id: number;
  expression: number; // 1-7
  duration: number;
  delay: number;
}

const FloatingLipsComponent = memo(() => {
  const [lips, setLips] = useState<FloatingLip[]>([]);

  useEffect(() => {
    // Generate 6 floating lips with random expressions
    const generatedLips: FloatingLip[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      expression: Math.floor(Math.random() * 7) + 1, // 1-7
      duration: Math.random() * 3 + 5, // 5-8 seconds
      delay: Math.random() * 2, // 0-2 second delay
    }));

    setLips(generatedLips);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {lips.map((lip) => (
        <div
          key={lip.id}
          className="absolute animate-float"
          style={
            {
              "--duration": `${lip.duration}s`,
              "--delay": `${lip.delay}s`,
              animation: `float${lip.id % 3} ${lip.duration}s linear ${lip.delay}s infinite`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.6,
            } as React.CSSProperties
          }
        >
          <Image
            src={`/lips/${lip.expression}.png`}
            alt="lip expression"
            width={80}
            height={80}
            priority={false}
            style={{ pointerEvents: "none" }}
          />
        </div>
      ))}

      <style jsx>{`
        @keyframes float0 {
          0% {
            transform: translateX(-100px) translateY(0) rotate(-15deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateX(calc(100vw + 100px)) translateY(-100px)
              rotate(15deg);
            opacity: 0;
          }
        }

        @keyframes float1 {
          0% {
            transform: translateX(0) translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateX(50px) translateY(-100vh) rotate(-20deg);
            opacity: 0;
          }
        }

        @keyframes float2 {
          0% {
            transform: translateX(100vw) translateY(50vh) rotate(20deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateX(-100px) translateY(100px) rotate(-10deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
});

FloatingLipsComponent.displayName = "FloatingLips";

export default FloatingLipsComponent;