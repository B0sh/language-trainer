# Web Platform Migration Spec

Status: Draft
Owner: Product + Engineering
Last updated: 2026-02-20

## 1. Summary

This spec defines the migration of the current client-heavy prototype into a production-grade web application with:

- Account system and secure authentication
- Persistent relational database
- Server-side AI integration through first-party APIs
- Operational hardening (rate limits, queueing, observability)
- UI migration from Shoelace to shadcn/ui (requested as "shad cdn")

All migrated web code lands in the new Next.js app under `next/*`. The existing `src/*` app is treated as the legacy source to port from, not the destination for new migrated features.

## 1.1 Confirmed Product Decisions

1. Authentication framework: Better Auth.
2. BYOK (bring your own key): not supported.
3. End-user provider selection/settings: removed.
4. All AI requests from clients are routed only through first-party APIs.
5. shadcn/ui theming uses defaults for initial rollout.
6. Local Ollama and other user-selectable AI provider options are removed from user-facing configuration.

## 1.2 Migration Destination

1. The migration target is the existing Next.js app rooted at `next/*`.
2. "Migration" means porting behavior from legacy `src/*` into `next/*` (not upgrading the current Vite app in place).
3. New web features for this effort should be implemented in `next/*`; `src/*` only receives minimal fixes needed to keep the legacy app runnable during transition.

## 2. Current State

The existing app is a Vite + React SPA with a minimal Express proxy:

- Frontend state/settings are stored in `localStorage`
- AI logs are stored in IndexedDB
- Provider API keys are entered client-side and used directly in browser for some providers
- There is no user/account model or persistent backend domain data
- Current server only proxies a subset of OpenRouter calls

## 3. Goals

1. Add first-class user accounts and session management.
2. Persist user settings, usage logs, and training history in PostgreSQL.
3. Route all AI generation/evaluation through first-party APIs and server-side secrets.
4. Add robust production controls: validation, authorization, rate limiting, retries, auditing, monitoring.
5. Replace Shoelace UI dependencies with shadcn/ui components and design tokens.
6. Add marketing homepage and allow user to login.
7. Migrate the web app to Next.js in `next/*`.

## 4. Non-Goals (Initial Release)

1. Multi-tenant org/workspace billing.
2. Full mobile native app rewrite.
3. Rebuilding all training logic at once (incremental migration is expected).
4. Perfect visual parity during transition (functional parity is prioritized first).
5. User-configurable external AI provider selection (removed from product scope).

## 5. Target Architecture

## 5.1 Application Stack

- Web app + API: Next.js (App Router + Route Handlers)
- Language/runtime: TypeScript + Node.js 20+
- Database: PostgreSQL
- ORM/migrations: Prisma
- Auth: Better Auth (primary recommendation)
- Validation: Zod
- Logging: structured JSON logs
- Telemetry: OpenTelemetry + error tracking (Sentry or equivalent)

## 5.2 Security Model

- No external provider API keys in browser app code or browser storage.
- Browser clients only call first-party application APIs.
- Session-based auth with secure HTTP-only cookies.
- CSRF protections enabled for auth/session mutation routes.
- Per-route authorization checks for every user-owned resource.
- Rate limits applied by IP and by authenticated user ID.
- Secrets managed via environment variables and secret manager in deployment platform.

## 5.3 Data Ownership

All persisted app data is scoped by `user_id`.

- Settings
- AI request logs
- Training sessions/attempts

## 6. Data Model (Initial)

## 6.1 Core Tables

1. `users`
- `id` (uuid, pk)
- `email` (unique, nullable for future social-only accounts)
- `name`
- `created_at`, `updated_at`
- `deleted_at` (nullable, soft delete)

2. `sessions`
- `id` (uuid, pk)
- `user_id` (fk users.id)
- `expires_at`
- `created_at`, `last_seen_at`
- `ip_hash`, `user_agent`

3. `accounts` (provider bindings)
- `id` (uuid, pk)
- `user_id` (fk)
- `provider`
- `provider_account_id`
- `created_at`

4. `user_settings`
- `user_id` (pk/fk)
- `app_language`, `target_language`, `target_language_level`
- `theme`, `volume`
- `trainer_prefs` (jsonb)
- `updated_at`

5. `ai_requests`
- `id` (uuid, pk)
- `user_id` (fk)
- `provider`, `request_type`, `model`
- `input_excerpt`, `output_excerpt`
- `token_usage` (jsonb)
- `latency_ms`
- `status` (success/error)
- `error_code` (nullable)
- `created_at`

6. `training_sessions`
- `id` (uuid, pk)
- `user_id` (fk)
- `trainer_type` (`number|date|conversation|comprehension`)
- `started_at`, `ended_at`
- `summary` (jsonb)

7. `training_attempts`
- `id` (uuid, pk)
- `session_id` (fk)
- `prompt_payload` (jsonb)
- `user_input`
- `evaluation` (jsonb)
- `is_correct` (bool)
- `created_at`

