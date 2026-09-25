// Tiny Web-Audio sound kit — no external assets, works offline.
//
// PULSE 04 is the lightest of the four Pulses, and the wheel is where that
// has to be heard. A prize wheel clicks — a hard, dry ratchet, faster and
// louder the harder it spins, built to raise the pulse. This one does the
// opposite on purpose:
//
//   * Each letter has its own note, from one major pentatonic scale. There is
//     no pair of notes in that scale that clashes, so however fast the wheel
//     passes them and in whatever order, what comes out is a run on a kalimba
//     rather than a ratchet. It cannot sound wrong, and the ear stops
//     bracing for it to.
//   * The plucks are soft-attacked and rolled off above 2 kHz. Nothing sharp.
//   * Under them a breath of air rises and falls with the wheel's speed, so
//     the slowing-down is heard as well as seen. The deceleration is the part
//     of a spin people enjoy; hearing it settle is what makes it feel
//     physical.
//   * It lands on a singing bowl in that letter's key, an octave down, with a
//     slow beat inside it. Long decay, no fanfare: the room gets quieter
//     when the wheel stops, not louder.

let audioCtx: AudioContext | null = null;

/** One shared context for everything. */
export const audioContext = (): AudioContext | null => ctx();

const ctx = (): AudioContext | null => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
};

let muted = false;
export const setEffectsEnabled = (on: boolean): void => {
  muted = !on;
  if (!on) stopAir();
};

/**
 * Everything the wheel makes goes through one soft low-pass, so no sound in
 * this Pulse has an edge on it.
 */
let bus: AudioNode | null = null;
const wheelBus = (ac: AudioContext): AudioNode => {
  if (bus) return bus;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2200;
  lp.Q.value = 0.4;
  lp.connect(ac.destination);
  bus = lp;
  return lp;
};

/** A partial with a soft attack and an exponential tail. */
const partial = (
  ac: AudioContext,
  out: AudioNode,
  freq: number,
  volume: number,
  attack: number,
  decay: number,
  when = 0,
) => {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  const t = ac.currentTime + when;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  osc.connect(gain);
  gain.connect(out);
  osc.start(t);
  osc.stop(t + attack + decay + 0.05);
};

/** C major pentatonic, one note per letter, O P T I C S clockwise. */
export const LETTER_NOTE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];

/**
 * One letter passing the pointer. A kalimba tine, not a click: a sine with
 * its octave faintly above it, a few milliseconds to speak and most of a
 * second to fade.
 */
export const pluck = (freq: number, volume = 0.045, when = 0): void => {
  if (muted) return;
  const ac = ctx();
  if (!ac) return;
  try {
    const out = wheelBus(ac);
    partial(ac, out, freq, volume, 0.006, 0.9, when);
    partial(ac, out, freq * 2, volume * 0.22, 0.004, 0.35, when);
    partial(ac, out, freq * 3.01, volume * 0.06, 0.003, 0.14, when);
  } catch {
    // audio is decorative — never break the experience
  }
};

/**
 * The wheel coming to rest. A struck bowl an octave under the letter it
 * landed on: two fundamentals a fraction of a hertz apart so the tone slowly
 * swims, and the bowl's inharmonic partials decaying faster above it. About
 * five seconds long, and it is the loudest thing in the Pulse — which is not
 * very loud.
 */
export const bowl = (freq: number, volume = 0.1): void => {
  if (muted) return;
  const ac = ctx();
  if (!ac) return;
  try {
    const out = wheelBus(ac);
    partial(ac, out, freq, volume, 0.03, 5.2);
    partial(ac, out, freq + 0.9, volume * 0.7, 0.03, 4.6);
    partial(ac, out, freq * 2.71, volume * 0.32, 0.02, 2.8);
    partial(ac, out, freq * 5.15, volume * 0.1, 0.015, 1.3);
  } catch {
    // ignore
  }
};

/** Soft pink-ish noise, the raw material for the air under a spin. */
const noise = (ac: AudioContext): AudioBuffer => {
  const len = ac.sampleRate * 2;
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04;
    data[i] = last * 3;
  }
  return buf;
};

let air: { src: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode } | null = null;

/** Start the air under the wheel, silent until setAir gives it a speed. */
export const startAir = (): void => {
  if (air || muted) return;
  const ac = ctx();
  if (!ac) return;
  try {
    const src = ac.createBufferSource();
    src.buffer = noise(ac);
    src.loop = true;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 260;
    filter.Q.value = 0.8;
    const gain = ac.createGain();
    gain.gain.value = 0.0001;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(wheelBus(ac));
    src.start();
    air = { src, filter, gain };
  } catch {
    air = null;
  }
};

