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
const optics = (letter: string): string => `${LETTERS.join('')} — *${letter}*`;

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
      'Ada keputusan yang harus diambil. PIC-nya sedang tidak ada. Tim bisa jalan kalau ada yang mau mengambilnya.',
    choices: ['Ambil keputusannya', 'Tunggu PIC-nya', 'Tanya pendapat yang lain'],
  },
  P: {
    situation:
      'Cara yang sekarang memang jalan, tapi masalahnya muncul terus. Ada cara baru yang mungkin membantu, tapi belum pernah dicoba di sini.',
    choices: ['Pakai cara baru', 'Tetap cara sekarang', 'Coba kecil-kecilan dulu'],
  },
  T: {
    situation:
      'Kamu sudah lihat proyeknya kemungkinan molor. Tim masih berusaha mengejar. Belum ada yang pasti.',
    choices: ['Sampaikan risikonya sekarang', 'Tunggu sampai lebih jelas', 'Bicara dulu dengan tim'],
  },
  I: {
    situation:
      'Tim sudah jalan dengan rencana yang disepakati. Kamu lihat cara lain yang mungkin lebih baik, tapi mengangkatnya sekarang bisa membuka diskusi lagi.',
    choices: ['Sampaikan idenya', 'Biarkan rencananya jalan', 'Omongkan dulu ke PIC-nya'],
  },
  C: {
    situation:
      'Dua tim beda pendapat soal langkah berikutnya. Kamu bisa saja memutuskan sendiri supaya lebih cepat.',
    choices: ['Putuskan sendiri', 'Duduk bareng lagi', 'Serahkan ke PIC-nya'],
  },
  S: {
    situation:
      'Cara tercepat menyelesaikan masalah hari ini, tapi bulan depan kemungkinan besar terulang lagi.',
    choices: ['Selesaikan sekarang', 'Kerjakan yang jangka panjang', 'Tunda dulu, tinjau nanti'],
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
    welcome: 'Welcome to the last Pulse. NUCLEUS.',
    values: 'Our values.',
    invite: 'Please spin the wheel.',
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
    title: 'Pass it on.',
    intro: (value: string) =>
      `The wheel gave you ${value}. Put your name to it and hand the wheel to whoever goes next.`,
    name: 'Your name',
    namePlaceholder: 'e.g. Tole',
    tags: 'Tag your fellow Nucleus (optional)',
    tagsPlaceholder: 'e.g. Satya, Daniel, Muis',
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
      tags: string;
      url: string;
    }) =>
      `◉ NUCLEUS · PULSE 04 — THE WHEEL\n\n` +
      `${optics(p.letter)}\n` +
      `At the centre of the Nucleus: our six.\n\n` +
      `✨ *${p.name}* drew ${p.letter} — ${p.value}.\n` +
      `When it came up I chose to: “${p.call}”\n\n` +
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
    welcome: 'Selamat datang di Pulse yang terakhir. NUCLEUS.',
    values: 'Nilai kita.',
    invite: 'Yuk, putar rodanya.',
    cta: 'PUTAR',
  },
  wheel: {
    cta: 'PUTAR',
    hint: 'atau ketuk rodanya',
    ready: 'Putar kalau sudah siap.',
  },
  sit: {
    bank: ID_BANK,
  },
  reveal: {
    made: 'Kamu barusan mengambil keputusan.',
    changed: 'Rodanya bisa berhenti di mana saja.',
    guided: 'Tapi apa yang menuntun keputusanmu?',
    values: 'Ini bukan jawaban. Ini nilai.',
    shape: ['Nilai tidak memutuskan untuk kita.', 'Nilai membentuk cara kita memutuskan.'],
    culture: ['Pilihan yang diulang-ulang jadi kebiasaan.', 'Kebiasaan jadi budaya.'],
    cta: 'LANJUT',
  },
  spell: {
    eyebrow: 'SATU HAL TERAKHIR',
    title: 'Teruskan.',
    intro: (value: string) =>
      `Roda memberimu ${value}. Tulis namamu, lalu serahkan rodanya ke orang berikutnya.`,
    name: 'Namamu',
    namePlaceholder: 'contoh: Tole',
    tags: 'Tandai rekan Nucleus-mu (opsional)',
    tagsPlaceholder: 'contoh: Satya, Daniel, Muis',
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
      tags: string;
      url: string;
    }) =>
      `◉ NUCLEUS · PULSE 04 — THE WHEEL\n\n` +
      `${optics(p.letter)}\n` +
      `Di pusat Nucleus: enam nilai kita.\n\n` +
      `✨ *${p.name}* dapat ${p.letter} — ${p.value}.\n` +
      `Waktu situasinya muncul, saya memilih: “${p.call}”\n\n` +
      `🪄 ${p.tags} — giliran kalian di roda. Balas pesan ini, sambung OPTICS-nya.\n` +
      `Temukan yang penting. Putuskan yang bergerak.\n` +
      `👉 ${p.url}`,
  },
  callback: {
    rows: [
      { pulse: 'SIGNAL', q: 'Apa yang menarik perhatianku?' },
      { pulse: 'TRUTH', q: 'Apa yang aku percaya?' },
      { pulse: 'ORBIT', q: 'Di mana tempatku?' },
      { pulse: 'NUCLEUS', q: 'Apa yang aku putuskan?' },
    ],
    helps: ['Informasi bisa membantu.', 'Pengalaman bisa membantu.', 'AI bisa membantu.'],
    center: 'Tapi tidak ada satu pun yang boleh menggantikan yang di tengah.',
    judgment: 'HUMAN JUDGMENT.',
  },
  final: {
    lines: ['Temukan yang penting.', 'Putuskan yang menggerakkan.'],
    ours: 'Nilai kita. Budaya kita.',
    again: 'ULANG DARI AWAL',
    againLeft: (n: number) => `ULANG DARI AWAL  ·  sisa ${n}`,
    looping: 'Mulai lagi',
    spent: 'Satu HP dapat tiga kali. Cukup untuk mengulang kalau ada yang salah, tapi tidak untuk memutar terus sampai dapat jawaban yang kamu suka.',
  },
};

export const COPY: Record<Lang, Copy> = { en: EN, id: ID };
