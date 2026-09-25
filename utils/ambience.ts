// THE CALM BED — the only room sound in PULSE 04.
//
// PULSE 02 had two beds: this one, and a focus bed with a heartbeat that
// quickened as its clock ran down. PULSE 04 has no clock and nothing to
// hurry, so only the calm one is carried over.
//
// Built live with Web Audio — no files, no loading, works offline.

import { audioContext } from './sound';

let enabled = true;

/** Brown-ish noise: softer and rounder than white, reads as "room". */
const noiseBuffer = (ac: AudioContext): AudioBuffer => {
  const len = ac.sampleRate * 4;
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buf;
};

export const setAmbienceEnabled = (on: boolean): void => {
  if (!on) stopCalmBed();
  enabled = on;
};

// ---------------------------------------------------------------------------
// THE CALM BED — space, not a tone.
// ---------------------------------------------------------------------------
//
// It holds the quiet open so the silences read as space to think rather than
// as the app having stopped, and it makes the reflective screens feel like one
// continuous place instead of seventeen separate ones.
//
// WHAT IT USED TO BE, AND WHY THAT FAILED
//
// The first bed was a stack of sustained sines: 55 and 82.5 Hz underneath,
// then a pair at 110 and 110.7 Hz, and a partial at 330. On studio monitors
// that is a warm drone. On a phone speaker — which is what every participant
// actually holds — nothing below about 200 Hz reproduces at all, so the entire
// foundation vanished and all that was left was the 110 pair and the 330
// partial: a steady, pitched, nasal hum. Rivo's word for it was "ngggg", and
// he was describing exactly what the hardware was doing to it.
//
// The lesson is not "make it quieter". A sustained pitch is the problem. The
// ear locks onto a constant frequency within seconds and then cannot let go of
// it; it stops being a room and becomes a noise in the room.
//
// WHAT IT IS NOW
//
// A planet, heard from orbit — which is the image PULSE 04 already runs on,
// with the letters circling the Nucleus.
//
//   * Solar wind. Filtered noise is the whole foundation, because noise has no
//     pitch to lock onto. A band-pass drifts between roughly 180 and 700 Hz
//     over half a minute, so the timbre is always moving and never settles
//     into a note. This is the layer that does the work.
//   * The body below it. A 42 Hz sine under a low-pass: felt on a good
//     speaker, silently absent on a phone, and in neither case something you
//     can hum along to.
//   * Distant sheen. Two very quiet partials high up, at a level near the
//     threshold of hearing, each breathing on its own slow clock. Their
//     periods are deliberately unrelated, so they never line up into a beat
//     the way the old 110/110.7 pair did.
//   * Drift. The whole bed pans slowly from side to side across forty seconds.
//     On headphones it reads as something large moving past.
//   * The breath. Everything still swells and falls once every ten seconds —
//     six cycles a minute, the rate used to pace slow breathing. People tend
//     to fall in with it without noticing, which is most of the effect.
//
// It sits well under the narration and ducks further whenever the voice
// speaks, so it never competes with it.

interface Calm {
  master: GainNode;
  nodes: { stop: () => void }[];
}

let calm: Calm | null = null;

const CALM_VOLUME = 0.055;
/** Six swells a minute — the pace used to slow breathing down. */
const BREATH_HZ = 0.1;
/** How far the bed drops while the Pulse is speaking. */
const DUCK = 0.42;

