// THE ROOM — the one thing that leaves the phone.
//
// A facilitator opens a room and puts a link with `?room=RRX7` on it up on the
// screen as a QR code. When a participant makes their call, the phone posts
// the letter the wheel landed on and which of the three choices was made —
// and that is all. No name, no email, no device id.
//
// Nothing here is allowed to affect the experience. No room, no network, no
// server: the run is exactly the same run, and the submission quietly does
// not happen.

import type { Letter } from '../types';

/**
 * Where the room lives: PULSE 01's hostname and certificate, under /p4, next
 * to PULSE 02's /p2. Caddy strips the prefix, so the server knows nothing
 * about the path it is reached by. Overridable at build time for a laptop
 * running `bun server/index.ts`.
 */
export const ROOM_API =
  (import.meta as unknown as { env?: { VITE_ROOM_API?: string } }).env?.VITE_ROOM_API ??
  'https://nucleus-api.rivohenfri.cloud/p4';

/** Its own key: a leftover PULSE 02 room code must never post into PULSE 04. */
const KEY = 'nucleus.room04';

/** The room this phone is in, if any — the URL first, then storage. */
export const roomCode = (): string | null => {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('room');
    if (fromUrl && /^[A-Za-z0-9]{4,8}$/.test(fromUrl)) {
      const code = fromUrl.toUpperCase();
      localStorage.setItem(KEY, code);
      return code;
    }
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

/** Tell the room this phone has arrived. Once per room per device. */
export const joinRoom = (): void => {
  const room = roomCode();
  if (!room) return;
  try {
    if (localStorage.getItem(`${KEY}.joined`) === room) return;
    localStorage.setItem(`${KEY}.joined`, room);
    void fetch(`${ROOM_API}/rooms/${encodeURIComponent(room)}/join`, { method: 'POST', keepalive: true });
  } catch {
    // never the participant's problem
  }
};

/** Post one call to the room. Never throws, never blocks. */
export const submitToRoom = async (r: { lang: 'en' | 'id'; letter: Letter; choice: 0 | 1 | 2 }): Promise<boolean> => {
  const room = roomCode();
  if (!room) return false;
  try {
    const res = await fetch(`${ROOM_API}/responses`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ room, ...r }),
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
};

export interface RoomSummary {
  code: string;
  title: string | null;
  n: number;
  joined: number;
  /** Where the wheel landed, per letter. */
  letters: Record<Letter, number>;
  /** Per letter, how many took each of the three choices (playbook order). */
  choices: Record<Letter, [number, number, number]>;
  langs: Record<string, number>;
}

/** The facilitator's view. Needs the key that came back when the room opened. */
export const fetchSummary = async (code: string, key: string): Promise<RoomSummary | null> => {
  try {
    const res = await fetch(`${ROOM_API}/rooms/${encodeURIComponent(code)}/summary`, {
      headers: { 'x-facilitator-key': key },
    });
    return res.ok ? ((await res.json()) as RoomSummary) : null;
  } catch {
    return null;
  }
};

export const openRoom = async (title?: string): Promise<{ code: string; key: string } | null> => {
  try {
    const res = await fetch(`${ROOM_API}/rooms`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    return res.ok ? ((await res.json()) as { code: string; key: string }) : null;
  } catch {
    return null;
  }
};
