# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

Monorepo with two independent Node projects:

- `frontend/` — Vue 3 + TS + Vite SPA (port 5173). Dev server proxies `/api` → `http://localhost:3001`.
- `backend/` — Express + TS + Prisma API (port 3001). SQLite in dev (`backend/prisma/dev.db`), PostgreSQL in prod.
- `nginx/`, `docs/`, top-level `start-dev.ps1` / `health-check.ps1` — deployment/tooling.

The root `package.json` is *not* a workspace — it just wraps `start-dev.ps1`. Install deps inside each subproject.

## Common Commands

Backend (`cd backend`):
```bash
npm run dev                 # ts-node-dev, respawns on change
npm run build               # tsc → dist/
npm test                    # jest
npm test -- <pattern>       # single test (jest path/name filter)
npm run lint[:fix]
npm run prisma:generate     # after schema.prisma edits
npm run prisma:migrate      # create+apply dev migration
npx prisma db push          # sync schema without a migration (used in setup)
npm run prisma:studio
```

Frontend (`cd frontend`):
```bash
npm run dev                 # vite
npm run build               # vue-tsc typecheck + vite build
npm run lint                # eslint --fix across vue/ts/js
npm run format              # prettier src/
```

One-shot full-stack dev (from repo root, Windows):
```powershell
./start-dev.ps1             # kills stale ports, starts both, opens browser
```

Initial backend setup requires `cp .env.example .env`, then `npx prisma generate && npx prisma db push`. The admin account is auto-created on first boot from `INIT_ADMIN_NAME` / `INIT_ADMIN_PASSWORD` in `backend/.env` — no separate script needed despite what older docs suggest. Demo login: `123` / `123456`.

## Backend Architecture — EduClaw Gateway

The backend is *not* a flat REST service. `backend/src/index.ts` boots an Express app *and* an in-process **EduClaw Gateway** (`src/gateway/`) that routes work through a plugin-style Agent/Skill system. When adding AI-facing features, extend the gateway rather than writing standalone routes.

Key pieces to understand before editing:

- **Gateway (`src/gateway/`)** — central dispatcher. Owns the `EventBus` (`event-bus.ts`, persists `LearningEvent`s), four registries (`agent`, `skill`, `signal`, `strategy`), and a shared `OpenAIClient` (`openai-client.ts`) initialized from DB-backed platform config via `initializeOpenAIClientFromDatabase()`. Don't instantiate OpenAI clients directly — go through the gateway client so admin-configured API keys/models are respected.
- **Agents (`src/agents/`)** — higher-level orchestrators (`path-agent`, `content-agent*`, `tutor-agent`, `progress-agent`, `goal-conversation-agent`, `user-profile-agent`, etc.). Two registration paths coexist: `registerOfficialAgents` (legacy, in `agents/index.ts`) and `registerAllPlugins` (newer plugin system in `agents/plugins/` driven by `plugin-registry.ts`). Both run at startup; prefer the plugin form for new agents. Contracts live in `agents/protocol.ts`.
- **Skills (`src/skills/`)** — smaller, composable capabilities (`pdf-parser`, `quiz-generation`, `retrieval`, `smart-search`, `time-estimator`, …). Declared in `skills/index.ts` via `allSkillDefinitions` + `skillHandlers`; the gateway wires them on boot. Adding a skill = add a folder, export its definition/handler, register in `skills/index.ts`.
- **Background services (`src/services/`)** — domain logic invoked by agents and routes. `dynamic-adjustment.service.ts` and `agent-collaboration.service.ts` are started on boot as long-running services (timers + event listeners). `learning/`, `achievements/`, `arena/`, `ab-testing/`, `metrics/`, `ai/`, `ai-teaching/` are the main domains.
- **ACP middleware (`middleware/acp-context.middleware.ts`)** — every Platform-tier route is wrapped with `acpContextMiddleware('platform')` after `authMiddleware`. It attaches a permission context used by agents/services. When adding Platform routes (learning/sessions/state/achievements/reports/metrics/goal-conversation), mirror this pattern in `index.ts`. Admin and user-custom routes use a different auth stack.
- **Route ordering** — in `src/index.ts`, specific admin routes (`/api/admin/users`, `/api/admin/goal-conversations`, `/api/admin/api-config`) are registered *before* the catch-all `/api/admin`. Preserve this order when adding new admin endpoints or they will be shadowed.

## Frontend Architecture

- Vite + Vue 3 `<script setup>` + Pinia. Alias `@ → src/`. No SSR.
- `src/api/*` wraps axios calls to the backend; most views import from here rather than calling axios directly.
- `src/router/index.ts` defines both user-facing views (`views/`) and the admin area (`views/admin/*`). There is a separate `views/user/*` area for per-user developer/agent tooling.
- Styling: Element Plus + custom CSS in `src/styles/main.css`. Theme switching goes through `src/utils/useTheme.ts`.
- All backend calls go through the Vite dev proxy at `/api` — don't hardcode `http://localhost:3001` in frontend code.

## Data Layer

- Prisma schema: `backend/prisma/schema.prisma`. Provider is `sqlite` for dev; switch via `DATABASE_URL` for Postgres in prod (see `DEPLOYMENT.md`).
- Migrations live in `backend/prisma/migrations/`. Seeds in `backend/prisma/seeds/`. After schema edits run `npm run prisma:generate` or the `@prisma/client` types drift.

## Gotchas

- The repo has Chinese path segments (`大三下/比赛-计算机设计大赛/...`). Always quote paths in shell commands.
- `res.setHeader('Content-Type', 'application/json; charset=utf-8')` is set globally in `backend/src/index.ts` and re-applied by the Vite proxy — if you stream non-JSON responses, override it explicitly.
- AI model defaults come from env (`AI_API_URL`, `AI_API_KEY`, `AI_MODEL`, `AI_MODEL_REASONING`) *or* platform settings in DB loaded at boot. DB config wins once present.
