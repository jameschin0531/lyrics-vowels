import type { Mode } from "./types";

export interface ModeMeta {
  id: Mode;
  /** Short label for the mode switcher. */
  label: string;
  /** Page heading shown for this mode. */
  title: string;
  /** One-line description under the heading. */
  description: string;
  /** Textarea placeholder. */
  placeholder: string;
  /** Sample lyrics loaded by "Load sample". */
  sample: string;
}

export const MODES: ReadonlyArray<ModeMeta> = [
  {
    id: "mandarin",
    label: "中文",
    title: "歌词 → 元音",
    description:
      "Paste Mandarin lyrics. Each character shows its main vowel — the one carrying the tone — as a / e / i / o / u.",
    placeholder: "在此粘贴歌词…",
    sample: "月亮代表我的心\n你问我爱你有多深\n我爱你有几分",
  },
  {
    id: "cantonese",
    label: "粵語",
    title: "歌詞 → 元音（粵）",
    description:
      "Paste Cantonese lyrics. Each character shows its Jyutping main vowel, collapsed to a / e / i / o / u.",
    placeholder: "喺呢度貼上歌詞…",
    sample: "原諒我這一生不羈放縱愛自由\n也會怕有一天會跌倒",
  },
  {
    id: "english",
    label: "English",
    title: "Lyrics → Vowels",
    description:
      "Paste English lyrics. Each word shows the vowel of every syllable (in order), collapsed to a / e / i / o / u.",
    placeholder: "Paste lyrics here…",
    sample: "Twinkle twinkle little star\nHow I wonder what you are",
  },
];

export function modeMeta(mode: Mode): ModeMeta {
  return MODES.find((m) => m.id === mode) ?? MODES[0];
}