/** 0 = still, 1 = the fastest the wheel goes. The air brightens and rises with it. */
export const setAir = (speed: number): void => {
  const ac = audioContext();
  if (!air || !ac) return;
  const s = Math.max(0, Math.min(1, speed));
  try {
    air.filter.frequency.setTargetAtTime(220 + s * 780, ac.currentTime, 0.08);
    air.gain.gain.setTargetAtTime(0.0001 + s * 0.05, ac.currentTime, 0.12);
  } catch {
    // ignore
  }
};

export const stopAir = (): void => {
  const a = air;
  const ac = audioContext();
  if (!a) return;
  air = null;
  try {
    if (ac) a.gain.gain.setTargetAtTime(0.0001, ac.currentTime, 0.25);
    setTimeout(() => {
      try {
        a.src.stop();
        a.gain.disconnect();
      } catch {
        // already stopped
      }
    }, 1400);
  } catch {
    // ignore
  }
};

// ---------------------------------------------------------------------------
// THE DRIVE — the only place in PULSE 04 with a beat.
// ---------------------------------------------------------------------------
//
// Everything else in this Pulse is built to slow a room down: a bed that
// breathes six times a minute, narration with silence left around it, scenes
// that are allowed to sit. A four-on-the-floor kick under any of that would be
// working against the whole design, and under the line "Human judgment." it
// would be working against it audibly.
//
// The spin is the exception, and the reason is that it is the one moment the
// participant is not being asked to reflect. They have pressed a button and
// are watching a wheel decide something. That is where energy belongs, it
// lasts between two and three seconds, and nobody is speaking over it.
//
// So the shape is the EDM idiom, compressed into the length of a spin:
//
//   * A kick on every beat at 124 BPM, steady, the floor under it all.
//   * Hats on the off-beats, following the wheel's speed — busiest while it is
//     flying, thinning out as it slows, so the rhythm decays with the motion.
//   * A riser that does the opposite: it grows as the wheel SLOWS. That is the
//     trick the idiom turns on — tension is built by the thing arriving, not
//     by the thing leaving, so the riser peaks exactly as the wheel is about
//     to land.
//   * The drop is the landing itself. Everything cuts, and what is left is the
//     singing bowl that was always there.
//
// It is deliberately quiet enough that the per-letter plucks still read
// through it, because those are what tell you the wheel is passing letters.

/** Beats per minute. The spin lasts two to three seconds — five or six beats. */
const DRIVE_BPM = 124;

interface Drive {
  master: GainNode;
  hats: GainNode;
  riser: { gain: GainNode; osc: OscillatorNode };
  nodes: AudioScheduledSourceNode[];
}

let drive: Drive | null = null;

/** One kick: a pitch drop into the floor, with a click on top of it. */
const kick = (ac: AudioContext, at: number, into: AudioNode): AudioScheduledSourceNode[] => {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(130, at);
  osc.frequency.exponentialRampToValueAtTime(42, at + 0.09);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.5, at + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.26);
  osc.connect(gain);
  gain.connect(into);
  osc.start(at);
  osc.stop(at + 0.3);
  return [osc];
};

/** One hat: a very short band of noise. */
const hat = (ac: AudioContext, at: number, into: AudioNode): AudioScheduledSourceNode[] => {
  const src = ac.createBufferSource();
  src.buffer = noise(ac);
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 7200;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.16, at + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.055);
  src.connect(hp);
  hp.connect(gain);
  gain.connect(into);
  src.start(at);
  src.stop(at + 0.08);
  return [src];
};

export const startDrive = (): void => {
  if (drive || muted) return;
  const ac = ctx();
  if (!ac) return;
  try {
    const master = ac.createGain();
    master.gain.value = 0.34;
    master.connect(wheelBus(ac));

    const hats = ac.createGain();
    hats.gain.value = 0.6;
    hats.connect(master);

    // The riser, silent until the wheel starts slowing.
    const osc = ac.createOscillator();
    const riserGain = ac.createGain();
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 900;
    bp.Q.value = 1.4;
    osc.type = 'sawtooth';
    osc.frequency.value = 180;
    riserGain.gain.value = 0.0001;
    osc.connect(bp);
    bp.connect(riserGain);
    riserGain.connect(master);
    osc.start();

    // Scheduled ahead of time so the pattern is sample-accurate rather than
    // at the mercy of the animation frame. A spin never outlives eight beats.
    const beat = 60 / DRIVE_BPM;
    const t0 = ac.currentTime + 0.02;
    const nodes: AudioScheduledSourceNode[] = [osc];
    for (let n = 0; n < 8; n++) {
      nodes.push(...kick(ac, t0 + n * beat, master));
      nodes.push(...hat(ac, t0 + (n + 0.5) * beat, hats));
    }

    drive = { master, hats, riser: { gain: riserGain, osc }, nodes };
  } catch {
    drive = null;
  }
};

