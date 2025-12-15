---
applyTo: "crm-api/prisma/**,crm-api/**/schema.prisma,crm-api/**/migrations/**"
---

# Prisma / DB Rules

- Do not edit existing migration files unless repo explicitly does so.
- Prefer creating a new migration for schema changes.
- Keep seed scripts deterministic.
- Any schema change must include updated types/usages and a clear migration plan in PR notes.

## Validation
- Read CI workflow for migration/db steps.
- If you cannot run DB locally, document the workflow steps you verified.
