# Photo Gallery

An Angular photo-library single-page app: an **infinite, random photostream** you can
scroll endlessly, and a **Favorites** library that **persists across page refreshes** — no
backend involved. Built with Angular 22 (standalone, zoneless, signals) and Angular Material.

## Features

- **Photos** (`/`) — an infinite-scroll stream of random photos. Click a photo to add it to
  your favorites. Pages load automatically as you scroll (with a loader), each tile shows a
  shimmer skeleton until its image arrives, and an emulated 200–300 ms API delay keeps the
  loading states realistic.
- **Favorites** (`/favorites`) — the full list of everything you've saved. Click a photo to
  open it. The list survives a page refresh (stored in `localStorage`).
- **Single photo** (`/photos/:id`) — one photo shown large, with **Remove from favorites** and
  a back link.
- **Persistent header** on every page: Photos/Favorites navigation with an active highlight and
  a live favorites count, plus a **light/dark theme** toggle (remembered, with a smooth
  transition that respects `prefers-reduced-motion`).
- **Resilient by default** — request timeouts, an error state with **Retry**, a muted fallback
  tile for broken images, and graceful recovery when a lazy route fails to load offline.

## Tech stack

- **Angular 22** — standalone components, **zoneless** change detection, signal-based state
- **TypeScript**, **SCSS**
- **Angular Material** (Material 3 theming)
- **Vitest** (unit) and **Playwright** (end-to-end)
- **ESLint** + **Prettier**
- **GitHub Actions** CI — lint, unit tests, build, and E2E
- **Node 24 LTS** (works on Node `^20.19`, `^22.12`, or `24`)

Images come from [Picsum](https://picsum.photos) via its `/v2/list` endpoint.

## Getting started

Requires Node `^20.19`, `^22.12`, or `>=24` and npm.

```bash
npm install      # install dependencies
npm start        # dev server at http://localhost:4200
npm test         # unit tests (Vitest, single run)
npm run lint     # ESLint
npm run build    # production build to dist/
npm run e2e      # end-to-end tests (Playwright; boots the app itself)
```

The first E2E run needs the browser once: `npx playwright install chromium`.

## Architecture

The code follows a strict, one-directional layering — see [`ARCHITECTURE.md`](./ARCHITECTURE.md)
for the full rationale:

```
PhotoApiService  →  feature service (signals)  →  smart page  →  dumb component
   (HTTP only)         (owns all state)          (orchestrates)   (input/output)
```

- **API layer** (`core/api`) — the single source of truth for HTTP. The only place that touches
  `HttpClient`/RxJS; every method returns a `Promise` of mapped domain data (Observables never
  leak out). External DTOs are validated with type guards and converted to a source-agnostic
  `Photo` model by a pure mapper.
- **Feature services** (`core/services`, `features/*/…service.ts`) — own **all** state as
  signals; state changes only through their methods. Only these call the API layer.
  - `FavoritesService` — favorites signal, persisted via a swappable `KeyValueStore` port.
  - `ThemeService` — light/dark signal applied via `color-scheme`.
  - `PhotostreamService` — stream paging/loading/end/error state plus scroll offset; an app
    singleton so the feed and scroll position persist across navigation (feature-owned file).
- **Components** — **smart pages** (one per route) inject services and orchestrate; **dumb,
  reusable components** (`PhotoCard`, `Header`, the `InfiniteScroll` directive) inject nothing
  and communicate purely via `input()`/`output()`.

### Notable implementation details

- **Infinite scroll is hand-rolled** with `IntersectionObserver` on a bottom sentinel (no
  third-party scroll libraries), and keeps filling until the sentinel scrolls off-screen — so a
  short first page still loads the next one.
- **Favorites persistence** stores whole photos under a **versioned** `localStorage` envelope,
  so the single-photo page renders on a cold load with no network call. Reads tolerate corrupt
  or outdated data.
- **Resilience** — the API layer bounds every request with a timeout (and aborts it); failed
  loads surface an error + Retry; a broken thumbnail shows a muted fallback tile; a failed
  lazy-route chunk shows a message and, once back online, reloads to recover.
- **State is 100% signals** — no NgRx and no RxJS Subjects/BehaviorSubjects.

## Project structure

```
src/app/
  core/
    api/                 # Layer 1: HTTP, DTOs + guards, mapper (Picsum knowledge lives here)
    services/            # Layer 2: FavoritesService, ThemeService
    storage/             # KeyValueStore persistence port
    models/              # domain types (Photo, ThemeMode)
    navigation-error.ts  # graceful lazy-route load-failure handling
  shared/                # dumb, reusable UI: PhotoCard, InfiniteScroll directive, Header
  features/
    photos/              # PhotostreamService + PhotosPage (route /)
    favorites/           # FavoritesPage (route /favorites)
    photo-detail/        # PhotoDetailPage (route /photos/:id)
e2e/                     # Playwright end-to-end tests (+ mocked Picsum helper)
```

## Testing

- **Unit (Vitest):** the mapper, guards, API service (incl. timeout/abort), storage, all feature
  services, the infinite-scroll directive, and every page/component. Run with `npm test`.
- **End-to-end (Playwright):** the core flows — paging to the end, add-to-favorites, error &
  retry, favorites persistence + detail + remove, theme toggle, and the active-nav highlight.
  Picsum is mocked for deterministic, offline-safe runs. Run with `npm run e2e`.
- **CI:** GitHub Actions runs lint, unit tests, build, and the E2E suite on every push and PR.
