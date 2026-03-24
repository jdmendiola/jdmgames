# Game Collection Tracker

I built this project as a simple game tracker where you can add titles from a catalog, update progress, and rate completed games.

## Features

- Browse a catalog of games.
- Add any game to your collection.
- Track status: Not Started, In Progress, Completed.
- Rate games from 1-5 only when status is Completed.
- Remove games (with confirmation for In Progress).
- Keep Catalog and Collection in sync.
- Switch locale between English and French.
- Bonus: filter and sort directly in Catalog.

## Tech stack

- Next.js App Router
- React
- next-intl for localization
- CSS Modules
- Radix UI dependency included
- Storybook for component docs

## Run locally

1. Install dependencies.

```bash
npm install
```

2. Start the app.

```bash
npm run dev
```

3. Open one of these URLs.

- http://localhost:3000/en
- http://localhost:3000/fr

Useful app routes:

- Catalog: http://localhost:3000/en/catalog
- Collection: http://localhost:3000/en/collection

## Use the app in 60 seconds

1. Open Catalog.
2. Add a game.
3. Open Collection.
4. Change status.
5. Set a rating after marking a game Completed.
6. Go back to Catalog and confirm the card reflects updated status/rating.
7. Try removing and re-adding a game to verify restore behavior.

## Storybook

Run Storybook locally:

```bash
npm run storybook
```

Storybook URL:

- http://localhost:6006

Build static Storybook:

```bash
npm run storybook:build
```

Documented components:

- Primitive: StatusBadge
- Mid-level: GameCard
- Layout-level: AppHeader

## Scripts

- `npm run dev`: start Next.js dev server
- `npm run build`: production build
- `npm run start`: run production server
- `npm run lint`: run ESLint
- `npm run storybook`: start Storybook dev server
- `npm run storybook:build`: generate static Storybook output

## Architecture decisions

- Repository abstraction: persistence flows through `lib/repositories/gameRepository.js`, not direct localStorage calls in UI.
- Simulated delay: repository methods include ~300ms delay so loading states are visible.
- Routing: locale-aware app routes live under `app/[locale]/...`.
- State ownership: Catalog handles add/read-only indicators, Collection handles status/rating/remove mutations.
- Sync strategy: a custom browser event plus storage listener keeps pages consistent after updates.

## Component hierarchy

- Layout shell: `app/[locale]/layout.jsx`
- Catalog page feature: `components/catalog/CatalogClient.jsx`
- Collection page feature: `components/collection/CollectionClient.jsx`
- Reusable module-level components:
- `components/cards/GameCard.jsx`
- `components/ui/StatusBadge.jsx`
- `components/LocaleSwitcher.jsx`

## If I had more time

- Add stronger image fallback/loading handling.
- Add repository and interaction tests.
- Improve keyboard/accessibility auditing.
- Add visual regression checks for Storybook.
- Add optional bulk actions in Collection.

## The Submission checklist I followed:

1. Verify lint.

```bash
npm run lint
```

2. Verify app flow.

```bash
npm run dev
```

3. Verify Storybook.

```bash
npm run storybook
```

4. Before zipping, remove generated folders:

- `node_modules`
- `.next`
- `storybook-static` (optional; regenerate with `npm run storybook:build`)

5. Zip the project folder and submit.
