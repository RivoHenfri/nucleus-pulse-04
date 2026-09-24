// PULSE BACK — the three calls, handed back.
//
// There is no room in PULSE 04: no facilitator screen, no live aggregate, no
// server. What the playbook allows instead is the participant's own end
// reflection, so that is what this is — the letter the wheel landed on, the
// value it stands for (now that the reveal has named them), and the call they
// made. Quoted, never interpreted. No "you are an Ownership person", no
// pattern, no score.
//
// And one way to share it, by hand: a message into the Pulse's WhatsApp
// thread, the same place PULSE 01 and 02 finished. That is how the facilitator
// hears what the room decided — because people chose to post it, not because
// the app sent it.
//
// The voice says one line here and never reads the list: a voice reading
// someone their own decisions back turns a mirror into a report.

import { motion } from 'motion/react';
import React, { useEffect } from 'react';
import { COPY, VALUE, type Lang } from '../i18n';
import type { Round } from '../types';
import { hush, narrate } from '../utils/narration';
import { buzz, tap } from '../utils/sound';
import { Beat, Continue, Eyebrow, Stage, useBeats } from './atoms';

interface Props {
  lang: Lang;
  rounds: Round[];
  onContinue: () => void;
}

// eyebrow · intro · three rows · note · buttons
const GAPS = [500, 900, 1300, 900, 900, 1300, 900];

export const shareUrl = (): string => {
  try {
    return `${window.location.origin}${window.location.pathname}`;
  } catch {
    return '';
  }
};

const ScenePulseBack: React.FC<Props> = ({ lang, rounds, onContinue }) => {
  const c = COPY[lang].pulseback;
  const bank = COPY[lang].sit.bank;
  const shown = useBeats(GAPS);

  useEffect(() => {
    narrate('pulseback', 900);
    return () => hush();
  }, []);

  const share = () => {
    buzz(14);
    tap();
    const rows = rounds.map(r => `${r.letter} · ${VALUE[r.letter]} — ${bank[r.letter].choices[r.choice]}`);
    const text = c.shareText(rows, shareUrl());
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  return (
    <Stage glow>
      <Beat show={shown >= 1}>
        <Eyebrow>◉ {c.eyebrow}</Eyebrow>
      </Beat>
      <Beat show={shown >= 2} className="mt-5">
        <p className="font-display text-[24px] leading-[1.4] text-[#EDE7DA]">{c.intro}</p>
      </Beat>

      <div className="mt-9 flex flex-col gap-3 text-left">
        {rounds.map((r, k) => (
          <Beat key={r.letter} show={shown >= 3 + k}>
            <div className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-3.5">
              <div
                className="font-display grid h-11 w-11 shrink-0 place-items-center rounded-full border border-sky-200/50 text-[22px] text-sky-50"
                style={{ background: 'radial-gradient(circle at 50% 40%, rgba(56,189,248,0.3), rgba(8,47,73,0.5) 70%)' }}
              >
                {r.letter}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.28em] text-gray-500 uppercase">{VALUE[r.letter]}</p>
                <p className="mt-1 text-[15px] font-semibold leading-snug text-[#EDE7DA]">
                  {bank[r.letter].choices[r.choice]}
                </p>
              </div>
            </div>
          </Beat>
        ))}
      </div>

      <Beat show={shown >= 6} className="mt-7">
        <p className="text-[13px] leading-relaxed text-gray-500">{c.note}</p>
      </Beat>

      <motion.div
        initial={false}
        animate={{ opacity: shown >= 7 ? 1 : 0, y: shown >= 7 ? 0 : 8 }}
        transition={{ duration: 1 }}
        style={{ pointerEvents: shown >= 7 ? 'auto' : 'none' }}
        className="mt-9"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={share}
          className="inline-flex items-center gap-2.5 rounded-full border border-emerald-300/30 px-6 py-3 text-[11px] font-semibold tracking-[0.22em] text-emerald-100/90 hover:border-emerald-200/60"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2c.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
          </svg>
          {c.share}
        </motion.button>
      </motion.div>

      <Continue show={shown >= 7} label={c.cta} onClick={onContinue} />
    </Stage>
  );
};

export default ScenePulseBack;
