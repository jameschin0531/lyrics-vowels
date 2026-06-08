export type Mode = "mandarin" | "cantonese" | "english";

/**
 * A single piece of annotated output.
 * - `unit`: a Han character (Mandarin/Cantonese) or a word (English) shown with
 *   its main vowel. `pron` is the romanization used for the hover tooltip; `approx`
 *   marks a best-effort vowel (e.g. an English word missing from the dictionary).
 * - `text`: punctuation / spaces / latin runs passed through verbatim.
 * - `break`: a line break.
 */
export type Token =
  | { kind: "unit"; text: string; pron: string; vowel: string; approx?: boolean }
  | { kind: "text"; text: string }
  | { kind: "break" };
