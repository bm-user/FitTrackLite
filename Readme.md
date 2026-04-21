# FitTrack Lite

*A lightweight web portal for beginners who want to stay consistent with workouts—without the noise of full-featured fitness apps.*

## Project pitch

FitTrack Lite is a fitness portal built as a small, focused website. It is aimed at people who are just starting to exercise and need a calm, straightforward place to explore workout ideas, see motivation or context from the web, and log what they did in one session.

Heavy fitness apps often add dashboards, subscriptions, and social features before someone has built a habit. FitTrack Lite deliberately stays small: a few clear pages, a consistent visual style, and interactions that work on a phone or a laptop. The goal is to lower the barrier to showing up again tomorrow.

Implementation uses **semantic HTML**, **CSS** (including variables aligned with the mockup: greens, neutrals, motivation accent), and **vanilla JavaScript** for filtering, dynamic lists, form validation with **custom messages**, and `fetch()` for the motivation widget.

## User persona

**Alex — “The consistent beginner”**

- Wants to move more and build a routine without drowning in complex dashboards or paywalled apps.
- Likes seeing **simple numbers** (workout count, calories, weekly bar) and **what to do next** (workout cards).
- Uses **phone and laptop** and expects the layout to stay usable when the grid stacks on small screens.
- Success means planning sessions regularly, browsing workouts confidently.

## Problem

Beginners often quit when tools feel like extra work:

- **No single calm home base** that combines motivation, planner, quick stats.
- **Hard to explore** “what could I do?” without a visual library and fast filter/search.
- **Forms feel rigid**—no helpful structure (e.g. category, muscle-based suggestions) and no human-readable errors.

FitTrack Lite addresses this with a **dashboard + library + add** flow, a **card-based UI**, and validation that explains what to fix.

## Solution

Planned **multi-page** structure (three distinct views):

| View | File (planned) | Purpose |
|------|----------------|---------|
| **Dashboard** | `index.html` | Header/nav, stat cards, **weekly planner** (7 days, checkboxes, progress)—assign workouts from the library via day links; state in `localStorage`; optional future blocks: daily motivation (API), suggested focus, recent workouts |
| **Workouts** | `workouts.html` | Filter dropdown, search, responsive card grid (≥6 workouts), category tags; **assign mode** with `?assignDay=Mon`…`Sun` appends picks to the planner |
| **Add Workout** | `add-workout.html` | Full form, muscle → suggested exercises (local JS data), submit with custom validation |

Shared **CSS variables** implement the mockup’s palette and spacing; **one complex responsive pattern** (e.g. workout grid: multi-column desktop → stacked mobile, and/or header/nav behavior) satisfies the rubric.

## Key features

| Feature | Description |
|--------|-------------|
| Dashboard | Stats (e.g. total workouts, calories, weekly progress bar); **weekly planner**: Mon–Sun cards, multiple workouts per day, check off items, bar/checkbox summary tied to planner completion; persisted in **`localStorage`** (`fittrack-weekly-planner`, week key = Monday date). Planned: API-driven motivation, suggestion strip, recent workout cards |
| Workouts gallery | ≥6 items as cards with icons/names/duration/calories/tags; **Filter** + **Search**; live filtering; **assign to planner** from `workouts.html?assignDay=…` |
| Add Workout | Name, category, duration, calories; muscle selector + **Get Exercises** → suggested list; **+ Add Workout**; JS validation + custom errors |
| Live widget | `fetch()` from API Ninjas (e.g. quotes) in the Daily Motivation area; loading/error states |
| Responsive + semantic | Landmark structure; layout that **changes meaningfully** between mobile and desktop |

## Design reference

Low-fidelity / visual target for implementation:

![FitTrack Lite UI mockup — Dashboard, Workouts, Add Workout](docs/design-mockup.png)

*Source: project mockup (`docs/design-mockup.png`). Implementation may simplify icons or data while keeping layout and hierarchy.*

## Live demo

**Production URL:** [https://fit-track-lite.vercel.app/](https://fit-track-lite.vercel.app/)

**Repository:** [https://github.com/bm-user/FitTrackLite](https://github.com/bm-user/FitTrackLite)

## Tech stack

- HTML5, CSS3 (**custom properties** for theme colors)
- JavaScript (DOM, `fetch` for `data/workouts.json`, planner state in **`localStorage`**, shared **`js/planner-state.js`** for week-scoped planner data)
- Static hosting (Vercel / Netlify / GitHub Pages)
- [API Ninjas](https://api-ninjas.com/api) for Daily Motivation quotes (see **Challenges & solutions** below and [NOTES.md](NOTES.md))

## Challenges & solutions

**Challenge — Keeping the API Ninjas key off the client.** The daily quote uses `fetch()`, but putting an API key in browser JavaScript would expose it to anyone who views the source. The dashboard needs a working quote on production without leaking secrets.

**Solution — Serverless proxy on Vercel.** The app calls a same-origin URL (`/api/ninjas-quote`, configured via the `fittrack-quotes-proxy` meta tag). A small Vercel serverless function adds the `X-Api-Key` header and forwards the request to API Ninjas. The browser never sees the key; `js/daily-quote.js` still handles loading text, HTTP errors, and user-visible fallbacks if the request fails.

## Research

See **[NOTES.md](NOTES.md)** for palette notes, screen inventory, API choice, and implementation notes.

## Summary

A clean, modern FitTrack Lite experience: **dashboard** with a **weekly planner** (library → assign → check off, all in the browser), **workouts** for discovery and planner assignment, **add workout** for logging—with a unified green-and-card visual language.
