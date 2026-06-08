import type { Mode, Token } from "./types";
import { tokenizeMandarin } from "./mandarin";
import { tokenizeCantonese } from "./cantonese";
import { tokenizeEnglish } from "./english";

/** Annotate lyrics with their main vowels for the given language mode. */
export function annotate(text: string, mode: Mode): Token[] {
  switch (mode) {
    case "cantonese":
      return tokenizeCantonese(text);
    case "english":
      return tokenizeEnglish(text);
    case "mandarin":
    default:
      return tokenizeMandarin(text);
  }
}

export type { Mode, Token } from "./types";
export type { ModeMeta } from "./modes";
export { MODES, modeMeta } from "./modes";
export { ensureEnglishDict, englishDictReady, PENDING_VOWEL } from "./english";
