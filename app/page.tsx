"use client";

import { useMemo, useState } from "react";
import { pinyin } from "pinyin-pro";

const SAMPLE = `月亮代表我的心
你问我爱你有多深
我爱你有几分`;

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

function mainVowel(syllable: string): string {
  for (const ch of syllable) {
    const v = TONE_TO_VOWEL[ch];
    if (v) return v;
  }
  return fallbackVowel(syllable);
}

const CJK = /\p{Script=Han}/u;

type Token =
  | { kind: "char"; char: string; syllable: string; vowel: string }
  | { kind: "text"; text: string }
  | { kind: "break" };

function tokenize(input: string): Token[] {
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
        kind: "char",
        char: ch,
        syllable,
        vowel: mainVowel(syllable),
      });
    } else {
      buffer += ch;
    }
  }
  flush();
  return tokens;
}

export default function Page() {
  const [text, setText] = useState(SAMPLE);
  const tokens = useMemo(() => tokenize(text), [text]);

  const vowelsOnly = useMemo(
    () =>
      tokens
        .map((t) => {
          if (t.kind === "char") return t.vowel;
          if (t.kind === "break") return "\n";
          return t.text;
        })
        .join(""),
    [tokens],
  );

  const copyVowels = async () => {
    try {
      await navigator.clipboard.writeText(vowelsOnly);
    } catch {
      /* ignore */
    }
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:py-12">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          歌词 → 元音
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Paste Chinese lyrics. Each character is shown with its main vowel
          (the one carrying the tone) below — a / e / i / o / u.
        </p>
      </header>

      <section className="space-y-2">
        <label
          htmlFor="lyrics"
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Lyrics
        </label>
        <textarea
          id="lyrics"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="在此粘贴歌词…"
          rows={8}
          className="w-full resize-y rounded-lg border border-neutral-300 bg-white p-3 text-base shadow-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-200 dark:focus:ring-neutral-200"
        />
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            type="button"
            onClick={() => setText("")}
            className="rounded-md border border-neutral-300 px-3 py-1.5 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setText(SAMPLE)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Load sample
          </button>
          <button
            type="button"
            onClick={copyVowels}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Copy vowels only
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Result
        </h2>
        <div className="min-h-32 rounded-lg border border-neutral-200 bg-white p-4 leading-loose dark:border-neutral-800 dark:bg-neutral-900">
          {tokens.length === 0 ? (
            <p className="text-sm text-neutral-400">
              The annotated lyrics will appear here.
            </p>
          ) : (
            <div className="flex flex-wrap gap-y-4">
              {tokens.map((t, i) => {
                if (t.kind === "break") {
                  return <div key={i} className="w-full" />;
                }
                if (t.kind === "text") {
                  return (
                    <span
                      key={i}
                      className="whitespace-pre text-neutral-500"
                    >
                      {t.text}
                    </span>
                  );
                }
                return (
                  <span
                    key={i}
                    className="mx-0.5 inline-flex flex-col items-center"
                    title={t.syllable}
                  >
                    <span className="text-xl leading-none sm:text-2xl">
                      {t.char}
                    </span>
                    <span className="mt-1 text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      {t.vowel || "·"}
                    </span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <footer className="pt-4 text-xs text-neutral-500">
        Built with Next.js · pinyin-pro
      </footer>
    </main>
  );
}
