<<<<<<< HEAD
# Bobby's Workshop (Pandora Codex) — Copilot Repo Instructions

## Prime Directive: Truth + Production
- NO placeholders, NO mocks, NO stubs, NO fake success in production code.
- If it is visible/clickable/callable/documented, it MUST work end-to-end.
- Mocks are allowed ONLY inside tests.
- If something isn't ready: disable/hide OR gate behind EXPERIMENTAL (OFF by default).
- Never claim tests/builds/CI ran unless you actually ran them.

# Bobby's Workshop — Copilot Repo Instructions

## Core Principles
- Truth-first: no placeholders, mocks, or fake success in production paths.
- Hide or gate unfinished features behind EXPERIMENTAL (off by default).
- Prefer small, single-intent PRs; avoid unrelated refactors.
- Do not commit generated artifacts (dist/, build/, *.exe, *.pkg, *.zip, *.tar.gz).
- Platform-specific behavior must be guarded (Windows/macOS/Linux).

## Validation Discipline
- Run real builds/tests; never claim green without execution.
- Discover commands from package.json scripts, README, BUILD_INSTRUCTIONS.md, and workflows.

## Security & Safety
- Never add bypass/circumvention features (account locks, IMEI alteration, ownership violations).
- Do not add secrets; only update .env.example-style files.
- Logs must be actionable without leaking secrets; prefer explicit errors over silent failures.

## Team Roles
See [AGENTS.md](./AGENTS.md) for specialist roles:
1. Audit Hunter — find placeholders/mocks and classify.
2. CI Surgeon — make CI deterministic and fix test discovery.
3. Backend Integrity — API contracts, error handling, schema validation.
4. Frontend Parity — remove dead UI, wire real API calls, add smoke tests.
5. Release Captain — enforce small PRs and Definition of Done.

## Build & Test Commands
```bash
npm run build         # Build the frontend
npm run test          # Run all tests
npm run lint          # Run ESLint
npm run dev           # Start development server
```

## Before Committing
- [ ] Tests pass
- [ ] Build succeeds
- [ ] No linting errors
- [ ] PR is small and focused
```