/** 0 = the wheel has stopped, 1 = as fast as it goes. Same scale as setAir. */
export const setDrive = (speed: number): void => {
  const ac = audioContext();
  if (!drive || !ac) return;
  const s = Math.max(0, Math.min(1, speed));
  try {
    // Hats thin out as the wheel slows...
    drive.hats.gain.setTargetAtTime(0.15 + s * 0.85, ac.currentTime, 0.1);
    // ...and the riser comes up to meet the landing.
    const build = 1 - s;
    drive.riser.gain.gain.setTargetAtTime(0.0001 + build * build * 0.09, ac.currentTime, 0.15);
    drive.riser.osc.frequency.setTargetAtTime(180 + build * build * 900, ac.currentTime, 0.2);
  } catch {
    // ignore
  }
};

/**
 * The drop. Everything stops at once — a fade here would turn the landing into
 * a slow dissolve, and the whole point is that the beat is cut off by it.
 */
export const stopDrive = (): void => {
  const d = drive;
  const ac = audioContext();
  if (!d) return;
  drive = null;
  try {
    if (ac) {
      d.master.gain.cancelScheduledValues(ac.currentTime);
      d.master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.012);
    }
    setTimeout(() => {
      d.nodes.forEach(n => {
        try {
          n.stop();
        } catch {
          // already stopped, or never started
        }
      });
      try {
        d.master.disconnect();
      } catch {
        // ignore
      }
    }, 120);
  } catch {
    // ignore
  }
};

/**
 * The six letters drawn into the Nucleus. Each letter's note glides down into
 * one open chord under the centre, staggered the way the letters move, then
 * the chord is left to fade on its own.
 */
export const gather = (): void => {
  if (muted) return;
  const ac = ctx();
  if (!ac) return;
  try {
    const out = wheelBus(ac);
    const chord = [130.81, 196.0, 261.63, 196.0, 329.63, 261.63];
    LETTER_NOTE.forEach((from, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const t = ac.currentTime + i * 0.18;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(from, t);
      osc.frequency.exponentialRampToValueAtTime(chord[i], t + 2.2);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.022, t + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 5.5);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 5.6);
    });
  } catch {
    // ignore
  }
};

/** A choice made. Two soft notes rising a fifth — received, not judged. */
export const settle = (): void => {
  pluck(392.0, 0.04);
  pluck(587.33, 0.03, 0.11);
};

/** Selection tap — short, wooden, no pitch to speak of. */
export const tap = (): void => {
  if (muted) return;
  pluck(523.25, 0.025);
};

/**
 * Open the Web Audio context while a gesture is still in hand.
 *
 * Mobile browsers create the context suspended and only release it inside a
 * real user gesture. The zero-length silent buffer is the part iOS actually
 * accepts as consent; resume() alone is not always enough.
 */
export const unlockWebAudio = (): void => {
  const ac = ctx();
  if (!ac) return;
  try {
    ac.resume().catch(() => {});
    const source = ac.createBufferSource();
    source.buffer = ac.createBuffer(1, 1, 22050);
    source.connect(ac.destination);
    source.start(0);
  } catch {
    // Audio is part of the experience, never a precondition for it.
  }
};

/**
 * iPhone has no Vibration API. What it does have, since iOS 18, is a native
 * haptic on the system switch control: toggling an `<input type="checkbox"
 * switch>` taps the Taptic Engine. A hidden one, clicked through its label,
 * is the only way a web page can make an iPhone tick. One tap per call — iOS
 * has no durations, so a pattern becomes a tap at the start of each pulse.
 */
let iosSwitch: HTMLLabelElement | null = null;
const iosTap = (): void => {
  try {
    if (!iosSwitch) {
      const label = document.createElement('label');
      label.setAttribute('aria-hidden', 'true');
      label.style.cssText =
        'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      input.tabIndex = -1;
      label.appendChild(input);
      document.body.appendChild(label);
      iosSwitch = label;
    }
    iosSwitch.click();
  } catch {
    // ignore
  }
};

const canVibrate = (): boolean => {
  try {
    return typeof navigator.vibrate === 'function' && navigator.vibrate(0) !== false;
  } catch {
    return false;
  }
};
let vibrates: boolean | null = null;

/** Haptic nudge — real vibration on Android, the switch tap on iPhone, nothing elsewhere. */
export const buzz = (pattern: number | number[] = 30): void => {
  if (vibrates === null) vibrates = canVibrate();
  if (vibrates) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
    return;
  }
  const pulses = Array.isArray(pattern) ? pattern : [pattern];
  let at = 0;
  pulses.forEach((ms, i) => {
    if (i % 2 === 0) {
      if (at === 0) iosTap();
      else setTimeout(iosTap, at);
    }
    at += ms;
  });
};