export const startCalmBed = (): void => {
  if (calm || !enabled) return;
  const ac = audioContext();
  if (!ac) return;

  try {
    const master = ac.createGain();
    master.gain.setValueAtTime(0.0001, ac.currentTime);
    // A long fade in, so it is never audible as a thing that started.
    master.gain.exponentialRampToValueAtTime(CALM_VOLUME, ac.currentTime + 6);

    // The drift. Everything goes through here, so the whole bed moves as one.
    // StereoPannerNode is missing on older Safari; the bed is worth more than
    // the panning, so fall back to connecting straight through.
    const nodes: { stop: () => void }[] = [];
    let bus: AudioNode = master;
    if (typeof ac.createStereoPanner === 'function') {
      const panner = ac.createStereoPanner();
      const drift = ac.createOscillator();
      const driftDepth = ac.createGain();
      drift.frequency.value = 1 / 40; // one pass every forty seconds
      driftDepth.gain.value = 0.55;
      drift.connect(driftDepth);
      driftDepth.connect(panner.pan);
      drift.start();
      nodes.push({ stop: () => drift.stop() });
      master.connect(panner);
      panner.connect(ac.destination);
      bus = master;
    } else {
      master.connect(ac.destination);
    }

    /** A sine that is felt rather than followed. */
    const tone = (freq: number, level: number, cutoff: number) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = cutoff;
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = level;
      osc.connect(lp);
      lp.connect(gain);
      gain.connect(bus);
      osc.start();
      nodes.push({ stop: () => osc.stop() });
    };

    // The body. Low enough that a phone will not reproduce it, which is the
    // point: on a phone the bed should be wind and nothing else.
    tone(42, 0.5, 90);

    // SOLAR WIND — the layer you actually hear. Noise through a band-pass
    // that never stops moving, so the ear has no pitch to hold on to.
    const wind = ac.createBufferSource();
    wind.buffer = noiseBuffer(ac);
    wind.loop = true;
    const band = ac.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 320;
    band.Q.value = 0.7;
    const sweep = ac.createOscillator();
    const sweepDepth = ac.createGain();
    sweep.frequency.value = 1 / 31; // a slow pass through the spectrum
    sweepDepth.gain.value = 260;    // 320 ± 260 Hz
    sweep.connect(sweepDepth);
    sweepDepth.connect(band.frequency);
    sweep.start();
    const windGain = ac.createGain();
    windGain.gain.value = 0.85;
    wind.connect(band);
    band.connect(windGain);
    windGain.connect(bus);
    wind.start();
    nodes.push({ stop: () => wind.stop() }, { stop: () => sweep.stop() });

    /**
     * Distant sheen. Two partials near the threshold of hearing, each
     * breathing on its own unrelated clock — 23 s and 37 s, so they never
     * line up into a repeating pattern and never beat against each other.
     */
    const shimmer = (freq: number, level: number, periodS: number) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = level * 0.35;
      const lfo = ac.createOscillator();
      const depth = ac.createGain();
      lfo.frequency.value = 1 / periodS;
      depth.gain.value = level * 0.65;
      lfo.connect(depth);
      depth.connect(gain.gain);
      lfo.start();
      osc.connect(gain);
      gain.connect(bus);
      osc.start();
      nodes.push({ stop: () => osc.stop() }, { stop: () => lfo.stop() });
    };

    shimmer(587.33, 0.012, 23); // D5
    shimmer(880, 0.008, 37);    // A5

    // The breath: one slow swell every ten seconds, across the whole bed.
    const lfo = ac.createOscillator();
    const lfoDepth = ac.createGain();
    lfo.frequency.value = BREATH_HZ;
    lfoDepth.gain.value = CALM_VOLUME * 0.45;
    lfo.connect(lfoDepth);
    lfoDepth.connect(master.gain);
    lfo.start();
    nodes.push({ stop: () => lfo.stop() });

    calm = { master, nodes };
  } catch {
    // Sound is part of the experience, never a precondition for it.
  }
};

/**
 * Pull the bed back under the voice, and let it rise again in the silence.
 *
 * Without this the bed and the narration are two things happening at once in
 * the same room. Ducking puts them in a relationship: the words step forward
 * and the room recedes to make space, then the room comes back — slowly, over
 * a second and a half — into the pause after the sentence.
 *
 * The asymmetry is the whole trick. Ducking fast is a technical necessity;
 * releasing slowly is what makes a silence feel like it was left on purpose
 * rather than like nothing is happening. The swell arrives just as the
 * participant finishes taking the line in.
 */
export const duckCalmBed = (under: boolean): void => {
  if (!calm) return;
  const ac = audioContext();
  if (!ac) return;
  try {
    const g = calm.master.gain;
    const target = under ? CALM_VOLUME * DUCK : CALM_VOLUME;
    g.cancelScheduledValues(ac.currentTime);
    g.setValueAtTime(Math.max(g.value, 0.0001), ac.currentTime);
    // Down quickly so the first word is never fought; back up slowly so the
    // return is felt rather than heard.
    g.exponentialRampToValueAtTime(target, ac.currentTime + (under ? 0.35 : 1.5));
  } catch {
    // ignore
  }
};

export const stopCalmBed = (): void => {
  if (!calm) return;
  const ac = audioContext();
  const { master, nodes } = calm;
  calm = null;
  try {
    if (ac) {
      master.gain.cancelScheduledValues(ac.currentTime);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ac.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 1.6);
    }
    setTimeout(() => nodes.forEach(n => {
      try {
        n.stop();
      } catch {
        // already stopped
      }
    }), 1800);
  } catch {
    // ignore
  }
};
