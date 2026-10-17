# FactoryLens — From Demo to Real App: Planning

## 1. What exists today (recap)

Next.js 15 / React 19 app. All "data" lives in `lib/mockData.ts` + `lib/connectivityData.ts`,
loaded into a single React Context (`lib/factoryStore.tsx`). No database, no auth, no real
sensor ingestion. The only live network call is Gemini, from `app/api/gemini/assistant/route.ts`,
with a canned fallback when no API key is set. Everything resets on page refresh.

---

## 2. App flow: why each menu exists

The nav (`lib/navigation.ts`) is organized into 5 hubs, each a stage in the same loop:
**see something is wrong → understand why → decide what to do → do it → verify it worked.**
The whole UI is built around one scripted scenario (Line 3 filling-valve failure) to demonstrate
that loop end-to-end; every module either feeds into it or consumes its output.

### Operations hub — "What's happening right now"
- **Overview (Dashboard)** — plant-wide KPIs (output, loss, defect rate, downtime, waste,
  energy) plus a ranked list of today's top issues. This is the entry point: it exists to answer
  "where should I look first" by surfacing the highest-loss problem (Line 3, 62% of loss).
- **Lines (Production)** — drill from "the plant" to "one line." Shows target vs. actual
  throughput and which machines sit on that line. Exists because Dashboard is too aggregated to
  act on.
- **Alerts** — the triage inbox. Every anomaly detected anywhere (machine, quality, material,
  downtime, waste, energy) lands here as one unified list, filterable by severity/category/status.
  Exists because issues come from many subsystems and someone needs one place to scan all of them.

### Analytics hub — "Why, and how much is it costing"
- **Losses (Loss Explorer)** — same financial loss number, sliced by machine / line / product /
  shift / downtime reason / waste reason. Exists to answer "where is the money actually going,"
  independent of which alert triggered it.
- **Investigations** — the root-cause workspace for a single incident: timeline, sensor-delta
  comparison against baseline, multi-signal triangulation (machine telemetry × material batch ×
  waste), ranked root causes with evidence, business impact, and recommended actions you can
  approve/assign/dismiss. This is the hub of the whole app — Alerts, Machines, Materials, and
  Waste all have "Investigate" buttons that land here.
- **Downtime** — stoppage ledger (equipment failure, changeover, material shortage, etc.) with
  cost per incident. Exists because "downtime" is its own loss category distinct from slow-running
  lines, and maintenance/ops need the raw log, not just the aggregate.

### Materials hub — "What's going into (and being wasted from) production"
- **Inventory (Materials)** — warehouse stock, lot/batch traceability (CoA status, supplier,
  expiry), and scrap logging, with mutation actions (receive batch, log scrap, adjust stock).
  Exists because raw-material quality (e.g., a viscosity-out-of-spec milk lot) is a recurring
  root cause, so the batch genealogy has to be inspectable and correlatable with machine state.
- **Quality** — inspection records and dispositions (Approved/Hold/Scrap/Rework) per batch/line.
  Exists to connect "defect rate went up" to a specific SKU/line/batch, the other half of the
  machine-vs-material correlation story.
- **Waste (WasteEnergy)** — scrap ledger, ingredient yield-vs-BOM variance, and energy draw per
  machine, all three because they're the three ways inefficiency shows up physically (material
  lost, ingredient over-consumed, power wasted) and each needs machine attribution.

### Equipment hub — "The physical assets and who's fixing them"
- **Machines** — per-machine live telemetry (vibration, temperature, pressure, cycle time, RPM),
  health score with an explainable formula, PLC/gateway tag mapping, and linked
  maintenance/downtime/waste history. Exists as the OT (operational technology) ground truth that
  Investigations cites as evidence.
- **Maintenance** — work-order history and recurring-failure detection. Exists because
  "what happened" (Investigations) has to be backed by "what we actually repaired" (Maintenance),
  closing the reliability-engineering loop.
- **Actions** — the task queue: assign a recommendation to a technician, track status, and record
  the actual outcome on completion. Exists because an investigation's recommendation is worthless
  until someone owns it and reports back — and completing a task here is what resolves the
  investigation and alert and updates the dashboard. This is the "do it" and "verify it worked"
  step of the loop.

