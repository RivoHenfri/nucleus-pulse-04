// PULSE 04 — NUCLEUS
//
// SPIN → SITUATION → CHOOSE → MOVE ON → REVEAL
//
// One spin per person. The wheel decides which situation arrives; the
// participant decides what to do about it, and sends that to the thread.
// Nothing here is scored, and nothing about a choice is ever marked right or wrong.

export type Letter = 'O' | 'P' | 'T' | 'I' | 'C' | 'S';

/** One round, as it is remembered: where the wheel landed and what was chosen.
 *  `choice` is the index into the playbook's order, not the shuffled order the
 *  buttons happened to appear in. */
export interface Round {
  letter: Letter;
  choice: 0 | 1 | 2;
}

export type SceneId = 'enter' | 'wheel' | 'reveal' | 'pulseback' | 'callback' | 'spell' | 'final';

/** What the participant writes on the last screen, to pass the wheel on.
 *  It never leaves the phone unless they press send themselves. */
export interface Spell {
  name: string;
  line: string;
  /** Names typed by hand. These are game tags, not WhatsApp mentions. */
  tags: string;
}

export const ROUNDS = 1;
