// REVEAL — the playbook's eight beats.
//
//   1  The wheel stops. The screen becomes quiet.
//   2  O · P · T · I · C · S move inward, into the Nucleus.
//   3  You made the decisions. The situations changed.
//      But what guided the decisions?
//   4  The letters open into their words.
//   5  These aren't answers. They're values.
//   6  Values don't make decisions for us. They shape how we make them.
//   7  The orbit returns as a helix around the Nucleus.
//   8  Repeated choices become behavior. Behavior becomes culture.
//
// The top half of the screen is the Nucleus and never moves; the words
// below it replace each other rather than stacking, so the whole reveal
// happens without a scroll. It carries itself on once the voice has said
// the last line — a statement screen does not need a button.

import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { COPY, LETTERS, VALUE, type Lang } from '../i18n';
import { hush, narrate } from '../utils/narration';
import { gather } from '../utils/sound';
import { useAutoAdvance, useBeats } from './atoms';
import Helix from './Helix';
import OrbitWheel from './OrbitWheel';

interface Props {
  lang: Lang;
  onContinue: () => void;
}

// quiet · collapse · made/changed · guided · the six words · values · shape · helix + culture
// Written at the length the voice needs, not scaled by PACE: the lines here
// are longer than anywhere else in the Pulse and they are the point of it.
const GAPS = [1600, 3300, 4300, 3900, 5400, 4200, 5600];
const at = (n: number) => GAPS.slice(0, n).reduce((a, b) => a + b, 0);

const size = (): number => {
  try {
    return Math.min(window.innerWidth - 64, window.innerHeight * 0.42, 320);
  } catch {
    return 280;
  }
};

const Caption: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <motion.div
    key={id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 1.2, ease: [0.22, 0.61, 0.36, 1] }}
    className="absolute inset-x-0 top-0"
  >
    {children}
  </motion.div>
);

const SceneReveal: React.FC<Props> = ({ lang, onContinue }) => {
  const c = COPY[lang].reveal;
  const shown = useBeats(GAPS);
  const [box] = useState(size);

  useEffect(() => {
    narrate('reveal-1', at(2));
    narrate('reveal-2', at(3));
    narrate('reveal-3', at(5));
    narrate('reveal-4', at(6));
    narrate('reveal-5', at(7) + 400);
    return () => hush();
  }, []);

  useEffect(() => {
    if (shown === 1) gather();
  }, [shown]);

  useAutoAdvance(shown >= GAPS.length, 5500, onContinue);

  const line = 'font-display text-[23px] leading-[1.45] text-[#EDE7DA]';

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative mx-auto" style={{ width: box, height: box }}>
        <OrbitWheel size={box} mode={shown >= 1 ? 'collapse' : 'landed'} />
        <Helix size={box} show={shown >= 7} />
      </div>

      <div className="relative mt-10 h-[190px] w-full max-w-md">
        <AnimatePresence mode="wait">
          {shown >= 2 && shown < 3 && (
            <Caption key="made" id="made">
              <p className={line}>{c.made}</p>
              <p className={`${line} mt-1 text-[#EDE7DA]/70`}>{c.changed}</p>
            </Caption>
          )}
          {shown >= 3 && shown < 4 && (
            <Caption key="guided" id="guided">
              <p className={`${line} text-[26px]`}>{c.guided}</p>
            </Caption>
          )}
          {shown >= 4 && shown < 5 && (
            <Caption key="words" id="words">
              <div className="mx-auto grid max-w-[320px] grid-cols-2 gap-x-6 gap-y-3 text-left">
                {LETTERS.map((l, i) => (
                  <motion.p
                    key={l}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.9, delay: i * 0.22 }}
                    className="text-[14px] tracking-[0.06em] text-gray-300"
                  >
                    <span className="font-display mr-2 text-[20px] text-sky-100">{l}</span>
                    {VALUE[l]}
                  </motion.p>
                ))}
              </div>
            </Caption>
          )}
          {shown >= 5 && shown < 6 && (
            <Caption key="values" id="values">
              <p className={line}>{c.values}</p>
            </Caption>
          )}
          {shown >= 6 && shown < 7 && (
            <Caption key="shape" id="shape">
              <p className="text-[18px] leading-relaxed text-gray-300">{c.shape[0]}</p>
              <p className={`${line} mt-2`}>{c.shape[1]}</p>
            </Caption>
          )}
          {shown >= 7 && (
            <Caption key="culture" id="culture">
              <p className="text-[18px] leading-relaxed text-gray-300">{c.culture[0]}</p>
              <p className={`${line} mt-2`}>{c.culture[1]}</p>
            </Caption>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SceneReveal;
