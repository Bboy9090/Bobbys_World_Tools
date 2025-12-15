---
applyTo: "apps/pandora-codex-web/**/*.ts,apps/pandora-codex-web/**/*.tsx,crm-api/src/**/*.tsx,crm-api/src/**/*.ts,packages/ui-kit/**/*.ts,packages/ui-kit/**/*.tsx"
---

# Frontend Rules (Vite + Tailwind)

- Reuse existing UI kit components and styles; do not add new UI libraries unless already present.
- Keep components small; avoid side effects in render.
- Maintain accessibility basics (labels, buttons, keyboard nav) where already practiced.
- If you change API response expectations, update types and error UI.

## Validation
- Use the repo’s existing lint/format tools (eslint/prettier). Do not introduce new ones.
- Read CI workflow to find the real build command(s).
