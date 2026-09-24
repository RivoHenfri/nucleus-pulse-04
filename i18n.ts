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
    made: 'You made the decisions.',
    changed: 'The situations changed.',
    guided: 'But what guided the decisions?',
    values: "These aren't answers. They're values.",
    shape: ["Values don't make decisions for us.", 'They shape how we make them.'],
    culture: ['Repeated choices become behavior.', 'Behavior becomes culture.'],
    cta: 'CONTINUE',
  },
  pulseback: {
    eyebrow: 'YOUR PULSE BACK',
    intro: 'Here are the three calls you made.',
    note: 'No right answers. No score. Just what you decided.',
    share: 'SEND TO THE PULSE THREAD',
    cta: 'CONTINUE',
    shareText: (rows: string[], url: string) =>
      `◉ NUCLEUS · PULSE 04 — my Pulse Back\n\n${rows.join('\n')}\n\nNo right answers. Just the calls I made.\n${url}`,
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
    again: 'SPIN AGAIN',
    looping: 'Starting over for the next person',
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
    made: 'Kamu yang membuat keputusan.',
    changed: 'Situasinya berubah-ubah.',
    guided: 'Tapi apa yang menuntun keputusan itu?',
    values: 'Ini bukan jawaban. Ini nilai.',
    shape: ['Nilai tidak membuat keputusan untuk kita.', 'Nilai membentuk cara kita memutuskan.'],
    culture: ['Pilihan yang berulang menjadi perilaku.', 'Perilaku menjadi budaya.'],
    cta: 'LANJUT',
  },
  pulseback: {
    eyebrow: 'PULSE BACK KAMU',
    intro: 'Ini tiga keputusan yang kamu ambil.',
    note: 'Tidak ada jawaban benar. Tidak ada skor. Hanya yang kamu putuskan.',
    share: 'KIRIM KE THREAD PULSE',
    cta: 'LANJUT',
    shareText: (rows: string[], url: string) =>
      `◉ NUCLEUS · PULSE 04 — Pulse Back saya\n\n${rows.join('\n')}\n\nTidak ada jawaban benar. Hanya keputusan yang saya ambil.\n${url}`,
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
    again: 'PUTAR LAGI',
    looping: 'Mulai lagi untuk orang berikutnya',
  },
};

export const COPY: Record<Lang, Copy> = { en: EN, id: ID };
