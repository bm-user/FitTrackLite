# FitTrack Lite

*A lightweight web portal for beginners who want to stay consistent with workouts—without the noise of full-featured fitness apps.*

## Project pitch

FitTrack Lite is a **niche fitness portal** built as a small, focused website. It is aimed at people who are just starting to exercise and need a calm, straightforward place to **explore workout ideas**, **see motivation or context from the web**, and **log what they did** in one session.

Heavy fitness apps often add dashboards, subscriptions, and social features before someone has built a habit. FitTrack Lite deliberately stays small: a few clear pages, a consistent visual style, and interactions that work on a phone or a laptop. The goal is to lower the barrier to **showing up again tomorrow**.

The site is implemented with **semantic HTML**, **CSS** (including variables for a unified palette and spacing), and **vanilla JavaScript** for filtering, form validation, and a live data widget powered by a public API ([API Ninjas](https://api-ninjas.com/api)).

## User persona

**Alex — “The consistent beginner”**

- Wants to move more and build a routine, but gets overwhelmed by complex apps and too many metrics.
- Cares about **time**, **how hard it felt**, and **rough calories or effort** not elite performance data.
- Uses a phone for quick checks and a laptop when planning the week.
- Success means **logging most sessions** and **recognizing progress** without dreading the tool.

## Problem

Beginners often drop off because the tools they use feel like **extra homework**:

- Tracking is **inconsistent** when the UI is busy or buried behind accounts and paywalls.
- There is **no simple, visual** way to browse “what could I do today?” and narrow it down quickly.
- Forms and feedback can feel **cold or cryptic**, so people stop trusting what they entered.

FitTrack Lite addresses this by pairing a **readable workout gallery**, a **dedicated log experience with clear validation messages**, and a **small live widget** (for example, weather or a daily quote) that makes the home page feel connected to real life.

## Solution

- **Multi-view structure:** separate areas for **home** (overview + live widget), **workouts** (searchable gallery), and **log** (functional form)—implemented as multiple HTML pages for clarity.
- **Design system:** shared CSS variables for color, spacing, and type so the portal feels like one product.
- **Responsive layout:** at least one component (for example, the workout card grid or navigation) **changes meaningfully** between mobile and desktop.
- **Client-side behavior:** gallery data lives in a local JavaScript array; filtering updates as the user types; the form uses **custom error messaging** beyond HTML5 `required` alone.

## Key features

| Feature | Description |
|--------|-------------|
| Multi-view portal | At least three distinct views (e.g. home, workouts, log). |
| Workout gallery | Six or more items rendered as cards; real-time search/filter. |
| Live widget | `fetch()` to a public API (API Ninjas) for quotes and excersices with loading and error handling. |
| Validated log form | Functional form with custom inline validation messages. |
| Responsive + semantic layout | Meaningful mobile/desktop differences; semantic landmarks and headings. |

## Layout sketch

Add your **sketch** to the repository (for example `docs/sketch.png`) and link it here:
(docs/sketch.png)

## Live demo

**Production URL:** 

**Repository:** 

## Tech stack

- HTML5 (semantic structure)
- CSS3 (layout, responsive rules, **CSS custom properties**)
- JavaScript (DOM updates, `fetch`, form validation)
- Static hosting (Vercel / Netlify / GitHub Pages)
- [API Ninjas](https://api-ninjas.com/api) for the live widget (API key required; see project notes)

## Challenges & solutions

- Getting a responsive grid or navigation to behave at a specific breakpoint
- Validation edge cases (empty strings, min/max duration, date rules)

## Research


## Summary

A clean, easy-to-use dashboard that helps users log workouts, browse ideas, and stay motivated—on their terms.
