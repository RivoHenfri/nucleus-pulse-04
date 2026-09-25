// NUCLEUS PULSE 04 — the room.
//
// A phone spins once, makes one call, and posts what happened: the letter the
// wheel landed on and which of that situation's three choices was made. A
// facilitator's screen asks for the room and gets the shape of everyone in it.
// That is the whole API.
//
// What it will never hold: a name, an email, a device id, an IP. A response is
// one letter and one number, tagged with a room code and nothing else. The
// facilitator view aggregates; nothing individual is ever returned, enforced
// by there being no endpoint that could.
//
// Built on PULSE 02's room, which is running beside it on the same box.
// Bun + bun:sqlite: one process, one file on disk, no native modules to build.

import { Database } from 'bun:sqlite';

const PORT = Number(process.env.PORT ?? 3000);
const DB_PATH = process.env.DB_PATH ?? '/data/nucleus-04.sqlite';

/** Origins allowed to talk to the room. The app lives on GitHub Pages. */
const ORIGINS = new Set([
  'https://rivohenfri.github.io',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://localhost:4173',
]);

const LETTERS = ['O', 'P', 'T', 'I', 'C', 'S'] as const;

// ---------------------------------------------------------------------------
// storage
// ---------------------------------------------------------------------------

const db = new Database(DB_PATH, { create: true });
db.exec('PRAGMA journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    code        TEXT PRIMARY KEY,
    key         TEXT NOT NULL,
    title       TEXT,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE TABLE IF NOT EXISTS responses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    room        TEXT NOT NULL REFERENCES rooms(code),
    lang        TEXT NOT NULL,
    letter      TEXT NOT NULL,     -- where the wheel landed
    choice      INTEGER NOT NULL,  -- 0..2, in the playbook's order
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE INDEX IF NOT EXISTS responses_room ON responses(room);
  -- A phone that opened the room, whether or not it ever finishes. One row
  -- per join; nothing about who.
  CREATE TABLE IF NOT EXISTS joins (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    room        TEXT NOT NULL REFERENCES rooms(code),
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE INDEX IF NOT EXISTS joins_room ON joins(room);
`);

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** Room codes avoid the letters people misread across a room. */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const randomCode = (n = 4) =>
  Array.from(crypto.getRandomValues(new Uint8Array(n)), b => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
const randomKey = () => crypto.randomUUID().replace(/-/g, '');

const cors = (origin: string) =>
  ORIGINS.has(origin)
    ? {
        'access-control-allow-origin': origin,
        'access-control-allow-methods': 'GET,POST,OPTIONS',
        'access-control-allow-headers': 'content-type,x-facilitator-key',
        'access-control-max-age': '86400',
        vary: 'origin',
      }
    : {};

const json = (body: unknown, status = 200, origin = '') =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...cors(origin) },
  });

/** A little back-pressure per address on opening rooms, in memory. */
const buckets = new Map<string, { n: number; at: number }>();
const allow = (ip: string, limit = 10, windowMs = 60_000) => {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now - b.at > windowMs) {
    buckets.set(ip, { n: 1, at: now });
    return true;
  }
  b.n += 1;
  return b.n <= limit;
};

const roomExists = (code: string) => !!db.query('SELECT 1 FROM rooms WHERE code = ?').get(code);

// ---------------------------------------------------------------------------
// aggregation — the only thing a facilitator ever sees
// ---------------------------------------------------------------------------

const summarise = (code: string) => {
  const rows = db
    .query<{ lang: string; letter: string; choice: number }, [string]>(
      'SELECT lang, letter, choice FROM responses WHERE room = ?',
    )
    .all(code);

  /** Where the wheel landed, per letter. */
  const letters: Record<string, number> = {};
  /** For each letter, how many took each of its three choices. */
  const choices: Record<string, [number, number, number]> = {};
  for (const l of LETTERS) {
    letters[l] = 0;
    choices[l] = [0, 0, 0];
  }
  const langs: Record<string, number> = {};
  for (const r of rows) {
    letters[r.letter] += 1;
    choices[r.letter][r.choice] += 1;
    langs[r.lang] = (langs[r.lang] ?? 0) + 1;
  }

  const joined =
    db.query<{ c: number }, [string]>('SELECT COUNT(*) AS c FROM joins WHERE room = ?').get(code)?.c ?? 0;

  return { n: rows.length, joined, letters, choices, langs };
};

// ---------------------------------------------------------------------------
// routes
// ---------------------------------------------------------------------------

Bun.serve({
  port: PORT,
  async fetch(req, server) {
    const url = new URL(req.url);
    const origin = req.headers.get('origin') ?? '';
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || server.requestIP(req)?.address || '?';

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });

    if (url.pathname === '/health') return json({ ok: true, pulse: 4, at: new Date().toISOString() }, 200, origin);

    // -- a facilitator opens a room ------------------------------------------
    if (url.pathname === '/rooms' && req.method === 'POST') {
      if (!allow(ip)) return json({ error: 'slow down' }, 429, origin);
      const body = (await req.json().catch(() => ({}))) as { title?: unknown };
      const title = typeof body.title === 'string' ? body.title.slice(0, 80) : null;
      let code = randomCode();
      while (roomExists(code)) code = randomCode();
      const key = randomKey();
      db.query('INSERT INTO rooms (code, key, title) VALUES (?, ?, ?)').run(code, key, title);
      return json({ code, key, title }, 201, origin);
    }

    // -- a phone opens the room ------------------------------------------------
    // No per-address limit on the participant paths: a room behind one office
    // WiFi is a single IP, and a throttle there silently drops real runs.
    const j = url.pathname.match(/^\/rooms\/([A-Z0-9]{4,8})\/join$/i);
    if (j && req.method === 'POST') {
      const code = j[1].toUpperCase();
      if (!roomExists(code)) return json({ error: 'no such room' }, 404, origin);
      db.query('INSERT INTO joins (room) VALUES (?)').run(code);
      return json({ ok: true }, 201, origin);
    }

    // -- a phone makes its call ------------------------------------------------
    if (url.pathname === '/responses' && req.method === 'POST') {
      const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
      if (!body) return json({ error: 'bad json' }, 400, origin);
      const room = typeof body.room === 'string' ? body.room.toUpperCase().trim() : '';
      if (!roomExists(room)) return json({ error: 'no such room' }, 404, origin);

      const lang = body.lang === 'id' ? 'id' : 'en';
      const letter =
        typeof body.letter === 'string' && (LETTERS as readonly string[]).includes(body.letter) ? body.letter : null;
      const choice = body.choice === 0 || body.choice === 1 || body.choice === 2 ? body.choice : null;
      if (!letter || choice === null) return json({ error: 'bad payload' }, 400, origin);

      db.query('INSERT INTO responses (room, lang, letter, choice) VALUES (?, ?, ?, ?)').run(room, lang, letter, choice);
      return json({ ok: true }, 201, origin);
    }

    // -- the facilitator's screen asks for the room ---------------------------
    const m = url.pathname.match(/^\/rooms\/([A-Z0-9]{4,8})\/summary$/i);
    if (m && req.method === 'GET') {
      const code = m[1].toUpperCase();
      const room = db
        .query<{ key: string; title: string | null; created_at: string }, [string]>(
          'SELECT key, title, created_at FROM rooms WHERE code = ?',
        )
        .get(code);
      if (!room) return json({ error: 'no such room' }, 404, origin);
      if (req.headers.get('x-facilitator-key') !== room.key) return json({ error: 'not yours' }, 403, origin);
      return json({ code, title: room.title, created_at: room.created_at, ...summarise(code) }, 200, origin);
    }

    return json({ error: 'not found' }, 404, origin);
  },
});

console.log(`nucleus pulse 04 room api on :${PORT}, db at ${DB_PATH}`);
