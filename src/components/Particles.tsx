import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'circle' | 'square' | 'star';
  life: number;
}

interface ConfettiProps {
  active: boolean;
  count?: number;
  onComplete?: () => void;
}

const COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#fb923c', '#2dd4bf'];

export function Confetti({ active, count = 50, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50,
      vx: (Math.random() - 0.5) * 8,
      vy: -(Math.random() * 6 + 4),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 20,
      shape: (['circle', 'square', 'star'] as const)[Math.floor(Math.random() * 3)],
      life: 1,
    }));

    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles(prev => {
        const updated = prev
          .map(p => ({
            ...p,
            x: p.x + p.vx * 0.3,
            y: p.y + p.vy * 0.3,
            vy: p.vy + 0.3,
            rotation: p.rotation + p.rotationSpeed,
            life: p.life - 0.015,
          }))
          .filter(p => p.life > 0);

        if (updated.length === 0) {
          clearInterval(interval);
          onComplete?.();
        }
        return updated;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [active, count, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.shape !== 'star' ? p.color : 'transparent',
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? '2px' : '0',
            transform: `rotate(${p.rotation}deg)`,
            opacity: p.life,
            transition: 'none',
            boxShadow: p.shape === 'circle' ? `0 0 ${p.size}px ${p.color}` : 'none',
          }}
        >
          {p.shape === 'star' && (
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill={p.color}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

interface SparkleProps {
  x: number;
  y: number;
  active: boolean;
}

export function Sparkle({ x, y, active }: SparkleProps) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; angle: number; distance: number; size: number }>>([]);

  useEffect(() => {
    if (!active) return;
    const s = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (i / 8) * Math.PI * 2,
      distance: 0,
      size: Math.random() * 4 + 2,
    }));
    setSparkles(s);

    const timeout = setTimeout(() => setSparkles([]), 600);
    return () => clearTimeout(timeout);
  }, [active]);

  if (!active || sparkles.length === 0) return null;

  return (
    <div className="fixed pointer-events-none z-50" style={{ left: x, top: y }}>
      {sparkles.map(s => (
        <div
          key={s.id}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
          style={{
            transform: `translate(${Math.cos(s.angle) * 30}px, ${Math.sin(s.angle) * 30}px)`,
            animationDuration: '0.6s',
          }}
        />
      ))}
    </div>
  );
}
