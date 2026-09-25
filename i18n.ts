// Two languages, chosen on the first screen and honoured everywhere after.
//
// Nucleus terminology stays in English in both: NUCLEUS, PULSE, SIGNAL,
// TRUTH, ORBIT, PULSE BACK — and the six OPTICS values, which are the
// company's words and are not translated.
//
// The scenario bank is the playbook's v1, word for word in English. Every
// choice is written to be defensible somewhere; none of them may read as the
// grown-up answer. That rule matters more in the translation than anywhere
// else, because Indonesian has an easy register of politeness that can make
// one option sound like the respectful one. The three choices in each
// Indonesian set are kept at the same length and the same plainness for that
// reason.

import type { Letter } from './types';

export type Lang = 'en' | 'id';

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'id', label: 'Bahasa Indonesia' },
];

/** In wheel order. The order is the word, read clockwise from the top. */
export const LETTERS: Letter[] = ['O', 'P', 'T', 'I', 'C', 'S'];

export const VALUE: Record<Letter, string> = {
  O: 'Ownership',
  P: 'Progressive',
  T: 'Transparency',
  I: 'Idea',
  C: 'Community',
  S: 'Sustainability',
};

/**
 * The six letters with one of them lit: `O · P · *T* · I · C · S`.
 *
 * A message that named only the sender's own letter read as a form someone had
 * filled in: a value, a sentence, a signature, done. Rivo's word for it was
 * stiff, and the reason is that it left out the thing the Pulse is actually
 * about — what sits at the centre of the Nucleus is not your letter, it is all
 * six. Showing the whole word with your letter lit says "one of six, and the
 * six belong together" without a sentence having to explain it.
 *
 * WhatsApp renders the asterisks as bold, so the letter is lit in the thread
 * itself rather than only inside the app.
 */
const optics = (letter: string): string =>
  LETTERS.map(l => (l === letter ? `*${l}*` : l)).join(' · ');

export interface Scenario {
  situation: string;
  /** Always three, in the playbook's order. The screen shuffles them. */
  choices: [string, string, string];
}

const EN_BANK: Record<Letter, Scenario> = {
  O: {
    situation:
      'A decision is waiting. The person who normally owns it is unavailable. The team can move if someone makes the call.',
    choices: ['Make the call', 'Wait for the owner', 'Get another view'],
  },
  P: {
    situation:
      'The current process works, but it keeps creating the same friction. A new approach could help, but it has not been tested here.',
    choices: ['Try the new approach', 'Keep the current process', 'Run a small test first'],
  },
  T: {
    situation:
      'You can already see a project may slip. The team is still trying to recover it. Nothing is confirmed yet.',
    choices: ['Raise the risk now', 'Wait for more certainty', 'Check with the team first'],
  },
  I: {
    situation:
      'The team is already moving with an agreed plan. You see another approach that may work better, but introducing it now could reopen the discussion.',
    choices: ['Put the idea forward', 'Let the plan run', 'Share it with the owner first'],
  },
  C: {
    situation:
      'Two teams disagree on what should happen next. You could make the call yourself and move faster.',
    choices: ['Make the call', 'Bring them back together', 'Ask the owner to decide'],
  },
  S: {
    situation:
      "The quickest fix will solve today's problem, but it will probably create the same work again next month.",
    choices: ['Fix it now', 'Build the longer fix', 'Buy time and review'],
  },
};

const ID_BANK: Record<Letter, Scenario> = {
  O: {
    situation:
      'Sebuah keputusan sedang menunggu. Orang yang biasanya memegangnya sedang tidak ada. Tim bisa jalan kalau ada yang mengambil keputusan.',
    choices: ['Ambil keputusan', 'Tunggu pemiliknya', 'Minta pandangan lain'],
  },
  P: {
    situation:
      'Proses yang sekarang berjalan, tapi terus menimbulkan hambatan yang sama. Cara baru bisa membantu, tapi belum pernah diuji di sini.',
    choices: ['Terapkan cara baru', 'Pertahankan proses sekarang', 'Uji coba kecil dulu'],
  },
  T: {
    situation:
      'Kamu sudah melihat sebuah proyek mungkin meleset. Tim masih berusaha memulihkannya. Belum ada yang pasti.',
    choices: ['Angkat risikonya sekarang', 'Tunggu sampai lebih pasti', 'Cek dulu dengan tim'],
  },
  I: {
    situation:
      'Tim sudah bergerak dengan rencana yang disepakati. Kamu melihat pendekatan lain yang mungkin lebih baik, tapi mengajukannya sekarang bisa membuka diskusi lagi.',
    choices: ['Ajukan idenya', 'Biarkan rencana berjalan', 'Sampaikan ke pemiliknya dulu'],
  },
  C: {
    situation:
      'Dua tim tidak sepakat soal langkah berikutnya. Kamu bisa memutuskan sendiri dan bergerak lebih cepat.',
    choices: ['Putuskan sendiri', 'Pertemukan mereka lagi', 'Minta pemiliknya memutuskan'],
  },
  S: {
    situation:
      'Perbaikan tercepat akan menyelesaikan masalah hari ini, tapi kemungkinan besar menimbulkan pekerjaan yang sama bulan depan.',
    choices: ['Perbaiki sekarang', 'Bangun solusi jangka panjang', 'Ulur waktu dan tinjau'],
  },
};

