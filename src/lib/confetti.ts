import confetti from 'canvas-confetti';

export function triggerSuccessConfetti() {
  if (typeof window === 'undefined') return;

  const count = 200;
  const defaults = {
    colors: ['#1E81FE', '#66A9FF', '#111317', '#FFD166', '#FFFFFF'],
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    try {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    } catch {
      // Graceful fallback for non-browser or test environments
    }
  }

  // Double Cannon Burst
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    origin: { x: 0.15, y: 0.75 },
  });

  fire(0.2, {
    spread: 60,
    origin: { x: 0.3, y: 0.75 },
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    origin: { x: 0.5, y: 0.75 },
  });

  fire(0.2, {
    spread: 60,
    origin: { x: 0.7, y: 0.75 },
  });

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    origin: { x: 0.85, y: 0.75 },
  });
}
