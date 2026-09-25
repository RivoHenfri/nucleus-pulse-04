// WHICH LETTER THE WHEEL GIVES YOU — and why it is not simply random.
//
// It was simply random, and the algorithm was fair: six letters, uniform, and
// a distribution that comes out flat over sixty thousand spins. Rivo still
// kept landing on T, and he was not wrong. Uniform randomness clumps; three T
// in a row is a 1-in-216 event, which sounds rare until you remember how many
// people spin this in a room. Nothing in the old picker remembered that you
// had already been given T, so nothing stopped it handing you T again.
//
// A fair coin is the wrong model here anyway. The point of PULSE 04 is that a
// room meets all six values, not that each spin is independently random. So
// the wheel deals from a shuffled deck instead: every letter comes up once
// before any letter comes up twice. Within a pass the order is still random —
// the participant cannot predict what they will get — but across a pass the
// spread is guaranteed.
//
// The deck lives on the phone, which is the honest scope for this. It fixes
// the one thing people actually experience (the same letter, again, on the
// device in their hand, and on a shared phone at the door it spreads the
// letters across the queue) without a server deciding what anybody gets.
//
// localStorage can throw or come back empty — a private window, cleared site
// data, a locked-down browser. Every path here falls back to a plain random
// letter, because a phone with no storage must still be able to spin.

import { LETTERS } from '../i18n';
import type { Letter } from '../types';

const SEEN_KEY = 'nucleus.pulse04.seen';
/**
 * The last letter dealt, kept separately because it has to outlive the deck.
 *
 * Dealing from a deck stops repeats inside a pass, but says nothing about the
 * seam between two passes: the last card of one deck and the first card of the
 * next can be the same letter, and back-to-back is the one case a person
 * actually notices. So the seam is excluded explicitly.
 */
const LAST_KEY = 'nucleus.pulse04.last';

const isLetter = (v: unknown): v is Letter =>
  typeof v === 'string' && (LETTERS as string[]).includes(v);

/** Letters already dealt in the current pass through the deck. */
const readSeen = (): Letter[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter(isLetter) : [];
  } catch {
    return [];
  }
};

const writeSeen = (seen: Letter[]): void => {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch {
    // No storage means no deck, only a fair coin. Still playable.
  }
};

const readLast = (): Letter | null => {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    return isLetter(raw) ? raw : null;
  } catch {
    return null;
  }
};

const writeLast = (letter: Letter): void => {
  try {
    localStorage.setItem(LAST_KEY, letter);
  } catch {
    // Same as the deck: no storage, no memory, still playable.
  }
};

const randomOf = (pool: readonly Letter[]): Letter =>
  pool[Math.floor(Math.random() * pool.length)];

/**
 * The next letter for this phone.
 *
 * `exclude` is whatever the current run has already played, so a multi-round
 * run never repeats itself even if the deck happens to allow it.
 */
export const nextLetter = (exclude: Letter[] = []): Letter => {
  const stored = readSeen();
  // The deck is emptied here rather than when the sixth letter was dealt. An
  // earlier version reset it on the way out of rememberLetter, and the effect
  // was that the next call saw a full deck and never reached the seam rule
  // below — so the seam repeat it was written to prevent still happened, about
  // one spin in forty-five. Resetting at the point of use keeps "the pass just
  // ended" visible to the only code that needs to know it.
  const exhausted = stored.length >= LETTERS.length;
  if (exhausted) writeSeen([]);
  const seen = exhausted ? [] : stored;
  const last = readLast();

  const pick = (pool: Letter[]) => pool.filter(l => !exclude.includes(l));
  // Fresh pass: every letter is open, so the only thing to rule out is the one
  // that just came up. Mid-pass: the deck already rules it out.
  const fresh = seen.length === 0;
  let open = pick(LETTERS.filter(l => !seen.includes(l) && !(fresh && l === last)));
  // Widen one step at a time rather than ever returning nothing.
  if (!open.length) open = pick(LETTERS.filter(l => !seen.includes(l)));
  if (!open.length) open = pick([...LETTERS]);
  if (!open.length) open = [...LETTERS];
  return randomOf(open);
};

/** Remember that this phone has now been given `letter`. */
export const rememberLetter = (letter: Letter): void => {
  writeLast(letter);
  const seen = readSeen();
  if (seen.includes(letter)) return;
  // Grows to a full six and is cleared by nextLetter, not here — see the note
  // there for why the reset has to happen at the point of use.
  writeSeen([...seen, letter].slice(0, LETTERS.length));
};

/** Testing and the facilitator's "start clean" case. */
export const forgetLetters = (): void => {
  writeSeen([]);
  try {
    localStorage.removeItem(LAST_KEY);
  } catch {
    // nothing to forget
  }
};
