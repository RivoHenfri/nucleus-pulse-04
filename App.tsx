// NUCLEUS — PULSE 04: THE WHEEL
//
// SPIN → SITUATION → CHOOSE → MOVE ON → REVEAL
//
//   enter → wheel ×1 → pulseback → reveal → callback → final → (loop) enter
//
// One spin per person. The Pulse Back, with its WhatsApp button, comes
// straight after the choice, so whoever leaves for WhatsApp has already
// sent their call; whoever stays still gets the reveal.
//
// Everything the run remembers lives here and, for a refresh, in
// localStorage: the language, the scene, and the round — where the wheel
// landed and what was chosen. No login, no identity. If the phone came in
// through a facilitator's room link, that one letter and one choice are
// posted to the room, anonymously; otherwise nothing leaves the phone unless
// the participant sends their own Pulse Back.

import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { COPY, type Lang } from './i18n';
import { ROUNDS, type Round, type SceneId } from './types';
import { setAmbienceEnabled, startCalmBed, stopCalmBed } from './utils/ambience';
import { hush, onAudioTrouble, setNarrationEnabled, setNarrationLang } from './utils/narration';
import { joinRoom, submitToRoom } from './utils/room';
import { setEffectsEnabled, unlockWebAudio } from './utils/sound';
import { setVoiceEnabled, silence } from './utils/voice';

import SceneCallback from './components/SceneCallback';
import SceneEnter from './components/SceneEnter';
import SceneFinal from './components/SceneFinal';
import ScenePulseBack from './components/ScenePulseBack';
import SceneReveal from './components/SceneReveal';
import SceneWheel from './components/SceneWheel';

const STORE_KEY = 'nucleus.pulse04';

interface Saved {
  lang: Lang;
  scene: SceneId;
  rounds: Round[];
}

const load = (): Partial<Saved> => {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}');
  } catch {
    return {};
  }
};

const save = (state: Saved) => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // A private window is not a reason to lose the experience.
  }
};

/**
 * Where a refreshed page picks up. Mid-run it goes back to the scene it was
 * on; a finished run starts over, because the next person holding the phone
 * should not open onto somebody else's Pulse Back.
 */
const resume = (): { scene: SceneId; rounds: Round[] } => {
  const saved = load();
  const rounds = Array.isArray(saved.rounds) ? saved.rounds.slice(0, ROUNDS) : [];
  const scene = saved.scene;
  if (!scene || scene === 'enter' || scene === 'final') return { scene: 'enter', rounds: [] };
  if (scene === 'wheel') return { scene: rounds.length >= ROUNDS ? 'pulseback' : 'wheel', rounds };
  return rounds.length === ROUNDS ? { scene, rounds } : { scene: 'enter', rounds: [] };
};

/**
 * Rehearsal only: `?scene=reveal` opens straight into a scene with stand-in
 * rounds, for re-timing without playing the wheel three times. Gated on
 * import.meta.env.DEV, a compile-time false in a production build.
 */
const dev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV ?? false;
const rehearsal = (): { scene: SceneId; rounds: Round[] } | null => {
  if (!dev) return null;
  const wanted = new URLSearchParams(window.location.search).get('scene') as SceneId | null;
  if (!wanted) return null;
  return {
    scene: wanted,
    rounds: [
      { letter: 'O', choice: 2 },
      { letter: 'T', choice: 0 },
      { letter: 'S', choice: 1 },
    ].slice(0, wanted === 'wheel' ? 0 : ROUNDS) as Round[],
  };
};

const App: React.FC = () => {
  const [start] = useState(() => rehearsal() ?? resume());
  const [scene, setScene] = useState<SceneId>(start.scene);
  const [rounds, setRounds] = useState<Round[]>(start.rounds);
  const [lang, setLang] = useState<Lang>(() => (load().lang as Lang) ?? 'en');
  /** The SPIN on the opening screen is the first spin, so round one starts turning. */
  const [autoSpin, setAutoSpin] = useState(false);
  const [sound, setSound] = useState(true);
  const [trouble, setTrouble] = useState<'blocked' | 'silent' | null>(null);

  useEffect(() => {
    onAudioTrouble(why => setTrouble(current => current ?? why));
  }, []);

  useEffect(() => {
    setNarrationLang(lang);
  }, [lang]);

  // If this phone came in through a room link, the room hears it arrived.
  useEffect(() => {
    joinRoom();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [scene]);

  useEffect(() => {
    save({ lang, scene, rounds });
  }, [lang, scene, rounds]);

  // One room, one sound: the calm bed runs under the whole Pulse and never
  // restarts between scenes. The quiet is supposed to be continuous.
  useEffect(() => {
    startCalmBed();
    return () => {
      hush();
      silence();
      stopCalmBed();
    };
  }, []);

  // One switch for everything: the voice, the bed, the wheel.
  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setVoiceEnabled(next);
    setNarrationEnabled(next);
    setAmbienceEnabled(next);
    setEffectsEnabled(next);
    if (next) startCalmBed();
  };

  const go = (next: SceneId) => () => {
    hush();
    setScene(next);
  };

  const chosen = (round: Round) => {
    const next = [...rounds, round];
    // Into the room, if there is one — in the background, never in the way.
    void submitToRoom({ lang, letter: round.letter, choice: round.choice });
    setRounds(next);
    setAutoSpin(false);
    if (next.length >= ROUNDS) setScene('pulseback');
  };

  const loop = () => {
    hush();
    silence();
    setRounds([]);
    setAutoSpin(false);
    setScene('enter');
  };

  return (
    <main className="min-h-[100dvh] select-none overflow-x-hidden bg-[#06080B] text-gray-200">
      <button
        onClick={toggleSound}
        aria-label={sound ? COPY[lang].common.soundOn : COPY[lang].common.soundOff}
        className="fixed right-3 top-3 z-50 grid h-9 w-9 place-items-center rounded-full border border-white/[0.08] bg-black/30 text-[13px] text-gray-600 backdrop-blur transition-colors hover:text-gray-300"
      >
        {sound ? '🔊' : '🔇'}
      </button>

      {trouble && sound && (
        <button
          onClick={() => {
            unlockWebAudio();
            startCalmBed();
            setTrouble(null);
          }}
          className="fixed inset-x-3 top-14 z-40 rounded-xl border border-sky-300/25 bg-[#10161d] px-4 py-3 text-left text-[12px] leading-snug text-sky-100/90 shadow-lg shadow-black/60"
        >
          {trouble === 'blocked' ? COPY[lang].common.soundBlocked : COPY[lang].common.soundSilent}
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={scene === 'wheel' ? `wheel-${rounds.length}` : scene}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          {scene === 'enter' && (
            <SceneEnter
              lang={lang}
              onChooseLang={setLang}
              onSpin={() => {
                setAutoSpin(true);
                go('wheel')();
              }}
            />
          )}

          {scene === 'wheel' && (
            <SceneWheel lang={lang} played={rounds} autoSpin={autoSpin} onChosen={chosen} />
          )}

          {scene === 'reveal' && <SceneReveal lang={lang} onContinue={go('callback')} />}

          {scene === 'pulseback' && (
            <ScenePulseBack lang={lang} rounds={rounds} onContinue={go('reveal')} />
          )}

          {scene === 'callback' && <SceneCallback lang={lang} onContinue={go('final')} />}

          {scene === 'final' && <SceneFinal lang={lang} onLoop={loop} />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

export default App;
