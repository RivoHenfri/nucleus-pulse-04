// THE WHEEL — the Nucleus at the centre, O · P · T · I · C · S in orbit.
//
// Taken from the Nucleus Wizard's layout (a nucleus with its particles
// circling it) and rebuilt as a wheel: the orbit is the thing that spins, and
// a small mark at the top is where it stops. The letters stay upright while
// the ring turns under them, the way a planet does not tumble on its orbit.
//
// The spin is four movements, because that is what makes it feel physical
// rather than animated:
//
//   1. a small wind-up backwards — the hand drawing back,
//   2. acceleration into the turn,
//   3. a long deceleration, which is most of the spin and the part people
//      watch,
//   4. a spring onto the letter — the snap.
//
// The wheel picks nothing. The letter is chosen before the spin starts (from
// the letters not yet used, so three spins are always three values) and the
// spin is solved backwards to land on it. Randomness decides which situation
// arrives; the design stays intentional.
//
// Between rounds the ring's angle is kept at module level, so the next round
// starts from where this one stopped instead of jumping home.

import { animate, motion, useAnimationFrame, useMotionValue, useTransform } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';
import { LETTERS } from '../i18n';
import type { Letter } from '../types';
import { LETTER_NOTE, bowl, buzz, pluck, setAir, startAir, stopAir } from '../utils/sound';
import NucleusLogo from './NucleusLogo';

let keptAngle = 0;

/** Idle drift, degrees per second. One lap a minute — about a breath's pace per letter. */
const DRIFT = 6;

const reducedMotion = (): boolean => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

/** Which letter sits under the pointer at this angle. Letter i starts at i·60° clockwise from the top. */
const atPointer = (angle: number): number => {
  const k = Math.round(-angle / 60) % 6;
  return (k + 6) % 6;
};

export type WheelMode = 'idle' | 'spinning' | 'landed' | 'collapse';

interface Props {
  size: number;
  mode: WheelMode;
  /** The letter to land on. Set it and switch mode to 'spinning'. */
  target?: Letter | null;
  /** Letters already played, drawn quieter. */
  used?: Letter[];
  onLanded?: () => void;
  onTap?: () => void;
}

