// HOW MANY TIMES THIS PHONE MAY PLAY.
//
// PULSE 04 ran once per person, because the wheel deciding your value only
// means something if you cannot reroll it. Then the spell became a chain
// message people reply to in the thread, and coming back to the Pulse became
// part of how it spreads: you answer someone, you play again, you get a
// different letter. Refusing the second play makes the chain stop at one link.
//
// Three is where it stops. Not a number pulled out of the air: the deck in
// spread.ts deals every letter once before repeating, so three plays is three
// different values, and two people who each play three times have covered all
// six of OPTICS between them. It is also the point at which the wheel stops
// feeling like a verdict — a fourth spin is shopping for an answer you like.
//
// The count is per device, in localStorage, where the deck lives too. There is
// no account and nothing is sent anywhere, so this is a nudge rather than an
// enforcement, and it is meant as one. A facilitator who needs the phone reset
// for the next person can do it with ?again on the URL, which is documented in
// the README rather than hidden.
//
// Storage can throw or come back empty in a private window. Every path here
// fails open: a phone that cannot remember gets to play, because a wheel that
// refuses to turn is worse than one that turns once too often.

const PLAYS_KEY = 'nucleus.pulse04.plays';

/** Three plays is three different letters, and never a re-roll of one. */
export const MAX_PLAYS = 3;

export const playsUsed = (): number => {
  try {
    const n = parseInt(localStorage.getItem(PLAYS_KEY) ?? '0', 10);
    return Number.isFinite(n) && n > 0 ? Math.min(n, MAX_PLAYS) : 0;
  } catch {
    return 0;
  }
};

export const playsLeft = (): number => Math.max(0, MAX_PLAYS - playsUsed());

/** Called when the wheel has actually decided something, not when it is opened. */
export const usePlay = (): void => {
  try {
    localStorage.setItem(PLAYS_KEY, String(Math.min(playsUsed() + 1, MAX_PLAYS)));
  } catch {
    // Fail open: a phone that cannot count still gets to play.
  }
};

export const resetPlays = (): void => {
  try {
    localStorage.removeItem(PLAYS_KEY);
  } catch {
    // nothing to reset
  }
};

/**
 * `?again` on the URL hands the phone to the next person: plays reset, and the
 * deck with them, so they do not inherit a half-dealt hand. For the facilitator
 * with one phone at the door, and for testing.
 */
export const consumeResetLink = (): boolean => {
  try {
    if (!new URLSearchParams(window.location.search).has('again')) return false;
    resetPlays();
    return true;
  } catch {
    return false;
  }
};
