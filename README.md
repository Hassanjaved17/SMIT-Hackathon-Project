# MaintainIQ

AI-powered QR maintenance & asset history platform — built for the SMIT Final Hackathon (Track A/B scope: React + TypeScript + Tailwind, Supabase backend, QR code generation, AI issue triage).

**Scan. Report. Diagnose. Maintain.**

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (custom industrial "asset nameplate" design system)
- React Router
- Supabase (Postgres + Auth) — with a zero-config **local demo mode** fallback
- `qrcode.react` for QR generation
- Rule-based **AI Issue Triage** (structured, editable, safe by default — see `src/lib/aiTriage.ts`)

## Quick start (demo mode — no setup required)

```bash
npm install
npm run dev
```

The app runs immediately with **no Supabase credentials needed**. All data (assets, issues, maintenance records, history, and two demo accounts) is stored in `localStorage` so you can register assets, report issues, and run the full workflow end-to-end for evaluation.

Demo accounts:
- Admin: `admin@maintainiq.app` / `admin123`
- Technician: `tech@maintainiq.app` / `tech123`

Use **Reset demo data** on the dashboard to start over.

## Connecting real Supabase (production mode)

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor (creates tables, RLS policies, and seed assets).
3. Copy `.env.example` to `.env.local` and fill in your project URL and anon key.
4. Restart `npm run dev` — the app automatically detects the credentials and switches from `localStorage` to Supabase for every read/write (`src/lib/store.ts` is the single data-access layer; nothing else needs to change).
5. Enable Email/Password auth in Supabase Auth settings. New sign-ups write a `profiles` row with `role` (`admin` or `technician`).

## How the brief's requirements map to the code

| Requirement | Where |
|---|---|
| Unique asset code + duplicate rejection | `src/lib/store.ts` → `createAsset` |
| QR generation, download, copy link, "Open Public Asset Page" | `src/components/QRTag.tsx` |
| Public safe asset page (no login) | `src/pages/PublicAsset.tsx` (route `/a/:code`) — exposes only safe fields |
| Issue reporting with unique issue number | `src/components/ReportIssueForm.tsx`, `generateIssueNumber` |
| AI Issue Triage (title, category, priority, causes, checks, human review, timeout/error handling) | `src/lib/aiTriage.ts` + `ReportIssueForm` |
| Assignment + controlled status workflow (invalid transitions blocked) | `src/pages/AssetDetail.tsx` → `NEXT_STATUS` map |
| Maintenance record (notes, parts, cost, time) — resolution requires a note, cost can't be negative | `AssetDetail.tsx` → `MaintenanceModal` |
| Asset status auto-updates from issue status | `store.ts` → `ISSUE_TO_ASSET_STATUS` |
| Critical issue → asset marked Out of Service | `AssetDetail.tsx` → `markOutOfService` |
| Permanent, non-casually-editable history timeline | `store.ts` → `addHistory` (insert-only) |
| Next service date can't precede last service date | `store.ts` → `updateAssetServiceDates` + DB check constraint in `schema.sql` |
| Search & filters on dashboard | `src/pages/Dashboard.tsx` |
| Role-aware auth (Admin / Technician) | `src/context/AuthContext.tsx`, Supabase RLS in `schema.sql` |
| Landing page: navbar, hero, features, workflow, pricing, FAQ, footer | `src/pages/Landing.tsx`, `Navbar.tsx`, `Footer.tsx` |

## Notes on AI integration

`runTriage()` in `src/lib/aiTriage.ts` ships as a deterministic, keyword-based classifier so the whole app works offline with zero API keys — it already implements the brief's required loading/timeout/error/fallback states and structured JSON-shaped output. To use a real LLM in production, replace its body with a call to a **Supabase Edge Function** that holds your API key server-side (never call an AI API with a key from the frontend) and returns the same `AITriageResult` shape; everything downstream (review, edit, save) is unchanged.

## Project structure

```
src/
  components/   Navbar, Footer, QRTag, ReportIssueForm, NewAssetModal, ui primitives
  context/      AuthContext (Supabase auth or local demo auth)
  lib/          supabase.ts, store.ts (data layer), aiTriage.ts
  pages/        Landing, Login, Dashboard, AssetDetail, PublicAsset, ReportIssue, NotFound
  types/        shared domain types
supabase/
  schema.sql    tables, RLS policies, constraints, seed data
```

## Known trade-offs (given the time box)

- Evidence upload is stubbed (field exists end-to-end; wiring to Supabase Storage / Cloudinary is the next step).
- Demo-mode auth is client-side only — fine for local evaluation, not for production.
- AI triage is rule-based rather than a live LLM call, by design (see above).
