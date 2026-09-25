// THE ROOM — the facilitator's screen for PULSE 04.
//
// Every phone spins once and makes one call. This is where the room sees
// itself: where the wheel landed across all of us, and, for each situation
// that came up, which way people went. Shown in stages on a big screen, by
// someone who decides when the next stage appears (arrow keys, space, or a
// clicker).
//
//   ?room=RRX7&key=…&lang=id     the screen for a room you opened
//   (nothing)                    opens a new room and shows its code + QR
//
// Built on PULSE 02's room screen, and its rules hold here too:
//   1. Nothing individual. The API has no endpoint that returns a row.
//   2. No score, no ranking, no correct answer. The three choices for a
//      situation are one colour and in the playbook's order; none is marked.
//   3. The room's own numbers only.

import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { COPY, LETTERS, VALUE, type Lang } from './i18n';
import type { Letter } from './types';
import { fetchSummary, openRoom, type RoomSummary } from './utils/room';

/** Bone, for everything the room did. One colour, no good end. */
const NEUTRAL = '#EDE7DA';
/** The wheel's own cyan, for where it landed. */
const CYAN = '#7dd3fc';

/** Below this the charts do not render. One: this room is run live. */
const FLOOR = 1;

const T = {
  en: {
    waiting: 'Scan, or open',
    joined: (j: number, n: number) => `${j} joined · ${n} spun`,
    people: 'people in the room',
    stage: ['', 'WHERE THE WHEEL LANDED', 'WHAT WE DECIDED', 'SO, WHAT DOES THAT MEAN'],
    landedNote: 'Nobody chose their situation. The wheel did.',
    decidedNote: 'Three calls for every situation. None of them is the right one.',
    close: ['Different situations. Different calls.', 'Nobody was told which one was right.'],
    culture: ['Repeated choices become behavior.', 'Behavior becomes culture.'],
    ours: 'Our values. Our culture.',
    share: 'Share to the group',
    shareText: (n: number, top: string, call: string) =>
      `*NUCLEUS PULSE 04 — THE WHEEL*\n\n${n} of us. One spin each. One call each.\n\n🎡 The wheel landed most on *${top}*\n💬 Most common call → *${call}*\n\nNo right answers. Just the calls we made.\nO · P · T · I · C · S — our values.\n\nTry it:`,
    next: 'next  →',
    open: 'Open a room',
    opening: 'Opening…',
    unreachable: 'The room server cannot be reached.',
    unreachableWhy: 'nucleus-api.rivohenfri.cloud/p4 is not answering — check that the PULSE 04 API is deployed on the VPS.',
    tooFew: 'Nobody has spun yet. The charts open with the first call.',
    nobody: 'not landed',
  },
  id: {
    waiting: 'Scan QR-nya, atau buka link ini',
    joined: (j: number, n: number) => `${j} sudah masuk · ${n} sudah spin`,
    people: 'orang sudah masuk',
    stage: ['', 'RODA BERHENTI DI MANA', 'YANG KITA PUTUSKAN', 'JADI, APA ARTINYA'],
    landedNote: 'Tidak ada yang memilih situasinya. Rodanya yang memilih.',
    decidedNote: 'Tiga pilihan untuk setiap situasi. Tidak ada yang paling benar.',
    close: ['Situasi berbeda. Keputusan berbeda.', 'Tidak ada yang diberi tahu mana yang benar.'],
    culture: ['Pilihan yang berulang menjadi perilaku.', 'Perilaku menjadi budaya.'],
    ours: 'Nilai kita. Budaya kita.',
    share: 'Bagikan ke grup',
    shareText: (n: number, top: string, call: string) =>
      `*NUCLEUS PULSE 04 — THE WHEEL*\n\n${n} orang. Satu kali spin. Satu keputusan.\n\n🎡 Roda paling sering berhenti di *${top}*\n💬 Keputusan terbanyak → *${call}*\n\nTidak ada jawaban benar. Hanya keputusan yang kita ambil.\nO · P · T · I · C · S — nilai-nilai kita.\n\nCoba sendiri:`,
    next: 'lanjut  →',
    open: 'Buka ruang',
    opening: 'Membuka…',
    unreachable: 'Server ruangan tidak bisa dihubungi.',
    unreachableWhy: 'nucleus-api.rivohenfri.cloud/p4 tidak menjawab — pastikan API PULSE 04 sudah dideploy di VPS.',
    tooFew: 'Belum ada yang spin. Grafiknya terbuka begitu keputusan pertama masuk.',
    nobody: 'belum muncul',
  },
};