### Settings hub — "Configure the system, don't just react to it"
- **Copilot (AI Assistant)** — free-form chat grounded in current plant state, for questions that
  don't map to a specific alert. Exists as the catch-all / natural-language front door.
- **Configuration (Settings)** — anomaly thresholds (what counts as a problem), data-source/gateway
  management (how telemetry gets in), org/facility info, user roles, and AI sensitivity. Exists
  because every number shown elsewhere in the app is downstream of a threshold or a connection
  defined here.

**The golden path the demo is built to tell:** Dashboard flags Line 3 → AI Diagnosis opens the
Investigation drawer → root cause = valve diaphragm wear (aggravated by a high-viscosity milk lot)
→ approve recommendation → task auto-created in Action Center → technician completes it with an
outcome → investigation + alert resolve, Line 3's dashboard numbers improve live. Every other
module is a detail view that this path can route through or cite as evidence.

---

## 3. Gaps between demo and a real app

| Area | Today | Needed for real use |
|---|---|---|
| Persistence | `useState` seeded from `mockData.ts`; resets on refresh | Real database |
| Auth | Click a name in Header to "become" a different user; role switch has no enforcement | Real login + enforced RBAC |
| Telemetry | `connectivityData.ts` hardcodes PLC tags/values | Real OT ingestion pipeline |
| Alerting | `OperationalThresholds` exist in Settings but nothing evaluates them | Rules/streaming engine |
| Root-cause AI | Hero investigation is fully scripted (one hardcoded case) | Real correlation + Gemini synthesis |
| CSV ingestion | `DataIngestionModal` fakes parsing/validation with a `setTimeout` | Real upload + parse + validate pipeline |
| Multi-tenancy | `Organization`/`Factory` modeled but only one org/factory exists | **Decided: single-tenant.** Keep `Organization`/`Factory` tables for structure (a company can still have multiple factories), but no cross-company isolation needed — one deployment, one company. |
| Realtime | All client state; "Just now (4s ago)" strings are static | WebSocket/SSE push |

---

## 4. Target architecture

```
Next.js app (keep)
 ├─ UI layer: same modules, swap `useFactory()` context reads for
 │   data-fetching hooks (React Query/SWR) hitting real API routes
 ├─ API layer: Next.js route handlers backed by an ORM (Prisma or
 │   Drizzle) over Cloud SQL for PostgreSQL
 ├─ Auth: NextAuth/Clerk (single-tenant: no org-signup flow needed,
 │   just users + roles) — session → User → role scope
 ├─ Relational DB (Cloud SQL for PostgreSQL, via Firebase Data Connect
 │   or direct Prisma/Drizzle connection): org, factory, line, machine,
 │   product, material, batch, alert, investigation, task, user — i.e.
 │   everything currently in mockData.ts, as real tables with foreign
 │   keys. Chosen over Firestore because the app is join- and
 │   aggregation-heavy (Loss Explorer slices, Investigation
 │   correlations) — see decision note below.
 ├─ Time-series DB (Timescale/Influx, or Firestore if staying all-in on
 │   Firebase) for raw sensor streams — separate from Postgres because
 │   sampling rates (1–100 Hz per tag) don't belong in a relational
 │   "business" table
 ├─ Ingestion workers: OPC-UA/MQTT/Modbus-TCP clients (or a vendor
 │   gateway) writing into the time-series store; a CSV/file pipeline
 │   for batch imports
 ├─ Rules/alerting engine: evaluates OperationalThresholds against
 │   incoming telemetry, writes Alert rows, pushes notifications
 ├─ AI layer: Gemini call stays, but the "evidence" it reasons over
 │   (sensor deltas, correlations, root-cause ranking) should be computed
 │   from real data, not hardcoded strings
 └─ Realtime: WebSocket/SSE channel for live dashboard + alert updates
```

`lib/types.ts` already defines almost the entire relational schema — it's the best starting
point for Prisma/Drizzle models. `lib/factoryStore.tsx`'s mutator functions
(`approveRecommendation`, `createActionTaskFromRecommendation`, `updateTaskStatus`, `assignTask`,
`completeTaskWithOutcome`, `addMaterialBatch`, `addWasteRecord`, `adjustMaterialStock`,
`updateThresholds`, `addDeviceConnection`, `testConnection`) are the exact list of write
operations the real API needs to expose.

