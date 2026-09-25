# ⚛️ NUCLEUS — PULSE 04: THE WHEEL

> What did I decide?

A two-to-three minute, mobile-first decision experience, and the last of the
four September Pulses (SIGNAL → TRUTH → ORBIT → NUCLEUS). Built from
`NUCLEUS_Pulse04_Wheel_Game_Playbook.docx` (locked 25 Sep 2026).

    SPIN → SITUATION → CHOOSE → MOVE ON → REVEAL

Spin the OPTICS wheel, face a realistic workplace tension, make a call, move
on. One spin per turn, and three turns per phone — enough to start over after
a typo or a message sent to the wrong thread, not enough to keep spinning
until the answer is one you like. `?again` on the URL resets a phone for the
next person, and resets its letter deck with it.

The letter is dealt from a shuffled deck held on the phone, so every letter
comes up once before any letter comes up twice and the same value never
arrives twice in a row. The three choices under each situation are shuffled
on every round, so no option is always in the same place. Only at the end does the app
reveal what was underneath the decisions: values → behavior → culture →
human judgment.

## The flow

| Scene | What happens |
|-------|--------------|
| OPENING | The Nucleus mark ignites (same as PULSE 02). Language. *Welcome to the last Pulse. NUCLEUS. OPTICS. Our values.* Then *Please spin the wheel.* SPIN. OPTICS is set and spoken as one word, never spelled out, and the three lines that used to explain the Pulse before anything had happened are gone — the wheel makes that point by being spun. |
| WHEEL ×1 | O · P · T · I · C · S orbit the Nucleus. Wind-up → accelerate → long settle → snap. The letter picks a situation; three plausible choices; captured silently. |
| REVEAL | The letters fall into the Nucleus, open into the six values, and the orbit comes back as a helix ring. *Repeated choices become behavior. Behavior becomes culture.* |
| CALLBACK | SIGNAL / TRUTH / ORBIT / NUCLEUS, then *HUMAN JUDGMENT.* |
| SPELL | The one screen the participant writes on. Name, one line — *I cast the spell of \<value\> by…* — and the names of whoever spins next, turned into a chain message for the WhatsApp thread. The @ names are game tags; a wa.me link cannot make WhatsApp notify anyone, and the screen says so rather than letting people think they tagged a colleague who never heard about it. |
| FINAL | *Find what matters. Decide what moves.* With turns left it offers START OVER and loops by itself after 22 s, ready for the next person. On the third turn it stays put: a phone that can be spun for ever is not a wheel that decided anything. |

## The room

`dashboard.html` is the facilitator's screen:
https://rivohenfri.github.io/nucleus-pulse-04/dashboard.html

1. **Open a room** — it shows a code, the participant link (`?room=CODE`)
   and a QR, and counts phones as they join.
2. **Where the wheel landed** — how many times each of O · P · T · I · C · S
   came up.
3. **What we decided** — for each situation that came up, how many took each
   of its three choices. One colour, playbook order, nothing marked right.
4. **So, what does that mean** — the close, and a WhatsApp share of the room.

Arrow keys, space or a clicker move between stages. The screen polls every
3 s. A phone only posts to a room if it came in through a room link, and it
posts one letter and one number: no name, no device id. The API has no
endpoint that returns an individual response. Every participant can still send
their own call to the WhatsApp thread from the SPELL screen.

The API (`server/`) runs on the Nucleus VPS as container `nucleus-04-api`
(`/home/ubuntu/nucleus-04`), behind PULSE 01's Caddy at
`https://nucleus-api.rivohenfri.cloud/p4` (`server/Caddyfile.deployed` is the
live Caddyfile). Redeploy: copy `server/*` there, then
`docker compose up -d --build`.

## Sound

Everything is Web Audio, no files, and deliberately relaxing:

- **Wheel** — each letter has a note from one C-major pentatonic scale, so a
  spin is a soft kalimba run rather than a ratchet. A breath of filtered air
  rises and falls with the wheel's speed. It lands on a singing bowl in that
  letter's key.
- **Calm bed** — a planet heard from orbit. Filtered noise under a band-pass
  that drifts across half a minute, a 42 Hz body below it, two partials near
  the threshold of hearing on unrelated clocks, and the whole thing panning
  past over forty seconds. It swells six times a minute, the slow-breathing
  rate; the wheel's glow breathes on the same 10 s clock. It carries no
  sustained pitch on purpose: the first version was a stack of sines, and on a
  phone speaker — where nothing below 200 Hz survives — all that reached the
  room was a steady nasal hum.
- **Drive** — the one place with a beat, and only while the wheel turns: kick
  on every beat at 124 BPM, hats on the off-beats thinning out as it slows,
  and a riser that grows as it slows so it peaks as the letter lands. The
  landing is the drop — everything cuts, and the singing bowl is what is left.
  Afterwards the bed opens from 0.075 to 0.105 over eight seconds, because a
  bed that followed that beat at its old level read as silence.
- **Voice** — pre-rendered with `openai/gpt-audio-mini` (voice `alloy`, same
  as PULSE 02), calmer direction. Situations are spoken; a participant's own
  choices and their own spell are never read aloud.

```bash
bws run -- python narration/generate.py            # only what is missing
bws run -- python narration/generate.py --force    # everything
python narration/generate.py --level-only          # re-level after partial renders
```

## Run it

```bash
npm install
npm run dev      # http://localhost:3004
npm run build    # dist/, base /nucleus-pulse-04/ for GitHub Pages
```

In dev only, `?scene=wheel|reveal|callback|spell|final` opens a scene
with stand-in rounds for re-timing.

## The link preview

`public/brand/og.png` is the card WhatsApp shows when the spell is shared.
1200×630 PNG — not the webp the app uses for its logo, which WhatsApp's
crawler will not render. `og:image` has to be an absolute URL or no image
appears at all, and WhatsApp caches the preview per URL, so a new card will
not show in a thread that already has the old one.

## Tech

React 19 · TypeScript · Vite · Motion for React · Tailwind (CDN) · Web Audio.
Deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to `main`.
