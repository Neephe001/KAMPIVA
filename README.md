# Kampiva

The verified campus platform: **Market**, **Research**, **Stay** and **Move** on one KampivaID.
React 19 + Vite 8 + Tailwind 4 + React Router 8 (TypeScript).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve the build at http://localhost:4173
```

Needs Node 20.19 or newer.

## How it fits together

- `src/site/` public website: landing, pillar pages, providers, reviews, info pages, auth, and the `/app` shell.
- `src/screens/` + `src/components/` the in-app experience (opens at `/app` after login).
- `src/lib/session.ts` sign-in, account, and "where the visitor was going" (so login lands them back on their task).
- `src/lib/providers.ts`, `src/lib/providerFlow.ts`, `src/screens/ProviderOnboarding.tsx` one **Become a provider** entry; the person chooses Market, Research, Stay or Move and gets that service's own steps.
- `src/lib/reviews.ts`, `src/components/Reviews.tsx` ratings and reviews (public `/reviews` and in-app).

There is no backend yet: accounts, listings, reviews and provider applications persist in the browser (localStorage). Replace the functions in `src/lib/session.ts` and the stores in `src/lib/` with API calls when a server exists. Provider approval is simulated with a "Demo: mark approved" button on the dashboard.

Deploying a static host: `public/_redirects` (Netlify) and `vercel.json` already send every path to `index.html`.
