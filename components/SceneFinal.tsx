// FINAL SCREEN — locked.
//
//   ◉ NUCLEUS
//   Find what matters.
//   Decide what moves.
//   O · P · T · I · C · S
//   Our values. Our culture.
//
// Then the loop. PULSE 04 runs on a shared phone or a screen at the door as
// easily as on someone's own, so it does not end on a dead page: after a long
// hold it goes back to the opening by itself, ready for the next person, and
// a quiet hairline shows that it is about to. SPIN AGAIN does the same thing
// straight away.

import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { COPY, LETTERS, type Lang } from '../i18n';
import { hush, narrate, whenQuiet } from '../utils/narration';
import { playsLeft } from '../utils/plays';
import { Beat, Continue, Stage, useBeats } from './atoms';
import NucleusLogo from './NucleusLogo';

interface Props {
  lang: Lang;
  onLoop: () => void;
}

// mark · find · decide · letters · ours
const GAPS = [300, 3400, 1500, 1900, 1700];

/** How long the finished screen stands before the Pulse starts over. */
export const LOOP_MS = 22000;

const SceneFinal: React.FC<Props> = ({ lang, onLoop }) => {
  const c = COPY[lang].final;
  const shown = useBeats(GAPS);
  const [counting, setCounting] = useState(false);
  /**
   * Read once, on arrival. Three turns per phone, and the third one ends here
   * rather than rolling back to the opening: a wheel you can keep spinning
   * stops being a wheel that decided anything.
   */
  const [left] = useState(playsLeft);
  const spent = left <= 0;

  useEffect(() => {
    narrate('final-1', 3700);
    narrate('final-2', 7200);
    return () => hush();
  }, []);

  useEffect(() => {
    if (shown < GAPS.length) return;
    let gone = false;
    whenQuiet(() => !gone && setCounting(true));
    return () => {
      gone = true;
    };
  }, [shown]);

  useEffect(() => {
    // A spent phone stays on this screen. The auto-loop exists so a shared
    // phone is ready for the next person; looping someone back to an opening
    // they can no longer act on would only be an invitation to nothing.
    if (!counting || spent) return;
    const t = setTimeout(onLoop, LOOP_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counting, spent]);

  return (
    <Stage glow>
      <NucleusLogo size={180} ignite delay={0.2} />

      <Beat show={shown >= 2} className="mt-10">
        <p className="font-display text-[27px] leading-[1.35] text-[#EDE7DA]">{c.lines[0]}</p>
      </Beat>
      <Beat show={shown >= 3} className="mt-1">
        <p className="font-display text-[27px] leading-[1.35] text-[#EDE7DA]">{c.lines[1]}</p>
      </Beat>

      <Beat show={shown >= 4} className="mt-10">
        <p className="text-[15px] font-semibold tracking-[0.5em] text-sky-100/90">
          {LETTERS.join(' · ')}
        </p>
      </Beat>
      <Beat show={shown >= 5} className="mt-4">
        <p className="text-[14px] tracking-[0.12em] text-gray-400">{c.ours}</p>
      </Beat>

      {spent ? (
        <Beat show={counting} className="mt-12">
          <p className="mx-auto max-w-xs text-[13px] leading-relaxed text-gray-500">{c.spent}</p>
        </Beat>
      ) : (
        <Continue show={counting} label={c.againLeft(left)} onClick={onLoop} />
      )}

      <motion.div
        initial={false}
        animate={{ opacity: counting && !spent ? 1 : 0 }}
        transition={{ duration: 1.5, delay: 2 }}
        className="mx-auto mt-8 w-60"
      >
        <p className="text-[10px] tracking-[0.2em] text-gray-600">{c.looping}</p>
        <div className="mt-2 h-px w-full overflow-hidden bg-white/[0.06]">
          <motion.div
            className="h-full bg-sky-200/40"
            initial={{ width: '0%' }}
            animate={{ width: counting && !spent ? '100%' : '0%' }}
            transition={{ duration: counting ? LOOP_MS / 1000 : 0, ease: 'linear' }}
          />
        </div>
      </motion.div>
    </Stage>
  );
};

export default SceneFinal;
