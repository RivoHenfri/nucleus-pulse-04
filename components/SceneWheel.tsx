// ONE ROUND — SPIN → SITUATION → CHOOSE → MOVE ON.
//
// The wheel lands, and the screen goes quiet for a moment before anything
// else happens: the bowl is still ringing, and the pause is what lets the
// letter register as the thing that chose the situation.
//
// Then the situation, in at most four lines, and three plausible actions. The
// letter is shown; the value's name is not. Saying "OWNERSHIP" above a
// scenario about ownership tells the participant what the question is about,
// and the reveal at the end depends on them not having been told.
//
// The choice is taken without comment. No "good call", no colour, no score —
// a soft two-note settle, the chosen line holds for a moment, and the wheel
// comes back. The order of the three is shuffled each round so nobody's
// thumb decides for them.

import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useMemo, useState } from 'react';
import { COPY, LETTERS, type Lang } from '../i18n';
import { ROUNDS, type Letter, type Round } from '../types';
import { hush, narrate } from '../utils/narration';
import { buzz, settle, tap } from '../utils/sound';
import { cue } from './atoms';
import OrbitWheel, { type WheelMode } from './OrbitWheel';

interface Props {
  lang: Lang;
  /** Rounds already played, in order. */
  played: Round[];
  /** Spin straight away — the SPIN on the opening screen was the first spin. */
  autoSpin: boolean;
  onChosen: (round: Round) => void;
}

type Phase = 'wheel' | 'situation' | 'chosen';

const wheelSize = (): number => {
  try {
    return Math.min(window.innerWidth - 56, window.innerHeight * 0.52, 360);
  } catch {
    return 320;
  }
};

/** Any letter not yet played. Three spins, three values, never a repeat. */
const pickLetter = (played: Round[]): Letter => {
  const open = LETTERS.filter(l => !played.some(r => r.letter === l));
  return open[Math.floor(Math.random() * open.length)];
};

const shuffled = (): (0 | 1 | 2)[] => {
  const order: (0 | 1 | 2)[] = [0, 1, 2];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

const SceneWheel: React.FC<Props> = ({ lang, played, autoSpin, onChosen }) => {
  const c = COPY[lang];
  const [size] = useState(wheelSize);
  const [mode, setMode] = useState<WheelMode>('idle');
  const [target, setTarget] = useState<Letter | null>(null);
  const [phase, setPhase] = useState<Phase>('wheel');
  const [picked, setPicked] = useState<0 | 1 | 2 | null>(null);
  const order = useMemo(shuffled, []);
  const used = played.map(r => r.letter);

  const spin = () => {
    if (mode !== 'idle') return;
    hush();
    buzz(14);
    tap();
    setTarget(pickLetter(played));
    setMode('spinning');
  };

  useEffect(() => {
    if (autoSpin) {
      const t = setTimeout(spin, 700);
      return () => clearTimeout(t);
    }
    // The second round is the one where the participant spins for the first
    // time on their own. It gets one quiet invitation; the third needs none.
    if (played.length === 1) narrate('wheel', cue(900));
    return () => hush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const landed = () => {
    setMode('landed');
    // Beat 1: the wheel stops, and the screen becomes quiet.
    setTimeout(() => setPhase('situation'), 1700);
  };

  useEffect(() => {
    if (phase !== 'situation' || !target) return;
    narrate(`sit-${target}`, 700);
  }, [phase, target]);

  const choose = (choice: 0 | 1 | 2) => {
    if (picked !== null || !target) return;
    hush();
    buzz(20);
    settle();
    setPicked(choice);
    setPhase('chosen');
    setTimeout(() => onChosen({ letter: target, choice }), 1500);
  };

  const scenario = target ? c.sit.bank[target] : null;

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 py-14 text-center">
      <AnimatePresence mode="wait">
        {phase === 'wheel' ? (
          <motion.div
            key="wheel"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94, y: -12 }}
            transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
            className="w-full"
          >
            <OrbitWheel size={size} mode={mode} target={target} used={used} onLanded={landed} onTap={spin} />

            <motion.div
              animate={{ opacity: mode === 'idle' ? 1 : 0 }}
              transition={{ duration: 0.8 }}
              style={{ pointerEvents: mode === 'idle' ? 'auto' : 'none' }}
              className="mt-10"
            >
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={spin}
                className="rounded-full bg-[#EDE7DA] px-14 py-4 text-[12px] font-bold tracking-[0.3em] text-[#07090C]"
              >
                {c.wheel.cta}
              </motion.button>
              <p className="mt-4 text-[11px] tracking-[0.12em] text-gray-600">{c.wheel.hint}</p>
            </motion.div>
          </motion.div>
        ) : (
          scenario &&
          target && (
            <motion.div
              key="situation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="w-full max-w-md"
            >
              {/* The letter, lit, as it landed. Not the value's name. */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
                className="font-display mx-auto grid h-16 w-16 place-items-center rounded-full border border-sky-200/70 text-[32px] text-sky-50"
                style={{
                  background: 'radial-gradient(circle at 50% 40%, rgba(56,189,248,0.38), rgba(8,47,73,0.55) 70%)',
                  boxShadow: '0 0 30px 6px rgba(56,189,248,0.3)',
                }}
              >
                {target}
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.3, delay: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                className="mt-9 text-[18px] leading-[1.6] text-gray-200"
              >
                {scenario.situation}
              </motion.p>

              <div className="mt-10 flex flex-col gap-3">
                {order.map((idx, k) => {
                  const isPicked = picked === idx;
                  const faded = picked !== null && !isPicked;
                  return (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: faded ? 0.18 : 1, y: 0 }}
                      transition={{
                        duration: picked !== null ? 0.6 : 0.9,
                        delay: picked !== null ? 0 : 1.9 + k * 0.28,
                        ease: [0.22, 0.61, 0.36, 1],
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => choose(idx)}
                      disabled={picked !== null}
                      className={`w-full rounded-2xl border px-5 py-4 text-[12.5px] font-semibold uppercase tracking-[0.2em] transition-colors duration-700 ${
                        isPicked
                          ? 'border-sky-200/60 bg-sky-300/10 text-sky-50'
                          : 'border-white/12 bg-white/[0.02] text-gray-300 hover:border-white/30'
                      }`}
                    >
                      {scenario.choices[idx]}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* Three rounds, three marks. Momentum, not a score. */}
      <div className="absolute bottom-7 left-0 right-0 flex justify-center gap-2.5" aria-hidden>
        {Array.from({ length: ROUNDS }).map((_, k) => (
          <span
            key={k}
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-700 ${
              k < played.length || (k === played.length && phase === 'chosen') ? 'bg-sky-200/70' : 'bg-white/12'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SceneWheel;
