<div align="center">

# 🔧 MaintainIQ

**AI-Powered QR Maintenance & Asset History Platform**

*Scan. Report. Diagnose. Maintain.*

Every physical asset deserves a service record, not a rumor.

[![Live Demo](https://img.shields.io/badge/demo-live-F2A93B?style=for-the-badge)](https://maintain-iq-mu.vercel.app)
[![License: MIT](https://img.shields.io/badge/license-MIT-0F1215?style=for-the-badge)](./LICENSE)
[![Built with React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Powered by Supabase](https://img.shields.io/badge/Supabase-Postgres_%2B_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

[Live Demo](https://maintain-iq-mu.vercel.app) · [Report an Issue](https://maintain-iq-mu.vercel.app/report) · [Track an Issue](https://maintain-iq-mu.vercel.app/track)

</div>

---

## Overview

In most organizations, maintenance requests live scattered across paper registers, phone calls, and WhatsApp threads. Nobody can answer basic questions on demand: *Which assets keep failing? Who reported this? What was actually done about it?*

**MaintainIQ** gives every physical asset — a classroom projector, a lobby AC unit, a fire extinguisher — a digital identity: a QR-accessible public page, a structured issue-reporting flow with AI-assisted triage, a controlled repair workflow, and a permanent, tamper-resistant history.

Built in an 8-hour Coding Night Hackathon at **SMIT (Saylani Mass IT Training)** — Track B (Supabase/Firebase track).

---

## ✨ Features

### Core workflow
- 🏷️ **Asset registry** — unique asset codes, categories, locations, condition tracking, duplicate-code rejection
- 📱 **QR-accessible public pages** — scan a tag, see safe asset info, report an issue — no login required
- 📝 **Issue reporting** — unique issue numbers, priority levels, category tagging, photo evidence
- 🤖 **AI Issue Triage** — turns a plain-language complaint ("the AC is leaking and making noise") into a structured title, category, priority, possible causes, and safe initial checks — always human-reviewable before saving
- 👷 **Role-based dashboards** — separate views and permissions for Admins and Technicians, enforced at the database level (Postgres RLS), not just hidden UI
- 🔄 **Controlled status workflow** — issues and assets move through validated state transitions only (e.g. an issue can't skip straight to Resolved without a maintenance note)
- 📸 **Evidence uploads** — photos attached at both the reporting and resolution stages, stored in Supabase Storage
- 🧾 **Downloadable issue receipts** — reporters get a printable/PDF-able receipt with a QR code and tracking reference the moment they submit
- 🔍 **Issue tracking by reference number** — anyone can check status later at `/track` without an account
- 📜 **Permanent asset history** — every meaningful action is logged and insert-only, never silently editable
- 🔎 **Search & filters** — across both assets and issues, by status, category, and keyword

### Engineering details worth knowing about
- **Row-Level Security everywhere** — technicians can only act on issues assigned to them; only admins can manage assets; enforced in Postgres, not just the frontend
- **Zero-config demo mode** — the entire app runs against `localStorage` with no Supabase project needed, useful for quick evaluation
- **No exposed API keys** — AI triage runs as a safe, deterministic client-side classifier by design (see [AI Integration](#-ai-integration) below) rather than calling a keyed LLM API from the browser

---

## 🧱 Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 — custom "industrial asset nameplate" design system |
| Routing | React Router v7 |
| Backend | Supabase — Postgres, Auth, Storage, Row-Level Security |
| QR codes | `qrcode.react` |
| Icons | `lucide-react` |
| AI Triage | Rule-based structured classifier (see below) |
| Deployment | Vercel |

---

## 🚀 Quick Start

### Option A — Instant demo (no setup)

```bash
git clone https://github.com/Hassanjaved17/SMIT-Hackathon-Project.git
cd SMIT-Hackathon-Project
npm install
npm run dev
```

Runs immediately against `localStorage` — no credentials needed. Two demo accounts are seeded automatically:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@maintainiq.app` | `admin123` |
| Technician | `tech@maintainiq.app` | `tech123` |

Use **Reset demo data** on the dashboard to start fresh at any time.

### Option B — Real Supabase backend

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the Supabase SQL Editor — creates tables, RLS policies, and seed assets.
3. Run the patches in `sql-patches/` **in numeric order** — each is idempotent and documented inline:

   | Patch | Purpose |
   |---|---|
   | `1-profile-auto-create-trigger.sql` | Auto-creates a `profiles` row on signup; includes a backfill query for existing accounts |
   | `2-role-enforced-rls-patch.sql` | Tightens RLS from "any authenticated user" to real admin/technician authorization |
   | `4-enable-realtime.sql` | Enables Supabase Realtime on core tables |
   | `5-evidence-storage-bucket.sql` | Creates the `evidence` storage bucket + upload/read policies |

4. Copy `.env.example` → `.env.local`, fill in your project URL and anon key.
5. Enable Email/Password auth in **Supabase → Authentication → Providers**.
6. `npm run dev` — the app auto-detects credentials and switches from `localStorage` to Supabase for every read/write. `src/lib/store.ts` is the single data-access layer; nothing else needs to change.

---

## 🗂️ Project Structure

```
src/
  components/   Navbar, Footer, QRTag, ReportIssueForm, IssueReceipt,
                NewAssetModal, EditAssetModal, AnalyticsPanel, ui primitives
  context/      AuthContext — Supabase auth or local demo auth
  lib/          supabase.ts   Supabase client
                store.ts      single data-access layer (demo + Supabase)
                aiTriage.ts   structured issue triage
                evidence.ts   photo upload (Supabase Storage / demo fallback)
  pages/        Landing, Login, Dashboard, AssetDetail, PublicAsset,
                ReportIssue, TrackIssue, NotFound
  types/        shared domain types
supabase/
  schema.sql    tables, RLS policies, constraints, seed data
sql-patches/    incremental, numbered, idempotent SQL migrations
```

---

## 🔐 Role-Based Access

| Role | Can do |
|---|---|
| **Admin** | Register/edit assets, view all issues, assign technicians, manage service schedules, mark assets Out of Service, view analytics |
| **Technician** | View assigned issues, progress their status, log maintenance notes/parts/cost/evidence, resolve assigned issues |
| **Public reporter** | View safe asset info, report issues with evidence, track status by reference number — no account needed |

Authorization is enforced with Postgres Row-Level Security policies (`supabase/schema.sql`, `sql-patches/2-role-enforced-rls-patch.sql`) — a technician cannot update someone else's assigned issue even by calling the API directly.

---

## 🤖 AI Integration

`runTriage()` in `src/lib/aiTriage.ts` ships as a deterministic, keyword-based classifier so the app works fully offline with zero API keys, while still implementing every behavior the brief requires: structured JSON-shaped output, loading state, timeout handling, and graceful fallback to manual entry.

To swap in a real LLM in production: replace the body of `runTriage` with a call to a **Supabase Edge Function** that holds your API key server-side — never call a keyed AI API from the browser — and return the same `AITriageResult` shape. Everything downstream (human review, editing, saving) is unchanged.

---

## 🛣️ Roadmap / Known Trade-offs

- [ ] Live LLM-backed triage via Supabase Edge Function (currently rule-based by design)
- [ ] Rate limiting on public issue-reporting and AI endpoints
- [ ] Email notifications on assignment/resolution
- [ ] Code-splitting to shrink the production bundle

---

## 🙏 Acknowledgements

Built during the **Coding Night Final Hackathon** at **SMIT — Saylani Mass IT Training**. Thanks to the instructors and organizers for the brief that pushed this past a QR-code toy demo into an actual role-authorized, persisted, end-to-end product.

---

## 📄 License

Licensed under the [MIT License](./LICENSE) — see the file for details.

---

<div align="center">

Built by **Hassan** · [GitHub](https://github.com/Hassanjaved17) · [Live Demo](https://maintain-iq-mu.vercel.app)

</div>