**Decision: Cloud SQL for PostgreSQL over Firestore.** The domain is deeply relational
(`Factory → ProductionLine → Machine`, `Material → MaterialBatch`, `Alert → Investigation →
RecommendedAction → ActionTask`) and several core screens are join/aggregation workloads —
Loss Explorer slices one loss figure by machine/line/product/shift/reason (`GROUP BY` queries),
and Investigations correlates records across machine telemetry, material batches, and waste
records around a time window. Firestore would require heavy denormalization and client-side
joining for these; Postgres does it natively. Staying on Firebase as a platform is fine — use
Cloud SQL for PostgreSQL (optionally fronted by Firebase Data Connect) rather than Firestore as
the primary store. Firestore remains a reasonable option later only for high-frequency raw
telemetry (no joins needed), not for the business/relational data.

---

## 5. Phased roadmap

1. **Foundation** — stand up Postgres + ORM, port `lib/types.ts` interfaces to schema, migrate
   `mockData.ts` content into seed data. Add real auth (login, session, org/factory scoping).
2. **CRUD parity** — build API routes for every mutator listed above; swap `factoryStore.tsx`
   from local `useState` to data-fetching hooks. App behaves identically but data persists and is
   shared across sessions.
3. **RBAC enforcement** — Admin/Manager/Viewer actually gate which mutations/pages are allowed
   (today the role switcher is cosmetic).
4. **Telemetry ingestion** — real OT client(s) for at least one protocol, writing to a
   time-series store; Machines module reads live tag values instead of static numbers.
5. **Alerting engine** — background job/stream consumer evaluates thresholds from Settings
   against live telemetry + quality + waste data, creates real `Alert` rows and notifications.
