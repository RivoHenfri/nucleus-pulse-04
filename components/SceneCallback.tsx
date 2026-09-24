// THE SEPTEMBER CALLBACK — the only place the four Pulses are named together.
//
//   SIGNAL   What got my attention?
//   TRUTH    What did I trust?
//   ORBIT    Where did I belong?
//   NUCLEUS  What did I decide?
//
// It appears only here, near the end, as the playbook asks: named any earlier
// it would turn the wheel into the last lesson of a course. Then the three
// helpers, and the thing none of them replaces.

import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect } from 'react';
import { COPY, type Lang } from '../i18n';
import { hush, narrate } from '../utils/narration';
import { Hero, Stage, useAutoAdvance, useBeats } from './atoms';

interface Props {
  lang: Lang;
  onContinue: () => void;
}

// four rows · hold · three helpers · the centre · judgment
const GAPS = [700, 900, 900, 900, 3000, 1500, 1500, 2100, 2800];
const at = (n: number) => GAPS.slice(0, n).reduce((a, b) => a + b, 0);

const SceneCallback: React.FC<Props> = ({ lang, onContinue }) => {
  const c = COPY[lang].callback;
  const shown = useBeats(GAPS);

  useEffect(() => {
    narrate('callback-1', at(5));
    narrate('callback-2', at(8));
    narrate('callback-3', at(9));
    return () => hush();
  }, []);

  useAutoAdvance(shown >= GAPS.length, 3400, onContinue);

  return (
    <Stage glow>
      <div className="relative min-h-[340px]">
        <AnimatePresence mode="wait">
          {shown < 5 ? (
            <motion.div
              key="table"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="mx-auto flex max-w-[320px] flex-col gap-5 pt-6 text-left"
            >
              {c.rows.map((row, k) => {
                const current = k === c.rows.length - 1;
                return (
                  <motion.div
                    key={row.pulse}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: shown > k ? 1 : 0, y: shown > k ? 0 : 8 }}
                    transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
                    className="grid grid-cols-[112px_1fr] items-baseline gap-3"
                  >
                    <p
                      className={`whitespace-nowrap text-[11px] font-semibold tracking-[0.26em] ${
                        current ? 'text-sky-100' : 'text-gray-500'
                      }`}
                    >
                      {current ? '◉ ' : ''}
                      {row.pulse}
                    </p>
                    <p className={`font-display text-[20px] leading-snug ${current ? 'text-[#EDE7DA]' : 'text-gray-400'}`}>
                      {row.q}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="judgment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="pt-4"
            >
              {c.helps.map((line, k) => (
                <motion.p
                  key={line}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: shown >= 5 + k ? 1 : 0, y: shown >= 5 + k ? 0 : 8 }}
                  transition={{ duration: 1.1 }}
                  className="mt-1 text-[18px] leading-relaxed text-gray-400"
                >
                  {line}
                </motion.p>
              ))}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: shown >= 8 ? 1 : 0 }}
                transition={{ duration: 1.3 }}
                className="mt-8 text-[17px] leading-relaxed text-gray-300"
              >
                {c.center}
              </motion.p>
              <Hero show={shown >= 9} className="mt-10 text-[26px] text-sky-50">
                {c.judgment}
              </Hero>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Stage>
  );
};

export default SceneCallback;
