// The orbit, come back as a helix.
//
// Two strands wound around the Nucleus in a closed ring, crossing each other
// fourteen times, with rungs where they are furthest apart. It is drawn, not
// faded in, and once drawn it turns — one lap every ninety seconds.
//
// A metaphor, and it is kept quiet so it reads as one: no labels, no base
// pairs, no colour-coding. Company culture is not literal biology, and a
// diagram that looked like a textbook DNA figure would say that it was.

import { motion } from 'motion/react';
import React from 'react';

interface Props {
  size: number;
  show: boolean;
}

const PERIODS = 14;
const STEPS = 420;

const strand = (c: number, r: number, a: number, sign: 1 | -1): string => {
  let d = '';
  for (let k = 0; k <= STEPS; k++) {
    const t = (k / STEPS) * Math.PI * 2;
    const rr = r + sign * a * Math.sin(PERIODS * t);
    const x = c + Math.cos(t) * rr;
    const y = c + Math.sin(t) * rr;
    d += `${k === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return d;
};

const Helix: React.FC<Props> = ({ size, show }) => {
  const c = size / 2;
  const r = size * 0.36;
  const a = size * 0.038;
  const rungs = Array.from({ length: PERIODS * 2 }, (_, k) => {
    const t = ((k + 0.5) * Math.PI) / PERIODS;
    const s = Math.sin(PERIODS * t);
    return {
      x1: c + Math.cos(t) * (r + a * s * 0.8),
      y1: c + Math.sin(t) * (r + a * s * 0.8),
      x2: c + Math.cos(t) * (r - a * s * 0.8),
      y2: c + Math.sin(t) * (r - a * s * 0.8),
    };
  });

  return (
    <motion.svg
      aria-hidden
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="pointer-events-none absolute inset-0"
      initial={false}
      animate={show ? { opacity: 1, rotate: 360 } : { opacity: 0, rotate: 0 }}
      transition={
        show
          ? { opacity: { duration: 1.2 }, rotate: { duration: 90, repeat: Infinity, ease: 'linear' } }
          : { duration: 0.4 }
      }
    >
      {([1, -1] as const).map(sign => (
        <motion.path
          key={sign}
          d={strand(c, r, a, sign)}
          fill="none"
          stroke={sign === 1 ? 'rgba(186,230,253,0.55)' : 'rgba(125,211,252,0.32)'}
          strokeWidth={1.2}
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: show ? 1 : 0 }}
          transition={{ duration: 3.4, ease: [0.45, 0, 0.25, 1], delay: sign === 1 ? 0 : 0.35 }}
        />
      ))}
      {rungs.map((l, k) => (
        <motion.line
          key={k}
          {...l}
          stroke="rgba(224,242,254,0.22)"
          strokeWidth={1}
          initial={false}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ duration: 0.8, delay: show ? 1.2 + (k / rungs.length) * 2.2 : 0 }}
        />
      ))}
    </motion.svg>
  );
};

export default Helix;
