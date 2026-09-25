// SPELL — the last screen with a person's hands on it.
//
// PULSE 04 is otherwise a thing that happens *to* you: the wheel decides, you
// choose, the reveal explains. This is the one place the participant writes
// something of their own, and it comes after HUMAN JUDGMENT on purpose — the
// callback has just said the thing at the centre is a person, so the next
// screen asks that person to say it in their own words.
//
// The mechanic is the chain message from the Wizard pulse, kept deliberately:
// you name yourself, you put the value you landed on into a sentence, and you
// hand the wheel to someone by name. That is what keeps the Pulse moving
// through the group after the room has emptied.
//
// Two honesties that are load-bearing:
//   - The @ names are typed by hand and are game tags, not WhatsApp mentions.
//     A wa.me link cannot make WhatsApp notify anyone, and a screen implying
//     otherwise would have people believing they had tagged a colleague who
//     never heard about it. So it says so, plainly.
//   - Nothing here is sent by the app. The text is built on the phone and
//     handed to WhatsApp only when the participant presses the button.
//
// No narration: the voice never reads a participant their own words back.

import { motion } from 'motion/react';
import React, { useState } from 'react';
import { COPY, VALUE, type Lang } from '../i18n';
import type { Round } from '../types';
import { buzz, tap } from '../utils/sound';
import { Beat, Continue, Eyebrow, Stage, beats, useBeats } from './atoms';
import { shareUrl } from './ScenePulseBack';

interface Props {
  lang: Lang;
  rounds: Round[];
  onContinue: () => void;
}

// eyebrow · title · intro · form · buttons
const GAPS = beats(400, 700, 900, 900, 700);

const field =
  'mt-2 w-full rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-3.5 text-[15px] ' +
  'text-[#EDE7DA] placeholder:text-gray-600 outline-none transition-colors duration-300 ' +
  'focus:border-sky-200/40';

const SceneSpell: React.FC<Props> = ({ lang, rounds, onContinue }) => {
  const c = COPY[lang].spell;
  const bank = COPY[lang].sit.bank;
  const shown = useBeats(GAPS);

  const [name, setName] = useState('');
  const [line, setLine] = useState('');
  const [tags, setTags] = useState('');
  const [copied, setCopied] = useState(false);

  // The run is one round, but read it out of the array rather than assuming
  // index 0 exists — a refreshed phone can land here with nothing.
  const round = rounds[rounds.length - 1];
  const letter = round?.letter ?? 'O';
  const value = VALUE[letter];
  const call = round ? bank[letter].choices[round.choice] : '';

  const ready = line.trim().length > 0;

  /** "Satya, Daniel" becomes "@Satya, @Daniel"; empty hands it to the group. */
  const tagList = (): string => {
    const names = tags
      .split(',')
      .map(t => t.trim().replace(/^@+/, ''))
      .filter(Boolean);
    return names.length ? names.map(t => `@${t}`).join(', ') : c.everyone;
  };

  const message = (): string =>
    c.shareText({
      name: name.trim() || c.anon,
      letter,
      value,
      call,
      line: line.trim(),
      tags: tagList(),
      url: shareUrl(),
    });

  const share = () => {
    if (!ready) return;
    buzz(14);
    tap();
    window.open(`https://wa.me/?text=${encodeURIComponent(message())}`, '_blank', 'noopener');
  };

  const copy = async () => {
    if (!ready) return;
    buzz(10);
    tap();
    try {
      await navigator.clipboard.writeText(message());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // An insecure context or a denied permission is not worth an alert here;
      // the WhatsApp button is the real path and it still works.
    }
  };

  return (
    <Stage glow>
      <Beat show={shown >= 1}>
        <Eyebrow>◉ {c.eyebrow}</Eyebrow>
      </Beat>

      <Beat show={shown >= 2} className="mt-5">
        <p className="font-display text-[26px] leading-[1.35] text-[#EDE7DA]">{c.title}</p>
      </Beat>

      <Beat show={shown >= 3} className="mt-3">
        <p className="text-[14px] leading-relaxed text-gray-400">{c.intro(value)}</p>
      </Beat>

      <Beat show={shown >= 4} className="mt-8 text-left">
        <label className="block">
          <span className="text-[10px] font-semibold tracking-[0.28em] text-gray-500 uppercase">
            {c.name}
          </span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={c.namePlaceholder}
            maxLength={40}
            className={field}
          />
        </label>

        <label className="mt-6 block">
          <span className="text-[13px] font-semibold leading-snug text-sky-100/90">
            {c.line(value)}
          </span>
          <textarea
            value={line}
            onChange={e => setLine(e.target.value)}
            placeholder={c.linePlaceholder}
            rows={3}
            maxLength={220}
            className={`${field} resize-none`}
          />
        </label>

        <label className="mt-6 block">
          <span className="text-[10px] font-semibold tracking-[0.28em] text-gray-500 uppercase">
            {c.tags}
          </span>
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder={c.tagsPlaceholder}
            maxLength={120}
            className={field}
          />
        </label>
      </Beat>

      <motion.div
        initial={false}
        animate={{ opacity: shown >= 5 ? 1 : 0, y: shown >= 5 ? 0 : 8 }}
        transition={{ duration: 1 }}
        style={{ pointerEvents: shown >= 5 ? 'auto' : 'none' }}
        className="mt-8 flex flex-col items-center gap-3"
      >
        <motion.button
          whileTap={{ scale: ready ? 0.97 : 1 }}
          onClick={share}
          disabled={!ready}
          className={
            'inline-flex items-center gap-2.5 rounded-full border px-6 py-3 text-[11px] font-semibold tracking-[0.22em] transition-colors duration-300 ' +
            (ready
              ? 'border-emerald-300/30 text-emerald-100/90 hover:border-emerald-200/60'
              : 'border-white/[0.06] text-gray-600')
          }
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2c.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
          </svg>
          {c.share}
        </motion.button>

        <motion.button
          whileTap={{ scale: ready ? 0.97 : 1 }}
          onClick={copy}
          disabled={!ready}
          className={
            'rounded-full border px-6 py-2.5 text-[10px] font-semibold tracking-[0.24em] transition-colors duration-300 ' +
            (ready
              ? 'border-white/15 text-gray-400 hover:border-white/35 hover:text-[#EDE7DA]'
              : 'border-white/[0.06] text-gray-600')
          }
        >
          {copied ? c.copied : c.copy}
        </motion.button>

        <p className="mt-2 text-[11px] leading-relaxed text-gray-600">{ready ? c.note : c.hint}</p>
      </motion.div>

      <Continue show={shown >= 5} label={c.cta} onClick={onContinue} />
    </Stage>
  );
};

export default SceneSpell;
