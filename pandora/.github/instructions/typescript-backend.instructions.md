---
applyTo: "apps/pandora-codex-api/**/*.ts,crm-api/**/*.ts,packages/**/*.ts,scripts/**/*.js,packages/**/*.js"
---

# TypeScript Backend Rules (API/CRM/Packages)

- Never return "success" unless the real side-effect happened (DB write, device I/O, network call).
- Prefer explicit error types/status objects already used in the codebase.
- Keep route handlers thin: validation + call service + map output.
- Do not widen API surface unless required; update shared types if that is repo convention.
- Any change that impacts jobs/devices/tickets must preserve backwards compatibility or update all callers.

## Validation
- Do not guess commands. Read package.json scripts and CI workflow steps for the touched app.
- If Prisma is involved, ensure schema + migration steps align with existing workflow.
