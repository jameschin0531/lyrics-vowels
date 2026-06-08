import { getJyutpingList } from "to-jyutping";
import type { Token } from "./types";

// Jyutping nucleus → collapsed Latin vowel. The scan lands on the first plain
// vowel letter, then matches the longest nucleus that starts there, so two-letter
// nuclei (aa / oe / eo) are resolved before falling back to the single letter.
const NUCLEI: ReadonlyArray<readonly [string, string]> = [
  ["aa", "a"],
  ["oe", "e"],
  ["eo", "e"],
  ["a", "a"],
  ["e", "e"],
  ["i", "i"],
  ["o", "o"],
  ["u", "u"],
];

/**
 * Resolve a Jyutping syllable (e.g. "gam3", "hoi1", "jyut6") to its main vowel,
 * collapsed to a / e / i / o / u. Syllabic nasals (m, ng — e.g. 唔/五) carry no
 * vowel and return "".
 */
export function jyutpingMainVowel(syllable: string): string {
  const s = syllable.toLowerCase().replace(/\d+$/, "");

  let idx = -1;
  for (let i = 0; i < s.length; i++) {
    if ("aeiou".includes(s[i])) {
      idx = i;
      break;
    }
  }
  if (idx === -1) return ""; // syllabic nasal, no vowel

  const rest = s.slice(idx);
  for (const [nucleus, vowel] of NUCLEI) {
    if (rest.startsWith(nucleus)) return vowel;
  }
  return "";
}

export function tokenizeCantonese(input: string): Token[] {
  const tokens: Token[] = [];
  let buffer = "";

  const flush = () => {
    if (buffer) {
      tokens.push({ kind: "text", text: buffer });
      buffer = "";
    }
  };

  for (const [char, jyutping] of getJyutpingList(input)) {
    if (char === "\n") {
      flush();
      tokens.push({ kind: "break" });
      continue;
    }
    if (jyutping) {
      flush();
      tokens.push({
        kind: "unit",
        text: char,
        pron: jyutping,
        vowel: jyutpingMainVowel(jyutping),
      });
    } else {
      buffer += char;
    }
  }
  flush();
  return tokens;
}
