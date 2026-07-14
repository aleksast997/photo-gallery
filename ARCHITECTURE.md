# Architecture

This document explains how the app is structured and, more importantly, _why_ I made the
calls I did. The theme throughout is a strict, one-directional dependency flow and keeping
state in one predictable place.

## The layering

Data flows in a single direction, and each layer only knows about the one below it:

```
HTTP API  →  feature service (signals)  →  smart page  →  dumb component
```

### 1. API layer — the only place HTTP lives

`core/api` is the single source of truth for network access. It's the **only** part of the
codebase allowed to import `HttpClient` or RxJS. I made every method return a `Promise` of
mapped domain data (converting the observable with `firstValueFrom` at the boundary) so that
RxJS never leaks outward. I did this because I wanted exactly one place to reason about the
network, and because letting observables spread through the app tends to pull streaming
semantics into code that only needs a value once.

The layer is stateless — it fetches, validates, maps, and returns. Nothing else.

**DTOs never escape.** The raw Picsum response (`PicsumPhotoDto`, snake_case wire shape) is
confined here. A pure `toPhoto()` mapper converts it to the domain `Photo`, and that mapper is
the _only_ code that knows Picsum's image-URL format. The domain model is deliberately
source-agnostic — it carries plain `thumbUrl`/`fullUrl` strings — so swapping image providers
would touch the mapper and nothing else.

**I treat the network as untrusted.** HTTP responses come in typed as `unknown` and are
narrowed with a small hand-written guard (`isPicsumPhotoDto`) that filters out malformed
entries. I chose hand-written guards over a schema library (e.g. Zod) because the surface is
tiny and I didn't want a dependency for it.

### 2. State — feature services own everything, as signals

All application state lives in services and is held in **signals**. I use no NgRx and no RxJS
Subjects/BehaviorSubjects for state. For an app this size NgRx would be ceremony without
payoff, and signals give me fine-grained reactivity that pairs naturally with zoneless change
detection.

The discipline I enforce:

- Each service exposes its state **read-only** (`asReadonly()` / `computed()`); the writable
  signal stays private.
- **State only changes through a service method.** Nothing outside a service can mutate it.
- Only these services call the API layer. **Components never touch it.**

The services:

- **`FavoritesService`** (`core/services`) — the favorites collection. App singleton, since
  the photostream, favorites list, detail page and header all read it.
