// OPENING — locked direction.
//
//   ◉ NUCLEUS
//   Welcome to the NUCLEUS Wheel.
//   O · P · T · I · C · S
//   Our values.
//   Things move.
//   Context changes.
//   Decisions still happen.
//   SPIN
//
// The mark ignites exactly as it did in PULSE 02, so the four September
// Pulses open the same way. Then a language — the tap that buys the right to
// play sound on a phone — then the welcome: the wheel, its six letters, and
// what they are, so nobody meets it cold. The six names are still held back
// for the reveal. Then the three locked lines and one button; SPIN here is
// the spin, and the wheel is already turning when it appears.

import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { COPY, LANGUAGES, LETTERS, type Lang } from '../i18n';
import { hush, narrate, setNarrationLang, unlockAudio, whenQuiet } from '../utils/narration';
import { buzz, unlockWebAudio } from '../utils/sound';
import { Beat, Continue, Stage, beats, cue, useBeats } from './atoms';
import NucleusLogo from './NucleusLogo';

interface Props {
  lang: Lang;
  onChooseLang: (lang: Lang) => void;
  onSpin: () => void;
}

/** The mark takes this long to light before anything is asked of anyone. */
const IGNITION_MS = cue(4200);

// welcome · letters · our values · line · line · line · button
const GAPS = beats(1100, 1700, 2200, 3000, 2000, 2000, 2000);

const SceneEnter: React.FC<Props> = ({ lang, onChooseLang, onSpin }) => {
  const c = COPY[lang].enter;
  const [lit, setLit] = useState(false);
  const [started, setStarted] = useState(false);
  const shown = useBeats(started ? GAPS : []);

  useEffect(() => {
    const t = setTimeout(() => setLit(true), IGNITION_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => () => hush(), []);

  const choose = (next: Lang) => {
    // One gesture, three unlocks: the audio element, the Web Audio context,
    // and the run itself.
    unlockAudio();
    unlockWebAudio();
    buzz(18);
    onChooseLang(next);
    setNarrationLang(next);
    setStarted(true);
    narrate('welcome', cue(1100));
    narrate('enter-1', cue(8000));
    narrate('enter-2', cue(10000));
    narrate('enter-3', cue(12000));
  };

  /** The button waits for the last line to finish being spoken. */
  const [spoken, setSpoken] = useState(false);
  useEffect(() => {
    if (shown < GAPS.length - 1) return;
    let gone = false;
    whenQuiet(() => !gone && setSpoken(true));
    return () => {
      gone = true;
    };
  }, [shown]);

  return (
    <Stage glow>
      <NucleusLogo size={started ? 150 : 220} ignite={!started} delay={0} />

      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="pick"
            initial={{ opacity: 0 }}
            animate={{ opacity: lit ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            className="mt-10"
          >
            <p className="text-[10px] font-semibold tracking-[0.34em] text-gray-500">{c.brand}</p>
            <p className="font-display mt-2 text-[13px] tracking-[0.26em] text-gray-400">{c.pulse}</p>

            <p className="mb-4 mt-8 px-6 text-[12px] leading-relaxed text-gray-600">
              {COPY[lang].common.soundHint}
            </p>

            <div className="flex flex-col items-center gap-3">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => choose(l.code)}
                  disabled={!lit}
                  className="w-56 rounded-full border border-white/12 py-3.5 text-[12px] tracking-[0.24em] text-gray-400 transition-colors duration-500 hover:border-white/35 hover:text-[#EDE7DA]"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="lines"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="mt-10"
          >
            {/* The welcome, and OPTICS introduced as the letters will sit on the wheel. */}
            <Beat show={shown >= 1}>
              <p className="font-display text-[24px] leading-[1.35] text-[#EDE7DA]">{c.welcome}</p>
            </Beat>
            <Beat show={shown >= 2} className="mt-5">
              <p className="text-[17px] font-semibold tracking-[0.5em] text-sky-100/90">
                {LETTERS.join(' · ')}
              </p>
            </Beat>
            <Beat show={shown >= 3} className="mt-3">
              <p className="text-[14px] tracking-[0.14em] text-gray-400">{c.values}</p>
            </Beat>

            <Beat show={shown >= 4} className="mt-9">
              <p className="font-display text-[21px] leading-[1.4] text-[#EDE7DA]">{c.lines[0]}</p>
            </Beat>
            <Beat show={shown >= 5}>
              <p className="font-display text-[21px] leading-[1.4] text-[#EDE7DA]/85">{c.lines[1]}</p>
            </Beat>
            <Beat show={shown >= 6}>
              <p className="font-display text-[21px] leading-[1.4] text-[#EDE7DA]/70">{c.lines[2]}</p>
            </Beat>

            <Continue show={shown >= GAPS.length && spoken} label={c.cta} onClick={onSpin} tone="solid" />
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  );
};

export default SceneEnter;
