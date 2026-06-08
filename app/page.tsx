"use client";

import { useEffect, useMemo, useState } from "react";
import {
  annotate,
  ensureEnglishDict,
  englishDictReady,
  MODES,
  modeMeta,
  type Mode,
} from "@/lib/vowels";

export default function Page() {
  const [mode, setMode] = useState<Mode>("mandarin");
  const [text, setText] = useState<string>(() => modeMeta("mandarin").sample);
  // Bumped once the lazy English dictionary finishes loading, to recompute tokens.
  const [dictVersion, setDictVersion] = useState(0);

  const meta = modeMeta(mode);
  const englishLoading = mode === "english" && !englishDictReady();

  useEffect(() => {
    if (mode !== "english") return;
    let cancelled = false;
    ensureEnglishDict().then(() => {
      if (!cancelled) setDictVersion((v) => v + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const tokens = useMemo(
    () => annotate(text, mode),
    // dictVersion is intentional: re-annotate once the dictionary loads.
    [text, mode, dictVersion],
  );

  const vowelsOnly = useMemo(
    () =>
      tokens
        .map((t) => {
          if (t.kind === "unit") return t.vowel;
          if (t.kind === "break") return "\n";
          return t.text;
        })
        .join(""),
    [tokens],
  );

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    // Swap in the new mode's sample only when the user hasn't typed their own text.
    const isUntouched = text.trim() === "" || MODES.some((m) => m.sample === text);
    setMode(next);
    if (isUntouched) setText(modeMeta(next).sample);
  };

  const copyVowels = async () => {
    try {
      await navigator.clipboard.writeText(vowelsOnly);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:py-12">
      <header className="space-y-3">
        <div
          role="tablist"
          aria-label="Language mode"
          className="inline-flex rounded-lg border border-neutral-300 p-0.5 dark:border-neutral-700"
        >
          {MODES.map((m) => {
            const active = m.id === mode;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => switchMode(m.id)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {meta.title}
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {meta.description}
          </p>
        </div>
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
          placeholder={meta.placeholder}
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
            onClick={() => setText(meta.sample)}
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
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Result
          </h2>
          {englishLoading && (
            <span className="text-xs text-neutral-500">
              Loading pronunciation dictionary…
            </span>
          )}
        </div>
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
                    <span key={i} className="whitespace-pre text-neutral-500">
                      {t.text}
                    </span>
                  );
                }
                return (
                  <span
                    key={i}
                    className="mx-0.5 inline-flex flex-col items-center"
                    title={t.pron || undefined}
                  >
                    <span className="text-xl leading-none sm:text-2xl">
                      {t.text}
                    </span>
                    <span
                      className={`mt-1 text-xs font-mono uppercase tracking-wider ${
                        t.approx
                          ? "text-amber-600/70 underline decoration-dotted underline-offset-2 dark:text-amber-400/70"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
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
        Built with Next.js · pinyin-pro · to-jyutping · CMU dict
      </footer>
    </main>
  );
}