6. **Investigation engine** — replace the single hardcoded hero investigation with real
   correlation logic (e.g., statistical anomaly detection joined across machine/material/waste
   tables around an alert's time window); keep Gemini for narrative synthesis of real evidence.
7. **Data ingestion pipeline** — real CSV/file upload, schema validation, and mapping (replacing
   the simulated `DataIngestionModal` flow), likely via a queue/background worker.
8. **Realtime + polish** — WebSocket/SSE push for dashboard/alerts, multi-tenant hardening
   (row-level security per organization/factory), audit log, deployment (the existing
   `firebase-tools` dependency and `output: 'standalone'` in `next.config.ts` suggest Cloud
   Run/Firebase was the intended target).

---

## 6. Decisions made

- **Tenancy: single-tenant.** One deployment, one company (a company may still have multiple
  factories — that's just `Organization → Factory[]`). No cross-company data isolation, no
  org-signup flow, no per-tenant billing logic needed.
- **Database: Cloud SQL for PostgreSQL**, not Firestore. See decision note in section 4.
  Platform stays Firebase (consistent with the existing `firebase-tools` dependency and
  `output: 'standalone'` in `next.config.ts`); Data Connect or a direct Prisma/Drizzle
  connection to Cloud SQL are both viable, direct Prisma/Drizzle gives more control.
- **OT protocol: MQTT**, not OPC-UA — simplest to stand up locally (Mosquitto), good enough to
  prove the ingestion pipeline. A real OPC-UA client is still a reasonable future addition for an
  actual factory connection, just not needed to validate the architecture.
- **Raw telemetry storage: a plain Postgres table (`SensorReading`), not Timescale/Influx** — at
  demo scale a plain indexed table is simpler and avoids a second DB engine; easy to swap later
  if real throughput ever demands it.
- **AI root-cause ranking: a deterministic heuristic, not a statistical model or an LLM
  decision.** Root causes are ranked in code by real evidence (live telemetry deviation from
  threshold, correlated material/waste records) — always correct, always testable. Gemini is
  used only to turn the ranked evidence into readable prose, with a templated fallback when it's
  unavailable; it can never produce a wrong root-cause ranking, only better or worse writing.

## 7. Open decisions still to make

- Real continuous background alerting (a job that evaluates thresholds on a timer, as originally
  envisioned in section 5) vs. staying with the on-demand "Run Threshold Check" button built in
  Phase 5 — deliberately chosen over a background poller to avoid a resolved incident
  silently re-alerting once the live sensor and the scripted "fix" diverge.
- Whether to extend Phase 5/6 (alerting + investigation) to the other 5 threshold types (defect
  rate, waste, downtime, energy, production variance) and more machines — currently only
  vibration on `mach-m03` has a real live feed behind it.

## 8. Status as of Phase 6 (2026-10-16) and known gaps

**Done:** Phases 1–6 (Foundation, CRUD parity, RBAC enforcement, telemetry ingestion, alerting,
investigation engine) — all built, verified end-to-end via API/DB-level checks each phase.
**Skipped for now:** Phase 7 (CSV ingestion pipeline) — self-contained, not a blocker for
anything else, deliberately deferred as lower demo value than the phases that came before it.
**Remaining:** Phase 8 (realtime push, multi-tenant hardening, audit log, deployment).

Known gaps/deferred items, not full phases of their own:

- **No UI role-gating.** A Viewer still sees every mutation button (Approve, Complete, Reset,
  etc.) — it just fails with a 403 toast. Phase 3 deliberately scoped to server-side enforcement
  only; hiding/disabling controls per role across every module is real, separate UI work.
- **Alerting is on-demand, not continuous** (see section 7 above).
- **Telemetry/alerting/investigation all effectively only cover `mach-m03`'s vibration metric.**
  Extending to more machines/metrics is mechanical (same pattern) but not yet done.
- **No automated test suite.** Every phase was verified manually (`curl`/`psql`) during
  implementation, never codified into tests.
- **Google AI Studio / GitHub sync compatibility with this Postgres-based stack is unresolved** —
  researched (AI Studio's native backend is Firebase Firestore, not Postgres), not tested.
- **Task assignment isn't enforced — a design question, not a bug.** `ActionTask.assignedTo` is
  just a display label; `ActionsModule.tsx` only filters by status, never by `currentUser`, so
  any Manager/Admin can act on any task regardless of who it's nominally assigned to (confirmed
  during manual browser testing 2026-10-17 — an Admin completed a task "assigned" to a different
  seeded Manager with zero friction). Whether that's actually wrong is open: real ops teams often
  do let any qualified person pick up any open task. If a personalized "My Tasks" view or real
  assignment enforcement is wanted later, `currentUser.name` would need to match `assignedTo`
  (or a proper `assignedToUserId` FK added) and `ActionsModule.tsx` would need a "mine" filter.

## 9. Manual browser testing pass (2026-10-17)

First full manual click-through in an actual browser (Phases 2–6 were previously only verified
via `curl`/`psql`). 14 test cases covering login, the hero investigation drawer, the full
approve→in-progress→complete cascade, refresh-persistence, Materials, Settings thresholds, live
Machine telemetry, the new on-demand alerting + AI investigation generation, all three RBAC
tiers, Notifications, and Reset Demo — all passed functionally. Found 3 real issues, not yet
fixed (next pass):

1. **No loading/disabled state on mutation buttons or login/logout.** Every button in
   `lib/mutations.ts`'s pattern fires the request with no pending indicator — a slow network
   could make a user double-click and double-fire a mutation.
2. **Several list queries have no explicit `ORDER BY`, so row order visibly shifts after a
   write.** Confirmed on the Machines live-telemetry card and the Notifications list; likely
   present in other `findAll`-style repository functions too (needs an audit, not just these two
   fixes).
3. **`components/modules/InvestigationsModule.tsx`'s detail page is mostly hardcoded, pre-existing
   placeholder copy** ("Why did Line 3 production drop 14%?", "$4,650", "3h 18m", etc.) that
   doesn't read from the actual `Investigation` object — so it shows the same text regardless of
   which investigation (hero or AI-generated) is open. Predates this session's backend work;
   `InvestigationDrawer.tsx` (the slide-over panel) does **not** have this problem and correctly
   displays real data.

(All 3 fixed later the same day — see section 10.)

## 10. Merge with `main` + Incident Management PRD gap analysis (2026-10-17)

Merged in `theresa1912t/ForgeX`'s `main` branch (LactaPure Dairy rebrand, 3-tab investigation
redesign, nav refactor). One side effect worth flagging: commit `0d81859` ("streamline navigation
and investigation flow") deliberately dropped `InvestigationDrawer`'s only mount point
(`app/page.tsx`) and all 8 of its trigger call sites, replacing the slide-over-drawer pattern with
always routing to the full Investigations workbench. The component itself is intact and still
gets maintained — it's just currently unreachable from the UI. Decision: leave it in place (not
delete) in case it's wired back in later.

Separately, the product team supplied `need-checking.md` — a PRD for a general **Machine Failure
Monitoring & Incident Management** system. Audited it against the current codebase: the core
incident lifecycle already exists under different names (`Alert` + `Investigation` + `ActionTask`
instead of one unified `incident`). Full gap analysis published as a Claude Doc (ask Bagus for the
link if needed). Shipped this session from that audit's "minimal-change plan":

- Server-side status-transition validation (`lib/domain/statusTransitions.ts`), closing a real
  hole where `PATCH /api/v1/action-tasks/[id]` accepted any client-supplied status.
- Manual incident registration ("Report Issue") — PRD Journey A.
- A `Reopened` lifecycle state (`Alert` + `Investigation`) with eligibility validation.
- An append-only `IncidentEvent` audit table, wired into every major lifecycle transition.
- A `ProductionMetric` history table (schema + 24 hourly seed rows for `mach-m03`).
- A "Simulate Failure" scenario picker (PRD §9's 5 named scenarios).
- Removed a hardcoded `$1.25/unit` blanket revenue rate on the Dashboard.
- Notifications now fire for Report Issue / Reopen / Simulate Failure too (were silently missing).
- `ActionsModule.tsx`'s task list is now grouped by linked investigation, with "View Work
  Order"/"Resolved in Action Center" auto-scrolling + highlighting the right group.

### TODO — outstanding PRD gaps (not started; pick up as token budget allows)

- [ ] **Surface `IncidentEvent` in the UI.** The audit table and writes exist
  (`lib/repositories/incidentEventRepository.ts`), but nothing reads it back — no `GET` API
  route, no UI component anywhere. This directly blocks the PRD's own Definition of Done: "see a
  complete activity timeline."
- [ ] **Actually use `ProductionMetric`.** Table + seed data exist, but no usecase, calculation,
  or UI reads from it yet — the PRD's duration-aware revenue formula (`expected_units =
  expected_units_per_hour × affected_duration_hours`, §8) still isn't computed anywhere in the app.
- [ ] **Add a `VERIFYING` stage** between "task completed" and "incident resolved" (§5, Journey B
  steps 7–9) — `completeActionTask` currently jumps straight to Resolved with no explicit
  "confirm recovery" gate.
- [ ] **Split suspected vs. confirmed root cause** (§6.3) — `RootCause.status` has no such
  distinction today.
- [ ] **Let a technician add freeform findings/comments** to an investigation after it's
  created — all investigation content is currently AI/heuristic-generated once, at creation time,
  with no way to append notes later.
- [ ] **Dashboard cards from §6.6** — still missing "Active incidents", "Critical/high-severity
  incidents", "Machines stopped", incidents-by-status/severity, incidents-by-machine/line, and
  "longest-running active incidents" views.
- [ ] **5 PRD roles vs. our 3 RBAC tiers** — Admin/Manager/Viewer are permission tiers, not the
  PRD's workflow-stage actors (operator / technician / supervisor / production manager / demo
  admin). Decide whether to map onto them or leave as-is.
- [ ] **Pagination** (§10) — every list repository still returns its full table; fine at demo
  scale, but named explicitly by the PRD for "growing incident histories."
- [ ] **Human-readable `incident_number`** (§7) — IDs are still `alert-user-<uuid>`, not a
  collision-safe readable number like `INC-0042`.

### Already covered — don't re-litigate
`status`/`severity` indexes on `Alert` were added as a side effect of the `IncidentEvent`
migration. See the bullet list above for everything else shipped this session.
