# Tense Master

Learn all 12 English verb tenses with explanations, examples, signal words, and quizzes. Built as a Vite + React + TypeScript single-page app styled with Tailwind CSS. Hosted on GitHub Pages.

**Live site:** https://cmckhmer.github.io/TenseMaster/

Part of the **Creative Minds Network (CMC)** learning ecosystem. The visual design matches the CMC family: slate-950 background with cyan/teal/violet radial gradients, Plus Jakarta Sans + Syne + Space Grotesk typography, and white/[0.04] glass cards with cyan hover states.

## Features

- **12 tenses** across 4 levels (Basic, Intermediate, Advanced, Expert) with progressive unlocking
- **6 quiz questions per tense** (72 total), each with a detailed explanation
- **Best streak tracking** — your longest correct-answer streak is saved to `localStorage`
- **Mistake review** — wrong answers are summarized at the end of every quiz with the correct answer and explanation
- **Keyboard shortcuts** — `1-4` or `A-D` to answer, `Enter` for Next, `Esc` to go back to the menu
- **XP system** with level unlocking (clear all tenses in a level to unlock the next)
- **3D card hover, confetti on streaks, WebAudio sound effects, school-bell intro**

## Run locally

```bash
npm install
npm run dev       # vite dev server with hot reload
npm run build     # production build -> dist/
npm run typecheck # tsc --noEmit
```

Then open the URL Vite prints (usually http://localhost:3000).

## Deploy

Pushes to `main` automatically build and deploy via the GitHub Actions workflow at `.github/workflows/jekyll-gh-pages.yml` (despite the historical filename, it now runs `npm ci && npm run build` and uploads `dist/` to GitHub Pages).

To deploy manually:

```bash
npm run build
# upload dist/ contents to your static host, or
npx vite preview
```

## Project structure

```
src/
  App.tsx                  # Main game component and state machine
  data/tenses.ts           # All 12 tenses + their quiz questions
  utils/sounds.ts          # WebAudio sound effects
  components/Particles.tsx # Confetti effect
  index.css                # Tailwind import + CMC-matched theme
  main.tsx                 # React entry point
```

## Notes

- All progress (XP, completed tenses, best streak, unlocked levels) is saved to `localStorage` — no account, no server, no data leaves the browser.
- Linked from the CMC Learning Games hub at https://cmckhmer.github.io/Creative-Minds-/#games under the **Grammar** filter.