- **`ThemeService`** (`core/services`) — the light/dark signal, applied to `<html>` via
  `color-scheme` (which is all Material 3's system variables need to re-theme).
- **`PhotostreamService`** (`features/photos`) — paging/loading/end/error state for the feed.

A note on that last one, because it's a decision I went back and forth on. It's an app
singleton (`providedIn: 'root'`), so the loaded feed and scroll position survive navigating
away from and back to the Photos page — resetting to a fresh random feed at the top every time
is a poor experience when the main loop is Photos → Favorites → back. But I kept the file
under `features/photos` rather than `core`, because **a file's location and a provider's
injector scope are independent concerns**: the service is feature-owned (only the Photos
feature uses it) even though its lifetime is app-wide. The trade-off I accepted is that loaded
pages stay in memory for the session and the feed is frozen after first load — which is the
"keep my place" behaviour I wanted.

### 3. Components — smart pages vs dumb building blocks

I split components in two:

- **Smart pages** (one per route: `PhotosPage`, `FavoritesPage`, `PhotoDetailPage`) inject
  services, orchestrate, and hold only trivial local UI state — never domain state.
- **Dumb components** (`PhotoCard`, `Header`, and the `InfiniteScroll` directive) inject
  nothing and depend on no other component. They communicate purely through `input()` and
  `output()`.

The header is the interesting case: it needs the favorites count and the current theme, but a
dumb component can't inject services. So it takes those as inputs and emits a `toggleTheme`
output, and the smart `App` shell wires it to the services. I preferred that over relaxing the
rule for one component, because it keeps the header trivially reusable and testable.

## Decisions worth calling out

- **Custom infinite scroll.** I implemented it myself with an `IntersectionObserver` watching
  a sentinel element at the bottom of the list (with a preload margin), gated by a `disabled`
  input while loading or once the stream ends — no third-party scroll library. One subtlety I
  hit (my E2E caught it): the observer only reports enter/leave transitions, so if the first page
  doesn't fill the viewport the sentinel stays in view and nothing else loads. The directive
  tracks intersection as a signal and re-checks it with an `effect`, so it keeps filling until
  the sentinel scrolls off-screen or the stream ends.

- **Emulated latency.** The API adds a random 200–300 ms delay to every fetch so the loading
  states are real and visible, as the brief asked.

- **Persistence behind a port.** Favorites are stored in `localStorage`, but `FavoritesService`
  depends on a small `KeyValueStore` interface rather than the Web Storage API directly. That
  keeps the service decoupled from the storage mechanism (I could swap in IndexedDB without
  touching it) and lets me inject a fake in tests. I chose `localStorage` over IndexedDB
  because the data is small and synchronous hydration means the favorites signal is populated
  on first read — no empty-then-filled flicker.

- **Versioned storage.** Persisted favorites use their own `StoredPhoto` shape and are wrapped
  in a `{ version, photos }` envelope, and reads tolerate corrupt or outdated data (bad JSON,
  wrong version, or invalid entries all degrade gracefully to an empty list). Storing whole
  photos means the single-photo page renders on a cold load with no network call.

- **Scroll restoration.** I track the Photos scroll position with a passive listener during
  browsing and restore it on return. I capture it continuously rather than on destroy, because
  by the time a component is torn down its content is already detached and the page has
  collapsed to the top — reading the offset then gives zero.

- **Routing.** Standalone, lazily-loaded route components, with `withComponentInputBinding()`
  so `/photos/:id` binds the route param straight to a component input.

- **Resilience.** The API layer bounds every request with a 10s `timeout` (which also aborts the
  in-flight request), so a hung or pathologically slow response becomes a normal rejection the UI
  recovers from instead of an endless spinner. Failed loads surface an error state with **Retry**;
  each photo tile shows a shimmer skeleton while loading and a muted fallback tile if the image
  fails, rather than the browser's broken-image glyph.

- **Offline lazy routes.** A failed dynamic `import()` (a lazy route's chunk) poisons that module
  record for the page's lifetime, so it keeps failing even after reconnecting. A router
  `withNavigationErrorHandler` catches it: offline — or for a non-chunk error — it shows a
  dismissible message; once back online it does a full document load of the target URL, which
  fetches a fresh module graph and recovers.

## Testing

**Unit (Vitest).** The mapper and guards, the API service (paging, mapping, filtering invalid
data, timeout/abort), the storage layer, all three feature services, the infinite-scroll
directive (against a mocked `IntersectionObserver`), and every page/component. Services are
tested with a fake `KeyValueStore`; components with stubbed collaborators.

**End-to-end (Playwright).** The core user flows against the built app: paging the stream to its
end, adding to favorites, the error-and-retry path, favorites persistence across a reload plus the
detail page and removal, the theme toggle, and the active-nav highlight. I mock the Picsum
endpoints with `page.route`, so the suite is deterministic and independent of the live service —
which also means it runs the same in CI. (It's how I caught the infinite-scroll fill bug above.)

**CI.** GitHub Actions runs lint, the unit tests, a production build, and the E2E suite on every
push and pull request.

## What I'd do next

- Restore scroll on the _browser_ back button too (the router resets scroll on link
  navigation, so that path currently isn't covered).
- Cross-browser E2E (Firefox/WebKit) and a coverage report in CI.
- A service worker (`@angular/pwa`) to precache route chunks, so lazy navigation works fully
  offline rather than only recovering once reconnected.
- If the favorites set grew large, revisit the storage choice (IndexedDB) and virtualize the
  grids.
