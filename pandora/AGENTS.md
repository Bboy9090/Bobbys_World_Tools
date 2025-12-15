# AGENTS.md — BootForge / Phoenix Key Agent Doctrine (Root)

## Prime Directive
Ship correct, reproducible changes. Minimal diff. Maximum honesty.

## Absolute rules
- Do not claim you executed commands unless you actually did.
- Do not guess build/test commands—discover them from:
  - package.json scripts, pnpm-workspace.yaml, turbo.json
  - BUILD_INSTRUCTIONS.md / COMPLETE_SETUP_GUIDE.md
  - .github/workflows/*.yml
- Do not introduce new frameworks, build tools, or linters unless the repo already uses them.

## Operating procedure (always follow)
1) Restate the task in 1–3 bullets.
2) Identify the owning area (API / web / CRM / Rust / Python / scripts).
3) Read the nearest README and build docs for that area.
4) Read the relevant CI workflow job for that area.
5) Implement the smallest change.
6) Validate via commands or “inspection validation”.
7) PR notes must include:
   - What changed + why
   - Validation
   - Risk/rollback

## Quality bar (reject your own PR if any fail)
- Breaks CI or likely breaks CI based on workflow definitions
- Adds secrets / hard-coded credentials
- Returns success without doing real work
- Touches release/CI/spec files without explicit need

## Where you are allowed to be bold
- Add guardrails, error handling, explicit status outputs
- Add small tests that prove behavior (prefer unit tests over end-to-end unless required)
- Improve developer ergonomics ONLY when it matches repo patterns

## Where you must be conservative
- Anything in:
  - .github/workflows
  - *.spec
  - build.sh / build.bat / build_exe.py
  - prisma migrations
Only change these with explicit justification and minimal diffs.
