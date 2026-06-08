# Lyrics → Vowels (歌词 → 元音)

Paste lyrics, get each unit annotated (furigana-style) with its **main vowel** —
the one you sustain when singing a note — collapsed to `a / e / i / o / u`.

Three language modes:

| Mode | Romanizer | Unit | Example |
|------|-----------|------|---------|
| **Mandarin** | [`pinyin-pro`](https://github.com/zh-lx/pinyin-pro) | per character (tone-bearing vowel) | 月 (yuè) → **e** |
| **Cantonese** | [`to-jyutping`](https://github.com/CanCLID/to-jyutping) | per character (Jyutping nucleus) | 開 (hoi1) → **o** |
| **English** | [`cmu-pronouncing-dictionary`](https://github.com/words/cmu-pronouncing-dictionary) | per word, vowel of each syllable | wonder (W AH1 N D ER0) → **u-e** |

The English CMU dictionary (~4.7 MB) is loaded lazily the first time English mode
is used, so it never bloats the initial bundle. Words missing from the dictionary
fall back to a best-effort spelling heuristic (shown with a dotted underline).

## Local dev

```bash
npm install
npm run dev          # http://localhost:3000
npm run test         # unit tests (Vitest)
```

## Deploy to Vercel

Option A — one-click via dashboard:
1. Push this folder to a GitHub repo.
2. Go to https://vercel.com/new, import the repo.
3. Framework auto-detects as **Next.js**. No env vars needed. Click **Deploy**.

Option B — Vercel CLI:
```bash
npm i -g vercel
vercel            # first time: link/create project
vercel --prod     # production deploy
```

## Stack

- Next.js 15 (App Router, static page)
- React 19
- Tailwind CSS
- `pinyin-pro` (Mandarin), `to-jyutping` (Cantonese), `cmu-pronouncing-dictionary` (English)
- Vitest for unit tests
