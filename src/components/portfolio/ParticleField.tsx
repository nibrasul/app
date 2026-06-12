"use client";

interface Particle {
  id: number;
  left: string;
  top: string;
  size: number;
  animationName: string;
  animationDuration: string;
  animationDelay: string;
  opacity: number;
}

// Deterministic pseudo-random using a seed (pure function, no Math.random)
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

const ANIMATION_NAMES = [
  "particle-float-1",
  "particle-float-2",
  "particle-float-3",
];

// Pre-generate particles at module level — deterministic and pure
const DEFAULT_PARTICLES: Particle[] = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: `${seededRandom(i * 7 + 1) * 100}%`,
  top: `${seededRandom(i * 13 + 2) * 100}%`,
  size: seededRandom(i * 17 + 3) * 3 + 1,
  animationName: ANIMATION_NAMES[i % 3],
  animationDuration: `${seededRandom(i * 23 + 4) * 6 + 4}s`,
  animationDelay: `${seededRandom(i * 31 + 5) * 5}s`,
  opacity: seededRandom(i * 37 + 6) * 0.2 + 0.1,
}));

export default function ParticleField({ count = 40 }: { count?: number }) {
  const particles = DEFAULT_PARTICLES.slice(0, count);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-slate-300"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationName: p.animationName,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
          }}
        />
      ))}
    </div>
  );
}
