# Lyrics → Vowels (歌词 → 元音)

Paste Chinese lyrics, get each character annotated (furigana-style) with its
**main vowel** — the one that carries the tone in pinyin (a / e / i / o / u).

Examples:
- 月 (yuè) → **e**
- 好 (hǎo) → **a**
- 心 (xīn) → **i**

## Local dev

```bash
npm install
npm run dev          # http://localhost:3000
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
- [`pinyin-pro`](https://github.com/zh-lx/pinyin-pro) for Chinese → pinyin