const APP_URL = `${window.location.origin}${window.location.pathname.replace(/dashboard\.html$/, '')}`;

/** One thin horizontal bar with a direct label. */
const Bar: React.FC<{ label: string; value: number; max: number; total: number; color?: string }> = ({
  label,
  value,
  max,
  total,
  color = NEUTRAL,
}) => (
  <div className="flex items-center gap-4" title={`${label}: ${value}`}>
    <span className="w-56 shrink-0 text-right text-[13px] leading-snug text-gray-300">{label}</span>
    <div className="relative h-3 flex-1 rounded-[4px] bg-white/[0.04]">
      <motion.div
        className="absolute left-0 top-0 h-3 rounded-[4px]"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${max ? (value / max) * 100 : 0}%` }}
        transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
      />
    </div>
    <span className="w-16 text-[13px] tabular-nums text-gray-400">
      {value || ''}
      {value && total ? <span className="ml-1.5 text-[11px] text-gray-600">{Math.round((value / total) * 100)}%</span> : null}
    </span>
  </div>
);

const LAST_STAGE = 3;

const Room: React.FC = () => {
  const q = new URLSearchParams(window.location.search);
  const [lang, setLang] = useState<Lang>(q.get('lang') === 'en' ? 'en' : 'id');
  const t = T[lang];
  const bank = COPY[lang].sit.bank;

  const switchLang = (next: Lang) => {
    setLang(next);
    const u = new URL(window.location.href);
    u.searchParams.set('lang', next);
    window.history.replaceState(null, '', u.toString());
  };

  const LangToggle = (
    <span className="flex gap-1 text-[11px] tracking-[0.2em]">
      {(['en', 'id'] as Lang[]).map(l => (
        <button
          key={l}
          onClick={() => switchLang(l)}
          className={`rounded-full px-2.5 py-1 ${lang === l ? 'bg-[#EDE7DA] text-[#07090C]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </span>
  );

  const [code, setCode] = useState(q.get('room')?.toUpperCase() ?? '');
  const [key, setKey] = useState(q.get('key') ?? '');
  const [s, setS] = useState<RoomSummary | null>(null);
  const [stage, setStage] = useState(0);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // Polled, not pushed: a room of phones over an hour is nothing.
  useEffect(() => {
    if (!code || !key) return;
    let live = true;
    const tick = async () => {
      const next = await fetchSummary(code, key);
      if (live && next) setS(next);
    };
    void tick();
    const id = setInterval(tick, 3000);
    return () => {
      live = false;
      clearInterval(id);
    };
  }, [code, key]);

  // Arrow keys and space move the reveal, so a clicker works.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') setStage(v => Math.min(LAST_STAGE, v + 1));
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') setStage(v => Math.max(0, v - 1));
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  const open = async () => {
    setBusy(true);
    setFailed(false);
    const r = await openRoom('PULSE 04 — THE WHEEL');
    setBusy(false);
    if (!r) {
      setFailed(true);
      return;
    }
    setCode(r.code);
    setKey(r.key);
    const u = new URL(window.location.href);
    u.searchParams.set('room', r.code);
    u.searchParams.set('key', r.key);
    window.history.replaceState(null, '', u.toString());
  };

  if (!code || !key) {
    return (
      <main className="grid min-h-[100dvh] place-items-center px-8 text-center">
        <div>
          <p className="font-display mb-2 text-[18px] tracking-[0.2em] text-[#EDE7DA]">NUCLEUS PULSE 04</p>
          <p className="mb-8 text-[12px] tracking-[0.3em] text-gray-500">THE WHEEL · ROOM</p>
          <div className="mb-8 flex justify-center">{LangToggle}</div>
          <button
            onClick={open}
            disabled={busy}
            className="rounded-full bg-[#EDE7DA] px-10 py-4 text-[12px] font-bold tracking-[0.28em] text-[#07090C] disabled:opacity-50"
          >
            {busy ? t.opening : t.open}
          </button>
          {failed && (
            <div className="mx-auto mt-8 max-w-md rounded-xl border border-amber-300/25 bg-[#12171d] px-5 py-4 text-left">
              <p className="text-[14px] text-amber-100">{t.unreachable}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-gray-400">{t.unreachableWhy}</p>
            </div>
          )}
        </div>
      </main>
    );
  }

  const link = `${APP_URL}?room=${code}`;
  const n = s?.n ?? 0;
  const ready = n >= FLOOR;
  const landed = (l: Letter) => s?.letters[l] ?? 0;
  const maxLanded = Math.max(1, ...LETTERS.map(landed));
  const seen = LETTERS.filter(l => landed(l) > 0);

  const topLetter = LETTERS.reduce((a, b) => (landed(b) > landed(a) ? b : a), LETTERS[0]);
  let topCall = '';
  let topCallN = 0;
  for (const l of LETTERS) {
    (s?.choices[l] ?? [0, 0, 0]).forEach((v, i) => {
      if (v > topCallN) {
        topCallN = v;
        topCall = bank[l].choices[i];
      }
    });
  }
  const shareBody = t.shareText(n, `${topLetter} · ${VALUE[topLetter]}`, topCall);
  const shareHref = `https://wa.me/?text=${encodeURIComponent(`${shareBody}\n${link}`)}`;

  const Gate: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    ready ? <>{children}</> : <p className="mx-auto max-w-lg text-center text-[15px] leading-relaxed text-gray-500">{t.tooFew}</p>;

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-5xl flex-col px-10 py-10">
      <header className="flex items-baseline justify-between">
        <span className="font-display text-[18px] tracking-[0.2em] text-[#EDE7DA]">NUCLEUS PULSE 04</span>
        <span className="flex items-center gap-6 text-[12px] tracking-[0.3em] text-gray-500">
          {code} · {t.joined(s?.joined ?? 0, n)}
          {LangToggle}
        </span>
      </header>

      <section className="flex flex-1 flex-col justify-center py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {stage === 0 && (
              <div className="text-center">
                <p className="text-[12px] tracking-[0.3em] text-gray-500">{t.waiting}</p>
                <p className="font-display mt-6 text-[110px] leading-none tracking-[0.2em] text-[#EDE7DA]">{code}</p>
                <p className="mt-6 text-[14px] text-gray-400">{link}</p>
                <img
                  alt="QR"
                  className="mx-auto mt-6 h-48 w-48 rounded-xl bg-white p-2"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=384x384&data=${encodeURIComponent(link)}`}
                />
                <p className="font-display mt-8 text-[40px] text-[#EDE7DA]">
                  {s?.joined ?? 0} <span className="text-[18px] text-gray-500">{t.people}</span>
                </p>
                <p className="mt-2 text-[15px] tracking-[0.4em] text-sky-100/70">O · P · T · I · C · S</p>
              </div>
            )}

            {/* 1 — where the wheel landed. The six letters as they sit on the wheel. */}
            {stage === 1 && (
              <>
                <p className="mb-10 text-[12px] tracking-[0.3em] text-gray-500">{t.stage[1]}</p>
                <Gate>
                  <div className="grid grid-cols-6 gap-4">
                    {LETTERS.map((l, i) => {
                      const v = landed(l);
                      return (
                        <motion.div
                          key={l}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: v ? 1 : 0.35, y: 0 }}
                          transition={{ duration: 0.7, delay: i * 0.08 }}
                          className="flex flex-col items-center"
                        >
                          <div className="relative flex h-56 w-full items-end justify-center">
                            <motion.div
                              className="w-10 rounded-t-md"
                              style={{ background: CYAN, opacity: 0.75 }}
                              initial={{ height: 0 }}
                              animate={{ height: `${(v / maxLanded) * 100}%` }}
                              transition={{ duration: 1, ease: [0.22, 0.61, 0.36, 1] }}
                            />
                          </div>
                          <p className="mt-3 text-[22px] tabular-nums text-[#EDE7DA]">{v || '·'}</p>
                          <div
                            className="font-display mt-3 grid h-14 w-14 place-items-center rounded-full border border-sky-200/50 text-[28px] text-sky-50"
                            style={{ background: 'radial-gradient(circle at 50% 40%, rgba(56,189,248,0.3), rgba(8,47,73,0.5) 70%)' }}
                          >
                            {l}
                          </div>
                          <p className="mt-2 text-[11px] tracking-[0.18em] text-gray-400 uppercase">{VALUE[l]}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                  <p className="mt-10 border-l-2 border-white/10 pl-5 text-[16px] leading-relaxed text-gray-400">{t.landedNote}</p>
                </Gate>
              </>
            )}

            {/* 2 — what we decided, for every situation that came up. */}
            {stage === 2 && (
              <>
                <p className="mb-8 text-[12px] tracking-[0.3em] text-gray-500">{t.stage[2]}</p>
                <Gate>
                  <div className={`grid gap-5 ${seen.length > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {seen.map(l => {
                      const c = s?.choices[l] ?? [0, 0, 0];
                      const total = c[0] + c[1] + c[2];
                      return (
                        <div key={l} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className="font-display grid h-10 w-10 place-items-center rounded-full border border-sky-200/50 text-[20px] text-sky-50">
                              {l}
                            </span>
                            <span className="text-[11px] tracking-[0.26em] text-gray-400 uppercase">{VALUE[l]}</span>
                            <span className="ml-auto text-[12px] text-gray-500">{total}</span>
                          </div>
                          <p className="mt-3 text-[13px] leading-relaxed text-gray-500">{bank[l].situation}</p>
                          <div className="mt-4 space-y-2.5">
                            {bank[l].choices.map((label, i) => (
                              <Bar key={i} label={label} value={c[i]} max={Math.max(1, ...c)} total={total} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-8 border-l-2 border-white/10 pl-5 text-[16px] leading-relaxed text-gray-400">{t.decidedNote}</p>
                </Gate>
              </>
            )}

            {stage === 3 && (
              <div className="mx-auto max-w-2xl text-center">
                <p className="font-display text-[38px] leading-tight text-[#EDE7DA]">{t.close[0]}</p>
                <p className="mt-3 text-[18px] text-gray-500">{t.close[1]}</p>
                <p className="mt-12 text-[18px] text-gray-400">{t.culture[0]}</p>
                <p className="font-display mt-1 text-[30px] text-[#EDE7DA]">{t.culture[1]}</p>
                <p className="mt-12 text-[18px] font-semibold tracking-[0.5em] text-sky-100/90">O · P · T · I · C · S</p>
                <p className="mt-3 text-[15px] tracking-[0.12em] text-gray-400">{t.ours}</p>
                {ready && (
                  <a
                    href={shareHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-12 inline-flex items-center gap-2 rounded-full bg-[#25D366]/90 px-7 py-3.5 text-[12px] font-bold tracking-[0.2em] text-[#062b15]"
                  >
                    {t.share}
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      <footer className="flex justify-between text-[11px] tracking-[0.24em] text-gray-600">
        <button onClick={() => setStage(v => Math.max(0, v - 1))} className="hover:text-gray-300">
          ←
        </button>
        <span>
          {stage} / {LAST_STAGE}
        </span>
        <button onClick={() => setStage(v => Math.min(LAST_STAGE, v + 1))} className="hover:text-gray-300">
          {t.next}
        </button>
      </footer>
    </main>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Room />);