const EN = {
  common: {
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    soundHint: 'Best with sound on. Headphones if you have them.',
    soundBlocked: 'Your browser held the sound back. Tap here to let it play.',
    soundSilent: "The voice may not be reaching you. Check your phone isn't on silent, then tap here.",
  },
  enter: {
    brand: 'NUCLEUS PULSE',
    pulse: '04 — NUCLEUS',
    lines: ['Things move.', 'Context changes.', 'Decisions still happen.'],
    welcome: 'Welcome to the NUCLEUS Wheel.',
    values: 'Our values.',
    cta: 'SPIN',
  },
  wheel: {
    cta: 'SPIN',
    hint: 'or tap the wheel',
    ready: "Spin when you're ready.",
  },
  sit: {
    bank: EN_BANK,
  },
  reveal: {
    made: 'You made a decision.',
    changed: 'The wheel could have landed anywhere.',
    guided: 'But what guided it?',
    values: "These aren't answers. They're values.",
    shape: ["Values don't make decisions for us.", 'They shape how we make them.'],
    culture: ['Repeated choices become behavior.', 'Behavior becomes culture.'],
    cta: 'CONTINUE',
  },
  spell: {
    eyebrow: 'ONE LAST THING',
    title: 'Now cast it.',
    intro: (value: string) =>
      `The wheel gave you ${value}. Say what that looks like when you do it — in your own words — and hand the wheel to someone else.`,
    name: 'Your name',
    namePlaceholder: 'e.g. Tole',
    line: (value: string) => `“I cast the spell of ${value} by…”`,
    linePlaceholder: 'e.g. making the call when the owner is away…',
    tags: 'Tag your fellow Nucleus (optional)',
    tagsPlaceholder: 'e.g. Satya, Daniel, Muis',
    hint: 'Write your line to send it.',
    share: 'SEND TO THE PULSE THREAD',
    copy: 'COPY THE MESSAGE',
    copied: 'COPIED',
    note: 'The @ names are part of the game — WhatsApp will not notify them for you.',
    cta: 'CONTINUE',
    everyone: '@everyone in Nucleus',
    anon: 'Someone in Nucleus',
    shareText: (p: {
      name: string;
      letter: string;
      value: string;
      call: string;
      line: string;
      tags: string;
      url: string;
    }) =>
      `◉ NUCLEUS · PULSE 04 — THE WHEEL\n\n` +
      `${optics(p.letter)}\n` +
      `At the centre of the Nucleus: our six.\n\n` +
      `The wheel handed me ${p.letter}, so ${p.value} is the one I carry.\n` +
      `When it came up I chose to: “${p.call}”\n\n` +
      `✨ *${p.name}* casts the spell of ${p.value} by…\n` +
      `“${p.line}”\n\n` +
      `🪄 ${p.tags} — your turn at the wheel. Reply here with yours and keep OPTICS going.\n` +
      `Find what matters. Decide what moves.\n` +
      `👉 ${p.url}`,
  },
  callback: {
    rows: [
      { pulse: 'SIGNAL', q: 'What got my attention?' },
      { pulse: 'TRUTH', q: 'What did I trust?' },
      { pulse: 'ORBIT', q: 'Where did I belong?' },
      { pulse: 'NUCLEUS', q: 'What did I decide?' },
    ],
    helps: ['Information can help.', 'Experience can help.', 'AI can help.'],
    center: 'But none of them should replace the thing at the center.',
    judgment: 'HUMAN JUDGMENT.',
  },
  final: {
    lines: ['Find what matters.', 'Decide what moves.'],
    ours: 'Our values. Our culture.',
    again: 'START OVER',
    againLeft: (n: number) => `START OVER  ·  ${n} left`,
    looping: 'Starting over',
    spent: 'Three turns is all a phone gets. Enough to start over if something went wrong, not enough to keep spinning until you like the answer.',
  },
};

type Copy = typeof EN;

