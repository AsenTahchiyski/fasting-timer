# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A client-only intermittent fasting timer PWA (React 18 + TypeScript + Vite + Tailwind + Dexie). There is no backend — all data lives in the browser, and privacy (data never leaves the device) is a core constraint. Don't add network calls or analytics.

## Commands

- `npm run dev` — dev server on port 5173 (host-exposed)
- `npm run build` — typecheck (`tsc --noEmit`) then Vite build
- `npm run typecheck` — typecheck only
- `npm run preview` — serve the built `dist/`

There are no tests and no linter; `npm run typecheck` is the verification gate.

Deployment is automatic: pushing to `master` triggers `.github/workflows/deploy.yml`, which builds with `VITE_BASE=/<repo>/` and publishes `dist/` to GitHub Pages. `vite.config.ts` reads `VITE_BASE` for the base path and PWA manifest scope; locally it stays `/`.

## Architecture

Single-page app with no router. `src/App.tsx` switches between three screens (`src/screens/Timer.tsx`, `History.tsx`, `Settings.tsx`) via local tab state, and shows `Onboarding.tsx` until `settings.onboarded` is true.

### Data layer (the important part)

All state is in IndexedDB via Dexie (`src/db/db.ts`): a single `settings` row (id `'default'`), a `sessions` table (`endedAt: null` = active fast), and a `kv` table for structured-cloneable odds and ends (e.g. the backup `FileSystemFileHandle`). Schema changes require a new `this.version(n).stores(...)` block — never edit existing version blocks. UI reads through `dexie-react-hooks` `useLiveQuery` wrappers in `src/hooks/useSessions.ts` / `useSettings.ts`, so components re-render automatically on any DB write; mutations go through the helper functions in `db.ts`.

### Data-loss protection (multi-layer, deliberate)

Mobile browsers can evict IndexedDB, so the app maintains redundant mirrors. When touching anything data-related, keep all layers consistent:

1. `src/main.tsx` `bootstrap()`: requests persistent storage, and if IndexedDB is empty, restores from the localStorage mirror or the OPFS backup file before rendering.
2. `src/hooks/useAutoBackup.ts`: on every settings/sessions change (debounced 800ms) writes both mirrors.
3. `src/lib/backup.ts`: localStorage mirror + manual export/import as a downloaded JSON file (`ExportPayload`, `version: 1` — bump and handle migration if the shape changes).
4. `src/lib/fileSync.ts`: standing backup JSON file — a user-chosen file via the File System Access API (Chromium only, handle persisted in the `kv` table) with silent fallback to an OPFS file.

### Conventions

- **i18n**: every user-facing string goes through `src/lib/i18n.ts` — dictionaries keyed like `'timer.start'`, with both `en` and `bg` entries required. Components call `useT()`; the language comes from `LanguageContext` set in `App.tsx`. Default language is Bulgarian (`'bg'`).
- **Theming**: Tailwind color tokens (`accent`, `surface`, `ink`, `line`, …) resolve to CSS variables set at runtime by `src/theme/ThemeProvider.tsx` from the user's accent color and light/dark mode. Use the tokens, not hardcoded colors. Dark mode is `[data-theme="dark"]` on `<html>`.
- **Fasting stages**: defined in `src/lib/stages.ts` as hour ranges (fed → prolonged); stage names/descriptions live in the i18n dictionaries under `stage.*` keys.
- Timestamps are epoch milliseconds; display formatting respects `settings.timezone` and `settings.hourFormat` via helpers in `src/lib/time.ts`.
