# Bobby's Workshop (Pandora Codex) — Copilot Repo Instructions

## Prime Directive: Truth + Production
- NO placeholders, NO mocks, NO stubs, NO fake success in production code.
- If it is visible/clickable/callable/documented, it MUST work end-to-end.
- Mocks are allowed ONLY inside tests.
- If something isn't ready: disable/hide OR gate behind EXPERIMENTAL (OFF by default).
- Never claim tests/builds/CI ran unless you actually ran them.

## Scope discipline
- Prefer small PRs: one intent per PR.
- Do not refactor unrelated code "for style."
- Do not modify generated artifacts: dist/, build/, *.exe, *.pkg, *.zip, *.tar.gz.

## Validation discipline
- Discover commands from package.json scripts, README, BUILD_INSTRUCTIONS.md, workflows.
- If a test suite is empty or missing, that is a failure to fix—not a reason to claim green.

## Security & safety
- Never add bypass/circumvention features (account locks, IMEI alteration, ownership violations).
- Do not add secrets. Only update .env.example-style files.

## Coding standards
- Prefer explicit errors over silent failures.
- Logs must be actionable and must not leak secrets.
- Platform-specific behavior must be guarded (Windows/macOS/Linux).