const OrbitWheel: React.FC<Props> = ({ size, mode, target, used = [], onLanded, onTap }) => {
  const angle = useMotionValue(keptAngle);
  const upright = useTransform(angle, a => -a);
  const lastIndex = useRef(atPointer(keptAngle));
  const spinning = useRef(false);
  /** The pointer, knocked sideways by each letter going past — the flapper on a real wheel. */
  const flick = useMotionValue(0);
  /** The whole wheel, for the small shudder when it comes to rest. */
  const shake = useMotionValue(0);
  const [landedOn, setLandedOn] = useState<Letter | null>(mode === 'landed' ? target ?? null : null);

  const radius = size * 0.4;
  const particle = Math.round(size * 0.16);
  const logo = Math.round(size * 0.5);

  // Remember where the ring is, whatever happens to this component.
  useEffect(() => angle.on('change', a => (keptAngle = a)), [angle]);

  // The drift: always moving, never going anywhere.
  useAnimationFrame((_, delta) => {
    if (mode !== 'idle' || spinning.current) return;
    angle.set(angle.get() + (DRIFT * delta) / 1000);
    lastIndex.current = atPointer(angle.get());
  });

  // A note each time a letter passes the pointer, and air that follows the speed.
  useEffect(
    () =>
      angle.on('change', a => {
        if (!spinning.current) return;
        const k = atPointer(a);
        if (k !== lastIndex.current) {
          lastIndex.current = k;
          const speed = Math.min(1, Math.abs(angle.getVelocity()) / 900);
          // Quieter when fast, so a run of notes never piles up into noise.
          pluck(LETTER_NOTE[k], 0.02 + (1 - speed) * 0.03);
          // Felt as well as heard: a light tick while it flies, a firmer one
          // for each letter as it slows, so the settle is in the hand too.
          buzz(speed > 0.7 ? 8 : speed > 0.35 ? 14 : 24);
          animate(flick, [-(9 + (1 - speed) * 17), 0], {
            duration: 0.12 + (1 - speed) * 0.22,
            ease: [0.2, 0.8, 0.3, 1],
          });
        }
        setAir(Math.abs(angle.getVelocity()) / 900);
      }),
    [angle],
  );

  useEffect(() => {
    if (mode !== 'spinning' || !target) return;
    let stopped = false;
    const i = LETTERS.indexOf(target);
    const from = angle.get();
    const quick = reducedMotion();
    const turns = quick ? 1 : 3 + Math.floor(Math.random() * 2);
    // Solve for the resting angle: at least `turns` laps on, and congruent to
    // the angle that puts letter i under the pointer.
    let to = from + turns * 360;
    to += (((-i * 60 - to) % 360) + 360) % 360;

    spinning.current = true;
    setLandedOn(null);
    startAir();

    const run = async () => {
      if (!quick) {
        buzz(24);
        await animate(angle, from - 14, { duration: 0.42, ease: [0.3, 0, 0.4, 1] });
        if (stopped) return;
      }
      // Gentle acceleration, then a long, long settle. Overshoots by a few
      // degrees so the spring has something to pull back.
      await animate(angle, to + 5, {
        duration: quick ? 1.4 : 5.2,
        ease: [0.42, 0, 0.1, 1],
      });
      if (stopped) return;
      await animate(angle, to, { type: 'spring', stiffness: 170, damping: 11, mass: 0.9 });
      if (stopped) return;
      spinning.current = false;
      stopAir();
      bowl(LETTER_NOTE[i] / 2);
      // Coming to rest: one firm bump, then two fading after-shakes.
      buzz([30, 70, 16, 110, 10]);
      animate(shake, [0, -4, 4, -2.5, 1.5, -0.5, 0], { duration: 0.6, ease: 'easeOut' });
      setLandedOn(target);
      onLanded?.();
    };
    void run();
    return () => {
      stopped = true;
      spinning.current = false;
      stopAir();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, target]);

  const collapse = mode === 'collapse';

  return (
    <motion.div
      className="relative mx-auto select-none"
      style={{ width: size, height: size, x: shake }}
      onClick={() => mode === 'idle' && onTap?.()}
      role={mode === 'idle' ? 'button' : undefined}
      aria-label={mode === 'idle' ? 'Spin' : undefined}
    >
      {/* A slow breath of light behind everything, on the calm bed's clock. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[-12%] rounded-full animate-breathe"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.10), transparent 62%)' }}
      />

      {/* Dust on a wider orbit, turning the other way. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-orbitDrift"
        animate={{ opacity: collapse ? 0 : 1 }}
        transition={{ duration: 2 }}
      >
        {Array.from({ length: 18 }).map((_, k) => {
          const a = (k / 18) * Math.PI * 2;
          const r = radius * (k % 3 === 0 ? 1.2 : 1.13);
          return (
            <span
              key={k}
              className="absolute rounded-full bg-sky-200"
              style={{
                width: k % 4 === 0 ? 3 : 2,
                height: k % 4 === 0 ? 3 : 2,
                left: size / 2 + Math.cos(a) * r,
                top: size / 2 + Math.sin(a) * r,
                opacity: k % 4 === 0 ? 0.35 : 0.16,
              }}
            />
          );
        })}
      </motion.div>

      {/* The orbit itself. */}
      <motion.svg
        aria-hidden
        className="pointer-events-none absolute inset-0"
        viewBox={`0 0 ${size} ${size}`}
        animate={{ opacity: collapse ? 0 : 1, scale: collapse ? 0.4 : 1 }}
        transition={{ duration: 2.2, ease: [0.6, 0, 0.3, 1] }}
      >
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(125,211,252,0.14)" strokeWidth={1} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + particle * 0.62}
          fill="none"
          stroke="rgba(125,211,252,0.06)"
          strokeWidth={1}
          strokeDasharray="2 7"
        />
      </motion.svg>

      {/* The Nucleus. */}
      <motion.div
        className="absolute"
        style={{ left: (size - logo) / 2, top: (size - logo) / 2 }}
        animate={collapse ? { scale: [1, 1, 1.12, 1.04], filter: ['brightness(1)', 'brightness(1)', 'brightness(1.5)', 'brightness(1.1)'] } : { scale: 1 }}
        transition={collapse ? { duration: 3.2, times: [0, 0.45, 0.7, 1] } : { duration: 0.6 }}
      >
        <NucleusLogo size={logo} ignite={false} breathe />
      </motion.div>

      {/* The pointer. Small, still, and the only fixed thing on the wheel. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2"
        style={{
          top: size / 2 - radius - particle / 2 - 16,
          x: '-50%',
          rotate: flick,
          transformOrigin: '50% 0%',
        }}
        animate={{ opacity: collapse ? 0 : 1 }}
      >
        <svg width="14" height="10" viewBox="0 0 14 10">
          <path d="M1 1 L7 9 L13 1" fill="none" stroke="#E0F2FE" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>

      {/* The ring of letters. */}
      <motion.div className="absolute inset-0" style={{ rotate: angle }}>
        {LETTERS.map((letter, i) => {
          const a = ((i * 60 - 90) * Math.PI) / 180;
          const x = Math.cos(a) * radius;
          const y = Math.sin(a) * radius;
          const isLanded = landedOn === letter;
          const isUsed = used.includes(letter) && !isLanded;
          const dimmed = landedOn !== null && !isLanded;
          return (
            <motion.div
              key={letter}
              className="absolute"
              style={{ left: size / 2 - particle / 2, top: size / 2 - particle / 2, width: particle, height: particle }}
              initial={false}
              animate={
                collapse
                  ? { x: 0, y: 0, scale: 0.2, opacity: 0 }
                  : { x, y, scale: isLanded ? 1.22 : 1, opacity: dimmed ? 0.28 : isUsed ? 0.4 : 1 }
              }
              transition={
                collapse
                  ? { duration: 2.1, delay: 0.25 + i * 0.16, ease: [0.55, 0, 0.35, 1] }
                  : { duration: isLanded ? 0.9 : 1.2, ease: [0.22, 0.61, 0.36, 1] }
              }
            >
              <motion.div
                className="grid h-full w-full place-items-center rounded-full border font-display"
                style={{
                  rotate: upright,
                  fontSize: particle * 0.52,
                  color: isLanded ? '#F0F9FF' : '#EDE7DA',
                  borderColor: isLanded ? 'rgba(186,230,253,0.85)' : 'rgba(125,211,252,0.28)',
                  background: isLanded
                    ? 'radial-gradient(circle at 50% 40%, rgba(56,189,248,0.38), rgba(8,47,73,0.55) 70%)'
                    : 'radial-gradient(circle at 50% 40%, rgba(56,189,248,0.16), rgba(6,8,11,0.85) 72%)',
                  boxShadow: isLanded
                    ? '0 0 28px 6px rgba(56,189,248,0.35), inset 0 0 12px rgba(186,230,253,0.25)'
                    : '0 0 14px 1px rgba(56,189,248,0.14)',
                }}
              >
                {letter}
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default OrbitWheel;
