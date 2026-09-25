# ⚛️ NUCLEUS — PULSE 04: THE WHEEL

> What did I decide?

A two-to-three minute, mobile-first decision experience, and the last of the
four September Pulses (SIGNAL → TRUTH → ORBIT → NUCLEUS). Built from
`NUCLEUS_Pulse04_Wheel_Game_Playbook.docx` (locked 25 Sep 2026).

    SPIN → SITUATION → CHOOSE → MOVE ON → REVEAL

Spin the OPTICS wheel, face a realistic workplace tension, make a call, move
on. One spin per person. Only at the end does the app
reveal what was underneath the decisions: values → behavior → culture →
human judgment.

## The flow

| Scene | What happens |
|-------|--------------|
| OPENING | The Nucleus mark ignites (same as PULSE 02). Language. *Welcome to the NUCLEUS Wheel. O · P · T · I · C · S. Our values.* Then *Things move. Context changes. Decisions still happen.* SPIN. |
| WHEEL ×1 | O · P · T · I · C · S orbit the Nucleus. Wind-up → accelerate → long settle → snap. The letter picks a situation; three plausible choices; captured silently. |
| PULSE BACK | Straight after the choice: the call the participant made, quoted and never interpreted, with one button that sends it to the Pulse WhatsApp thread. |
| REVEAL | The letters fall into the Nucleus, open into the six values, and the orbit comes back as a helix ring. *Repeated choices become behavior. Behavior becomes culture.* |
| CALLBACK | SIGNAL / TRUTH / ORBIT / NUCLEUS, then *HUMAN JUDGMENT.* |
| FINAL | *Find what matters. Decide what moves.* Then it loops back to the opening by itself after 22 s, ready for the next person. |

## Pulse Back instead of a room

There is no server, no facilitator dashboard, no live statistics. Each
participant gets their own Pulse Back at the end and can post it to the
WhatsApp thread themselves; that is how the facilitator sees what the room
decided. Nothing leaves the phone otherwise. Session state is `localStorage`,
so a refresh does not lose a run.

## Sound

Everything is Web Audio, no files, and deliberately relaxing:

- **Wheel** — each letter has a note from one C-major pentatonic scale, so a
  spin is a soft kalimba run rather than a ratchet. A breath of filtered air
  rises and falls with the wheel's speed. It lands on a singing bowl in that
  letter's key.
- **Calm bed** (from PULSE 02) — a low drone that swells six times a minute,
  the slow-breathing rate; the wheel's glow breathes on the same 10 s clock.
- **Voice** — pre-rendered with `openai/gpt-audio-mini` (voice `alloy`, same
  as PULSE 02), calmer direction. Situations are spoken; a participant's own
  choices and Pulse Back are never read aloud.

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

In dev only, `?scene=wheel|reveal|pulseback|callback|final` opens a scene with
stand-in rounds for re-timing.

## Tech

React 19 · TypeScript · Vite · Motion for React · Tailwind (CDN) · Web Audio.
Deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to `main`.
