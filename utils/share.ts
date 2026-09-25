// Where a shared message points people back to.
//
// The link has to survive being pasted into WhatsApp by one person and opened
// by another on a different phone, so most of the query string is dropped: a
// rehearsal `?scene=`, a cache-buster, and above all the facilitator's room
// `key` belong to the run they came from. The key in particular must never
// travel — it is what lets a screen act as that room's dashboard.
//
// `room` is the exception, and it is the whole point of sharing from inside a
// session. It was being dropped with everything else, and the effect was that
// the chain quietly left the room: someone in a live session shared their
// spell, a colleague opened it, and that phone joined nothing. The facilitator
// counted one person while three had played. Carrying the code keeps the chain
// and the room as the same thing, which is what the screen behind it promises.
//
// A room code is public by design — it is printed on the dashboard as a QR for
// a roomful of people to scan. The key is not, and is not here.

import { roomCode } from './room';

export const shareUrl = (): string => {
  try {
    const base = `${window.location.origin}${window.location.pathname}`;
    const room = roomCode();
    return room ? `${base}?room=${encodeURIComponent(room)}` : base;
  } catch {
    return '';
  }
};
