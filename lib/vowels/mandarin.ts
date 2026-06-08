import { pinyin } from "pinyin-pro";
import type { Token } from "./types";

const TONE_TO_VOWEL: Record<string, string> = {
  ā: "a", á: "a", ǎ: "a", à: "a",
  ē: "e", é: "e", ě: "e", è: "e",
  ī: "i", í: "i", ǐ: "i", ì: "i",
  ō: "o", ó: "o", ǒ: "o", ò: "o",
  ū: "u", ú: "u", ǔ: "u", ù: "u",
  ǖ: "u", ǘ: "u", ǚ: "u", ǜ: "u", ü: "u",
};

// Standard Mandarin tone-mark placement rule, used as a fallback
// for neutral (5th) tone where no diacritic exists.
function fallbackVowel(syllable: string): string {
  const s = syllable.toLowerCase();
  if (s.includes("a")) return "a";
  if (s.includes("e")) return "e";
  if (s.includes("ou")) return "o";
  const last = s.match(/[aeiouü]/g);
  if (!last) return "";
  return last[last.length - 1].replace("ü", "u");
}

export function mandarinMainVowel(syllable: string): string {
  for (const ch of syllable) {
    const v = TONE_TO_VOWEL[ch];
    if (v) return v;
  }
  return fallbackVowel(syllable);
}

const CJK = /\p{Script=Han}/u;

export function tokenizeMandarin(input: string): Token[] {
  const tokens: Token[] = [];
  let buffer = "";

  const flush = () => {
    if (buffer) {
      tokens.push({ kind: "text", text: buffer });
      buffer = "";
    }
  };

  for (const ch of input) {
    if (ch === "\n") {
      flush();
      tokens.push({ kind: "break" });
      continue;
    }
    if (CJK.test(ch)) {
      flush();
      const syllable = pinyin(ch, {
        toneType: "symbol",
        type: "string",
        nonZh: "consecutive",
      });
      tokens.push({
        kind: "unit",
        text: ch,
        pron: syllable,
        vowel: mandarinMainVowel(syllable),
      });
    } else {
      buffer += ch;
    }
  }
  flush();
  return tokens;
}
