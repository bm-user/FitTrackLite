# FitTrack Lite — research & implementation notes (final)

**Production:** [https://fit-track-lite.vercel.app/](https://fit-track-lite.vercel.app/)  
**Repository:** [https://github.com/bm-user/FitTrackLite](https://github.com/bm-user/FitTrackLite)

This file keeps early research and a **snapshot of what actually shipped** for the course final project and future reference.

---

## Design mockup (reference)

Low-fidelity / layout target: [docs/design-mockup.png](docs/design-mockup.png)  
Optional wireframe source: [docs/FitTrackLite-wireframe.pptx](docs/FitTrackLite-wireframe.pptx)

---

## What shipped (three views)

### 1. Dashboard — `index.html`

- **Header:** Brand, hamburger **mobile nav** (`js/nav.js`), links to all three views.
- **Daily Motivation:** Inspirational quote section; **`fetch()`** via **`js/daily-quote.js`**. The page sets `<meta name="fittrack-quotes-proxy" content="/api/ninjas-quote">` so the browser calls a **same-origin proxy** on Vercel (`api/ninjas-quote.js`), which adds the API Ninjas key server-side ([API directory](https://api-ninjas.com/api)). Loading copy, fallback text, and error paths keep the UI usable if the proxy or API fails.
- **Weekly Planner:** Mon–Sun cards rendered by **`js/planner.js`**; items stored in **`localStorage`** key `fittrack-weekly-planner` with week scope via **`js/planner-state.js`** (`mondayKey()`, migrate/normalize helpers). Users check off rows; **Weekly progress** bar and percentage reflect completion. **Clear all** clears every day’s items and persists immediately.
- **Not in this build:** Separate “three stat cards” row, “suggested focus” strip, and “recent workouts” carousel from the original brainstorm—the dashboard stayed focused on quote + planner + progress.

### 2. Workouts — `workouts.html`

- **Filter** (category) + **Search** with **live filtering** as the user types (`js/workouts.js`).
- **Card gallery:** Workouts load from **`data/workouts.json`** and merge with **`localStorage`** user-added workouts (`fittrack-user-workouts`). More than six catalog items; category tags (Cardio / Flexibility / Strength).
- **Assign mode:** Links from the planner open `workouts.html?assignDay=Mon`…`Sun`; clicks append to that day in the planner. Cards already on that day stay **highlighted** (multi-select visual) based on planner state.

### 3. Add Workout — `add-workout.html`

- Functional form with **custom validation** and summary errors in **`js/add-workout.js`** (ranges, whole numbers, messages—not relying on HTML5 `required` alone).
- **Muscle → suggested exercises:** Local data / lookup + exercise search UX as implemented in the page scripts (no backend).

---

## Palette & layout system

Implemented as **CSS custom properties** in **`css/styles.css`** (`:root`): primary greens, neutrals, card borders, spacing scale, radii, typography tokens. One **complex responsive** pattern: e.g. **planner grid** and **workout grid** reflow from multi-column desktop to stacked/narrow mobile; header nav collapses to menu button.

---

## API Ninjas (live widget) — architecture

- **Public API:** [API Ninjas](https://api-ninjas.com/api) quotes endpoint; header `X-Api-Key` on the server only.
- **Production:** Vercel serverless **`api/ninjas-quote.js`** forwards to API Ninjas so the **browser never holds the secret key**.
- **Local dev:** Without the proxy configured, `daily-quote.js` shows **fallback** copy instead of failing silently.

---

## Client-side data (no traditional backend)

| Data | Where |
|------|--------|
| Default + seed workouts | `data/workouts.json` → merged in JS |
| User-created workouts | `localStorage` key `fittrack-user-workouts` |
| Weekly planner rows | `localStorage` key `fittrack-weekly-planner` |

---

## Course alignment checklist (final)

- [x] **Three distinct views** — `index.html`, `workouts.html`, `add-workout.html`
- [x] **Data gallery** — ≥6 items as cards; **real-time** category + search filter
- [x] **Live widget** — `fetch()` + loading/fallback/error UX (Daily Motivation / quotes)
- [x] **Functional form** — custom validation messaging (`add-workout.js`)
- [x] **Responsive + semantics** — landmarks, grids/nav behavior, CSS variables for a cohesive system
- [x] **README + NOTES + mockup** — see [README.md](README.md) and [docs/design-mockup.png](docs/design-mockup.png)
- [x] **Deployment** — Vercel production URL above; Git workflow per course (commits/branches as you documented)

---

## Historical brainstorm (original screen inventory)

The bullets below were **early planning**; compare to **What shipped** above for accuracy.

1. Dashboard — originally imagined three stat cards + suggested focus + recent workouts; shipped quote + planner + weekly progress instead.
2. Workouts — filter, search, ≥6 cards — **aligned with shipped app.**
3. Add Workout — form + muscle suggestions + validation — **aligned with shipped app.**

---

## References

- [API Ninjas API directory](https://api-ninjas.com/api)
- Quote proxy implementation: `api/ninjas-quote.js`
- Planner persistence: `js/planner.js`, `js/planner-state.js`
