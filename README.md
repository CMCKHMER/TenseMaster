# Tense Master

Learn all 12 English verb tenses with explanations, examples, signal words, and quizzes. Built as a Vite + React + TypeScript single-page app styled with Tailwind CSS. Hosted on GitHub Pages.

**Live site:** https://cmckhmer.github.io/TenseMaster/

## Features

- **12 tenses** across 4 levels (Basic, Intermediate, Advanced, Expert) with progressive unlocking
- **6 quiz questions per tense** (72 total), each with a detailed explanation
- **Best streak tracking** — your longest correct-answer streak is saved to `localStorage`
- **Mistake review** — wrong answers are summarized at the end of every quiz with the correct answer and explanation
- **Keyboard shortcuts** — `1-4` or `A-D` to answer, `Enter` for Next, `Esc` to go back to the menu
- **XP system** with level unlocking (clear all tenses in a level to unlock the next)
- **Chalkboard + wooden-frame visual theme** with 3D card hover, confetti on correct streaks, sound effects, and a school-bell intro

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
  index.css                # Tailwind import + custom animations
  main.tsx                 # React entry point
```

## Notes

- All progress (XP, completed tenses, best streak, unlocked levels) is saved to `localStorage` — no account, no server, no data leaves the browser.
- The Quiz question bank is currently static; future versions could pull from a remote question bank.
