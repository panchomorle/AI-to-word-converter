"use client";

import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  speedY: number;
  speedX: number;
  rotationSpeed: number;
}

const colors = [
  "#10b981", // primary teal
  "#34d399",
  "#6ee7b7",
  "#a7f3d0",
  "#ffffff",
  "#3b82f6",
  "#60a5fa",
];

export default function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    // Create confetti pieces
    const initialPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 100; i++) {
      initialPieces.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        speedY: 2 + Math.random() * 3,
        speedX: (Math.random() - 0.5) * 4,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }
    setPieces(initialPieces);

    // Animation loop
    let animationId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16; // normalize to ~60fps
      lastTime = currentTime;

      setPieces((prev) =>
        prev.map((piece) => ({
          ...piece,
          y: piece.y + piece.speedY * deltaTime,
          x: piece.x + piece.speedX * deltaTime,
          rotation: piece.rotation + piece.rotationSpeed * deltaTime,
          speedY: piece.speedY + 0.1 * deltaTime, // gravity
        }))
      );

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: piece.size,
            height: piece.size * 0.6,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: "2px",
            opacity: Math.max(0, 1 - piece.y / 150),
          }}
        />
      ))}
    </div>
  );
}
