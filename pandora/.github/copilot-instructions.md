# BootForge / Phoenix Key — Copilot Repository Instructions

## What this repo is
This is a multi-tool monorepo that combines:
- TypeScript/Node services (API + CRM routes/services + websockets)
- Vite web apps (pandora-codex-web and CRM web/public)
- Prisma database layer (crm-api/prisma)
- Python apps/tools (phoenix-key, build_exe.py, launch_app.py, trapdoor_bridge.py)
- Rust crates (crates/bootforge-usb, bootforge-cli, bootforge-usb-builder, libbootforge, trapdoor-cli)
- Packaging + desktop launcher scripts (START_APP.*, start.*, electron-main.cjs, *.spec, build.sh/bat)

Primary goal: production-grade tooling. No fake status. No “demo” logic.

## Non-negotiables (hard rules)
- Never fabricate test results, command output, CI status, device connectivity, or “success”.
- If you cannot run commands in your environment, say so and validate by reading the exact scripts/workflows that CI uses.
- Do NOT add secrets. Do NOT commit real .env values. Only edit `.env.example` files if needed.
- Do not add “random success” paths. If a function doesn’t actually talk to a device/network/DB, return an explicit `manual_intervention_required`-style status (or the repo’s existing equivalent).

## Where to look first (stop wandering)
Before changing anything, read these files if they exist for the area you’re touching:
- `MONOREPO_README.md`, `BUILD_INSTRUCTIONS.md`, `COMPLETE_SETUP_GUIDE.md`, `BOBBY_DEV_SETUP.md`
- `README.md` (root), plus app-specific READMEs:
  - `apps/pandora-codex-web/README.md`
  - `apps/phoenix-key/README.md`
- CI definitions:
  - `.github/workflows/ci.yml`
  - `.github/workflows/build-executable.yml`

Prefer the repo’s documented commands over guesses.

## Repo layout (high signal map)
- Node/TS API app: `apps/pandora-codex-api/` (src/db/jobs/routes/services/ws, `src/index.ts`)
- Node/TS Web app: `apps/pandora-codex-web/` (Vite/Tailwind; `vite.config.ts`, `src/`)
- CRM API: `crm-api/` (routes/services/server.ts; Prisma in `crm-api/prisma/`)
- Shared packages:
  - `packages/shared-types/`
  - `packages/ui-kit/`
  - `packages/arsenal-scripts/` and root `scripts/` (toolchain checks: android tools, rust, status)
- Rust crates: `crates/bootforge-usb/`, `bootforge-cli/`, `bootforge-usb-builder/`, `libbootforge/`, `trapdoor-cli/`
- Python/desktop tooling:
  - `apps/phoenix-key/` (pyproject + requirements)
  - root Python scripts: `main.py`, `launch_app.py`, `build_exe.py`, `trapdoor_bridge.py`
- Tests:
  - `tests/test_trapdoor_integration.py`

## Build / test / validate: required approach
DO NOT invent commands.
- Always discover the exact commands by reading:
  - root `package.json` + `pnpm-workspace.yaml` + `turbo.json`
  - per-app `package.json` files (apps/** and packages/**)
  - `BUILD_INSTRUCTIONS.md` and the GitHub workflows
- Then run the same commands locally if possible.

Validation expectations for PRs:
- If you ran commands: include the exact commands and summarized results.
- If you could not run commands: include “Validation by inspection” citing:
  - workflows read
  - scripts read
  - files changed and why it’s safe

## PR scope discipline
- Keep diffs minimal. Avoid refactors unless explicitly asked.
- Update docs only if behavior or commands changed.
- If you touch API contracts, update `packages/shared-types` (if that is the repo pattern) and all affected call sites.

## Safety / security boundaries (repo intent)
This repo may contain tooling around device workflows. Do not add exploit code, bypass instructions, or anything that meaningfully enables unauthorized access.
If a requested change looks like bypass/lock circumvention, stop and propose safe, lawful alternatives (diagnostics, restore flows, official APIs, user-owned device verification).

## House style
- Match existing patterns in the touched folder.
- Prefer explicit errors over silent failures.
- Never log secrets or raw tokens.
