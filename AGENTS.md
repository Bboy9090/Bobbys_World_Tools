# AGENTS.md — Bobby's Workshop Release Doctrine

## Absolute rules
- Never invent results.
- No placeholders/mocks in production paths.
- Mocks only in tests/.
- Small PRs only.

## Workflow
1) Identify stack + real build/test commands from repo files.
2) Run or truthfully inspect the pipeline.
3) Fix the first failing step first.
4) Add/adjust tests for behavior changes.
5) Document only what is real.

## Do not touch unless asked
- dist/, build/, packaged artifacts (*.exe/*.pkg/*.zip)
- archive/old_builds/old_installers (if present)

## PR template requirements
- Summary, Validation, Risk/Rollback
