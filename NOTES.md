# FitTrack Lite — research & design notes

## Design mockup (reference)

Single composite image: [docs/design-mockup.png](docs/design-mockup.png)

### Screen inventory

1. **Dashboard** (`index.html` planned)
   - Header: logo + nav — Dashboard (active), Workouts, Add Workout
   - Three stat cards: Total Workouts, Calories Burned, Weekly Progress (progress bar)
   - **Daily Motivation** card (quote + attribution) — candidate for API Ninjas `quotes`
   - **Suggested focus** strip (e.g. “Try a Cardio workout today!”)
   - **Recent workouts** horizontal row of small cards (activity, duration, kcal, category tag)

2. **Workouts** (`workouts.html` planned)
   - Header variant: Add Workout link, hamburger (mobile nav pattern)
   - **Filter:** dropdown (e.g. “All” / by category)
   - **Search** input with icon
   - Grid of **≥6** workout cards: Running, Cycling, Yoga, Weight Lifting, HIIT, Pilates (example set); each shows duration, kcal, category badge (Cardio / Flexibility / Strength)

3. **Add Workout** (`add-workout.html` planned)
   - Fields: Workout Name, Category (select), Duration (mins), Calories Burned
   - **Find Exercises by Muscle:** dropdown + “Get Exercises” button → **Suggested Exercises** list (Push-Up, Bench Press, Chest Fly, etc.)
   - Primary CTA: **+ Add Workout**

### Palette (CSS variables — approximate)

| Role | Notes |
|------|--------|
| Primary / header | Green gradient (e.g. `#43A047` → `#66BB6A` or mockup-aligned greens) |
| Motivation card | Blue / sky gradient accent (distinct from green chrome) |
| Page background | White |
| Cards / panels | Light gray e.g. `#F5F5F5` |
| Text | Dark navy / near-black for body |

Tune exact hex values in `:root` when implementing; keep contrast accessible.

## API Ninjas (live widget)

- Base: `https://api.api-ninjas.com/v1/...`
- **Quotes** (fits “Daily Motivation”): e.g. `GET /v1/quotes?category=inspirational` (confirm params in [API directory](https://api-ninjas.com/api))
- Header: `X-Api-Key: <your key>`
- Note rate limits and that browser `fetch` exposes a client-side key unless you use a build-time inject or serverless proxy.

## Client-side data (no backend)

- **Workout library:** JavaScript array of objects (`name`, `duration`, `calories`, `category`, optional `icon` key or CSS class).
- **Muscle → exercises:** plain object or `Map` in JS (e.g. `chest: ['Push-Up', 'Bench Press', 'Chest Fly']`) populated when user clicks **Get Exercises**.

## Course alignment checklist

- [ ] Three views implemented
- [ ] ≥6 gallery items + real-time search/filter
- [ ] `fetch` widget + user-visible error/loading state
- [ ] Form validation with custom messaging (not only `required`)
- [ ] Responsive behavior for grid and/or navigation
- [ ] README + this file + mockup in repo
