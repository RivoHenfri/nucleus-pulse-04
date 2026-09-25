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
//     pitch to lock onto. A band-pass drifts between roughly 120 and 720 Hz
//     over half a minute, so the timbre is always moving and never settles
//     into a note. This is the layer that does the work.
//   * Warm air. A second, narrower band of the same noise sitting around
//     250 Hz, swelling in and out every seventeen seconds. This is the layer
//     that keeps the bed from reading as solemn. The first version of this
//     planet was all deep body and high sheen with nothing in the middle,
//     which is exactly the shape of a serious sound — Rivo heard it straight
//     away. Warmth lives in the lower-middle, and it has to be noise rather
//     than a chord, or the hum comes back.
//   * The body below it. A 46 Hz sine under a low-pass, quieter than it was:
//     felt on a good speaker, silently absent on a phone, and in neither case
//     something you can hum along to.
//   * Distant sheen. Two very quiet partials high up, at a level near the
//     threshold of hearing, each breathing on its own slow clock. Their
//     periods are deliberately unrelated, so they never line up into a beat
//     the way the old 110/110.7 pair did. A major sixth apart now rather than
//     a fourth — the friendlier of the two intervals.
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

/**
 * The bed before the wheel, and the bed after it.
 *
 * They are different numbers because of what the beat does to the ear. The
 * drive that plays under a spin peaks around 0.5 and sits at 0.34; a 0.055 bed
 * arriving straight after that does not read as quiet, it reads as nothing at
 * all, and the room the whole Pulse depends on goes dry exactly when the
 * reflective half begins. Rivo heard it immediately and described it as the
 * background having dried up after the wheel.
 *
 * Measured in the running app, the bed was never stopping: 0.055 after the
 * landing, 11 nodes, still breathing. It was a loudness contrast, not a bug,
 * and raising the level is the honest fix rather than hunting for a fault.
 *
 * So the second half runs fuller. It is the half with the reveal, the
 * callback and the spell in it, and it should feel like a place rather than a
 * pause between two sounds.
 */
const CALM_BASE = 0.075;
const CALM_AFTER = 0.105;
/** Six swells a minute — the pace used to slow breathing down. */
const BREATH_HZ = 0.1;
/**
 * How far the bed drops while the Pulse is speaking.
 *
 * Was 0.42, which put the bed at 0.023 under narration — and the scenes after
 * the wheel are almost entirely narration, so the room spent most of the
 * second half inaudible. At 0.62 the voice still steps clearly in front of it
 * without the room leaving behind it.
 */
const DUCK = 0.62;

/** The level the bed is currently aiming at, before ducking. Named so it
 *  cannot be shadowed by the `level` parameter of the tone() helper below. */
let bedLevel = CALM_BASE;

export const startCalmBed = (): void => {
  if (calm || !enabled) return;
  const ac = audioContext();
  if (!ac) return;

  try {
    const master = ac.createGain();
    master.gain.setValueAtTime(0.0001, ac.currentTime);
    // A long fade in, so it is never audible as a thing that started.
    master.gain.exponentialRampToValueAtTime(bedLevel, ac.currentTime + 6);

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
    // point: on a phone the bed should be wind and nothing else. Kept light —
    // a heavy bottom end is most of what makes a room sound serious.
    tone(46, 0.30, 80);

    // SOLAR WIND — the layer you actually hear. Noise through a band-pass
    // that never stops moving, so the ear has no pitch to hold on to.
    const wind = ac.createBufferSource();
    wind.buffer = noiseBuffer(ac);
    wind.loop = true;
    const band = ac.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 420;
    band.Q.value = 0.55;            // wider, so it reads as air and not as a filter
    const sweep = ac.createOscillator();
    const sweepDepth = ac.createGain();
    sweep.frequency.value = 1 / 31; // a slow pass through the spectrum
    sweepDepth.gain.value = 300;    // 420 ± 300 Hz
    sweep.connect(sweepDepth);
    sweepDepth.connect(band.frequency);
    sweep.start();
    const windGain = ac.createGain();
    windGain.gain.value = 0.8;
    wind.connect(band);
    band.connect(windGain);
    windGain.connect(bus);
    wind.start();
    nodes.push({ stop: () => wind.stop() }, { stop: () => sweep.stop() });

    // WARM AIR — the same noise through a narrower band in the lower-middle,
    // breathing on its own seventeen-second clock. Noise, not a chord: warmth
    // from sustained tones is how the hum got in last time.
    const warm = ac.createBufferSource();
    warm.buffer = noiseBuffer(ac);
    warm.loop = true;
    const warmBand = ac.createBiquadFilter();
    warmBand.type = 'bandpass';
    warmBand.frequency.value = 250;
    warmBand.Q.value = 1.6;
    const warmGain = ac.createGain();
    warmGain.gain.value = 0.22;
    const warmSwell = ac.createOscillator();
    const warmDepth = ac.createGain();
    warmSwell.frequency.value = 1 / 17;
    warmDepth.gain.value = 0.16;
    warmSwell.connect(warmDepth);
    warmDepth.connect(warmGain.gain);
    warmSwell.start();
    warm.connect(warmBand);
    warmBand.connect(warmGain);
    warmGain.connect(bus);
    warm.start();
    nodes.push({ stop: () => warm.stop() }, { stop: () => warmSwell.stop() });

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

    shimmer(523.25, 0.010, 23); // C5
    shimmer(880, 0.007, 37);    // A5, a major sixth above it

    // The breath: one slow swell every ten seconds, across the whole bed.
    const lfo = ac.createOscillator();
    const lfoDepth = ac.createGain();
    lfo.frequency.value = BREATH_HZ;
    lfoDepth.gain.value = bedLevel * 0.45;
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
 * Open the room up for the second half of the Pulse.
 *
 * Called when the wheel lands, which is the moment the beat stops and the
 * reflective scenes begin. The lift takes eight seconds, far longer than the
 * cut it follows, so what the ear notices is the room still being there rather
 * than something turning itself up.
 *
 * `on` is false when the Pulse loops for the next person, so they start from
 * the same quiet the last person did.
 */
export const liftCalmBed = (on: boolean): void => {
  bedLevel = on ? CALM_AFTER : CALM_BASE;
  const ac = audioContext();
  if (!calm || !ac) return;
  try {
    const g = calm.master.gain;
    g.cancelScheduledValues(ac.currentTime);
    g.setValueAtTime(Math.max(g.value, 0.0001), ac.currentTime);
    g.exponentialRampToValueAtTime(bedLevel, ac.currentTime + 8);
  } catch {
    // ignore
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
    const target = under ? bedLevel * DUCK : bedLevel;
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