## 7. API Surface (Initial)

## 7.1 Auth

- `POST /api/auth/sign-up`
- `POST /api/auth/sign-in`
- `POST /api/auth/sign-out`
- `GET /api/auth/session`

## 7.2 User & Settings

- `GET /api/me`
- `GET /api/settings`
- `PUT /api/settings`

## 7.3 Trainers

- `POST /api/trainers/number/round`
- `POST /api/trainers/date/round`
- `POST /api/trainers/comprehension/evaluate`
- `POST /api/trainers/conversation/message`
- `POST /api/trainers/conversation/analyze`

## 7.4 AI Logs

Removed from user-facing product scope as of 2026-02-20.

## 8. Shoelace -> shadcn/ui Migration

## 8.1 Clarification

User requested "shad cdn". This spec uses **shadcn/ui component-source integration** with **default shadcn styling/theme values** for initial rollout.
Migration is not only component replacement; migrated UI should conform to shadcn structure and styling conventions (spacing, typography, variants, and interaction states).

## 8.2 Frontend Foundations

1. Add Tailwind CSS and design tokens (`:root` variables).
2. Add shadcn/ui base setup (`button`, `input`, `select`, `dialog`, `sheet`, `separator`, `breadcrumb`, `tooltip`, `alert`, `textarea`, `slider`, `radio-group`, `table`).
3. Replace Shoelace icons with `lucide-react`.

## 8.3 Component Mapping

- `SlDrawer` -> `Sheet`
- `SlButton` -> `Button`
- `SlIconButton` -> `Button` (icon variant)
- `SlSelect` + `SlOption` -> `Select`
- `SlInput` -> `Input`
- `SlDialog` -> `Dialog` / `AlertDialog`
- `SlDivider` -> `Separator`
- `SlAlert` -> `Alert`
- `SlSpinner` -> loading component (custom or icon animation)
- `SlRadioGroup` / `SlRadioButton` -> `RadioGroup`
- `SlRange` -> `Slider`
- `SlBreadcrumb` / `SlBreadcrumbItem` -> `Breadcrumb`

## 8.4 Migration Strategy

1. Introduce a small internal UI wrapper layer (`next/components/ui/*`) and migrate screens incrementally.
2. Convert layout shell first in `next/app/*` using parity with legacy `LanguageTrainerApp`, then remove Shoelace global theme dependency.
3. Migrate settings forms and dialogs.
4. Migrate trainer flows and AI log table.
5. Confirm migrated screens visually and behaviorally align with shadcn conventions, not just functional parity.
6. Remove `@shoelace-style/shoelace` dependency once no imports remain.

## 9. Implementation Phases

## Phase 0: Foundation

- Use the existing Next.js app rooted at `next/*` as the destination for all migrated web code.
- Use `next/app/*` for routes/layouts and `next/components/*` for shared UI/components.
- Provision PostgreSQL in local/dev/staging.

## Phase 1: Auth + User Settings

- Integrate Better Auth.
- Add Prisma schema and migrations for `users`, `sessions`, `accounts`, `user_settings`.
- Build settings APIs and migrate from browser storage to DB.

## Phase 2: Server-side AI Gateway

- Implement typed first-party AI gateway on server.
- Route all trainer AI calls through authenticated application API routes.
- Remove client secret handling and browser-side paid-provider SDK usage.
- Remove AI Provider settings UI and replace it with service status/availability UI if needed.

## Phase 3: Trainer Endpoint Migration

- Move trainer orchestration to server endpoints.
- Persist training sessions/attempts.
- Maintain equivalent UX with client components.

## Phase 4: Observability

- Add trace IDs and correlation across request/job/provider calls.
- Add dashboards and alerts.

## Phase 5: Shoelace to shadcn/ui

- Introduce shadcn/ui primitives.
- Migrate route-by-route components.
- Remove Shoelace assets/base-path/theme setup.
- Use the shadcn cli to add components: https://ui.shadcn.com/docs/cli

## Phase 6: Hardening + Launch

- Security review and load test.
- SLOs and runbooks.
- Cutover and rollback plan.

## 10. Acceptance Criteria

1. Users can sign up/sign in/sign out and maintain sessions securely.
2. Settings persist per-user in DB across devices.
3. No paid provider key appears in client bundles, localStorage, or browser requests.
4. Browser requests for AI functionality target first-party APIs only.
5. Trainer history is queryable per user.
6. Rate limits and error handling are enforced at API boundary.
7. Shoelace dependency is removed from app code and replaced by shadcn/ui equivalents.
8. CI validates types, tests, lint, and migrations before deploy.
9. Migrated web application code lives in `next/*`; legacy `src/*` paths are no longer the primary implementation.
10. Migrated UI conforms to shadcn styling conventions (tokens, variants, spacing, typography, and states), not just one-to-one component swaps.
