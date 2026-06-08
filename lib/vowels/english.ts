import type { Token } from "./types";

type Dict = Record<string, string>;

// The CMU dictionary is ~4.7 MB, so it is loaded lazily (code-split) the first
// time English mode is used, then cached at module scope.
let dict: Dict | null = null;
let loading: Promise<void> | null = null;

/** Placeholder vowel shown while the dictionary is still loading. */
export const PENDING_VOWEL = "…";

export function englishDictReady(): boolean {
  return dict !== null;
}

export async function ensureEnglishDict(): Promise<void> {
  if (dict) return;
  if (!loading) {
    loading = import("cmu-pronouncing-dictionary").then((m) => {
      dict = m.dictionary as Dict;
    });
  }
  return loading;
}

// The 15 ARPABET vowels collapsed to a single Latin vowel, matching the
// Mandarin/Cantonese display. Diphthongs map to their nucleus; AH (schwa/wedge) → u.
const ARPABET_TO_VOWEL: Record<string, string> = {
  AA: "a", AE: "a", AW: "a", AY: "a",
  EH: "e", ER: "e", EY: "e",
  IH: "i", IY: "i",
  AO: "o", OW: "o", OY: "o",
  AH: "u", UH: "u", UW: "u",
};

export function arpabetToVowel(symbol: string): string {
  const base = symbol.replace(/\d+$/, "").toUpperCase();
  return ARPABET_TO_VOWEL[base] ?? "";
}

/**
 * The vowel of every syllable in an ARPABET pronunciation, in order, each
 * collapsed to a Latin vowel. Only vowel phones carry a stress digit (0/1/2),
 * and the number of vowel phones equals the syllable count, so e.g.
 * "B Y UW1 T AH0 F AH0 L" (beautiful) → ["u", "u", "u"].
 */
export function wordVowels(arpabet: string): string[] {
  return arpabet
    .trim()
    .split(/\s+/)
    .filter((p) => /\d$/.test(p))
    .map(arpabetToVowel)
    .filter(Boolean);
}

// Best-effort spelling → vowel for words missing from the dictionary.
const DIGRAPHS: ReadonlyArray<readonly [RegExp, string]> = [
  [/^(?:ee|ea|ie)/, "i"],
  [/^oo/, "u"],
  [/^(?:ai|ay)/, "a"],
  [/^(?:ou|ow)/, "o"],
  [/^(?:oa|oe)/, "o"],
  [/^igh/, "a"],
];

const SINGLE: Record<string, string> = { a: "a", e: "e", i: "i", o: "o", u: "u", y: "i" };

function clusterVowel(cluster: string): string {
  for (const [re, vowel] of DIGRAPHS) {
    if (re.test(cluster)) return vowel;
  }
  return SINGLE[cluster[0]] ?? "";
}

/** Best-effort per-syllable vowels — one per written vowel cluster. */
export function fallbackWordVowels(word: string): string[] {
  const clusters = word.toLowerCase().match(/[aeiouy]+/g) ?? [];
  return clusters.map(clusterVowel).filter(Boolean);
}

// Per-syllable vowels are shown joined by hyphens, e.g. wonder → "u-e".
function makeWordToken(word: string): Token {
  if (!dict) {
    return { kind: "unit", text: word, pron: "", vowel: PENDING_VOWEL };
  }
  const arpabet = dict[word.toLowerCase()];
  if (arpabet) {
    return { kind: "unit", text: word, pron: arpabet, vowel: wordVowels(arpabet).join("-") };
  }
  return {
    kind: "unit",
    text: word,
    pron: "not in dictionary (approximate)",
    vowel: fallbackWordVowels(word).join("-"),
    approx: true,
  };
}

const WORD = /[A-Za-z]+(?:'[A-Za-z]+)?/g;

export function tokenizeEnglish(input: string): Token[] {
  const tokens: Token[] = [];

  input.split("\n").forEach((line, lineIndex) => {
    if (lineIndex > 0) tokens.push({ kind: "break" });

    let cursor = 0;
    for (const match of line.matchAll(WORD)) {
      const start = match.index ?? 0;
      if (start > cursor) {
        tokens.push({ kind: "text", text: line.slice(cursor, start) });
      }
      tokens.push(makeWordToken(match[0]));
      cursor = start + match[0].length;
    }
    if (cursor < line.length) {
      tokens.push({ kind: "text", text: line.slice(cursor) });
    }
  });

  return tokens;
}