const ID: Copy = {
  common: {
    soundOn: 'Suara nyala',
    soundOff: 'Suara mati',
    soundHint: 'Paling enak dengan suara. Pakai headphone kalau ada.',
    soundBlocked: 'Browser kamu menahan suaranya. Ketuk di sini supaya bisa diputar.',
    soundSilent: 'Suaranya mungkin tidak sampai. Pastikan HP tidak dalam mode senyap, lalu ketuk di sini.',
  },
  enter: {
    brand: 'NUCLEUS PULSE',
    pulse: '04 — NUCLEUS',
    lines: ['Segala hal bergerak.', 'Konteks berubah.', 'Keputusan tetap terjadi.'],
    welcome: 'Selamat datang di NUCLEUS Wheel.',
    values: 'Nilai-nilai kita.',
    cta: 'PUTAR',
  },
  wheel: {
    cta: 'PUTAR',
    hint: 'atau ketuk rodanya',
    ready: 'Putar kalau kamu sudah siap.',
  },
  sit: {
    bank: ID_BANK,
  },
  reveal: {
    made: 'Kamu sudah mengambil keputusan.',
    changed: 'Rodanya bisa berhenti di mana saja.',
    guided: 'Tapi apa yang menuntunnya?',
    values: 'Ini bukan jawaban. Ini nilai.',
    shape: ['Nilai tidak membuat keputusan untuk kita.', 'Nilai membentuk cara kita memutuskan.'],
    culture: ['Pilihan yang berulang menjadi perilaku.', 'Perilaku menjadi budaya.'],
    cta: 'LANJUT',
  },
  spell: {
    eyebrow: 'SATU HAL TERAKHIR',
    title: 'Sekarang ucapkan.',
    intro: (value: string) =>
      `Roda memberimu ${value}. Katakan seperti apa bentuknya saat kamu menjalankannya — dengan kalimatmu sendiri — lalu serahkan rodanya ke orang lain.`,
    name: 'Namamu',
    namePlaceholder: 'contoh: Tole',
    line: (value: string) => `“Aku mengucapkan mantra ${value} dengan…”`,
    linePlaceholder: 'contoh: mengambil keputusan saat pemiliknya tidak ada…',
    tags: 'Tandai rekan Nucleus-mu (opsional)',
    tagsPlaceholder: 'contoh: Satya, Daniel, Muis',
    hint: 'Tulis kalimatmu dulu untuk mengirim.',
    share: 'KIRIM KE THREAD PULSE',
    copy: 'SALIN PESANNYA',
    copied: 'TERSALIN',
    note: 'Tanda @ adalah bagian dari permainan — WhatsApp tidak akan menotifikasi mereka secara otomatis.',
    cta: 'LANJUT',
    everyone: '@semua orang di Nucleus',
    anon: 'Seseorang di Nucleus',
    shareText: (p: {
      name: string;
      letter: string;
      value: string;
      call: string;
      line: string;
      tags: string;
      url: string;
    }) =>
      `◉ NUCLEUS · PULSE 04 — THE WHEEL\n\n` +
      `${optics(p.letter)}\n` +
      `Di pusat Nucleus: enam nilai kita.\n\n` +
      `Roda memberi saya ${p.letter}, jadi ${p.value} yang saya bawa.\n` +
      `Waktu itu muncul, saya memilih: “${p.call}”\n\n` +
      `✨ *${p.name}* mengucapkan mantra ${p.value} dengan…\n` +
      `“${p.line}”\n\n` +
      `🪄 ${p.tags} — giliran kalian di roda. Balas pesan ini dengan mantramu, sambung OPTICS-nya.\n` +
      `Temukan yang penting. Putuskan yang bergerak.\n` +
      `👉 ${p.url}`,
  },
  callback: {
    rows: [
      { pulse: 'SIGNAL', q: 'Apa yang menarik perhatianku?' },
      { pulse: 'TRUTH', q: 'Apa yang aku percaya?' },
      { pulse: 'ORBIT', q: 'Di mana aku menjadi bagian?' },
      { pulse: 'NUCLEUS', q: 'Apa yang aku putuskan?' },
    ],
    helps: ['Informasi bisa membantu.', 'Pengalaman bisa membantu.', 'AI bisa membantu.'],
    center: 'Tapi tidak satu pun seharusnya menggantikan yang ada di pusatnya.',
    judgment: 'HUMAN JUDGMENT.',
  },
  final: {
    lines: ['Temukan yang penting.', 'Putuskan yang bergerak.'],
    ours: 'Nilai kita. Budaya kita.',
    again: 'ULANG DARI AWAL',
    againLeft: (n: number) => `ULANG DARI AWAL  ·  sisa ${n}`,
    looping: 'Mulai lagi',
    spent: 'Satu HP dapat tiga kali. Cukup untuk mengulang kalau ada yang salah, tidak cukup untuk memutar terus sampai jawabannya kamu suka.',
  },
};

export const COPY: Record<Lang, Copy> = { en: EN, id: ID };
