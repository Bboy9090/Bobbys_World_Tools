# AGENTS.md — Bobby's Workshop AI Operating System

## Prime Directive: Truth + Production

**ABSOLUTE RULES — NO EXCEPTIONS:**

1. **Never invent results** — If you didn't run it, don't claim it passed.
2. **No placeholders/mocks in production paths** — Only in tests/.
3. **No fake success** — All user-facing features must work end-to-end.
4. **Small PRs only** — One focused change per PR.
5. **No uncontrolled command execution** — Always validate commands before running.
6. **Explicit validation required** — Show proof: build output, test results, lint output.

## Workflow Discipline

### Standard Development Flow

1. **Discovery Phase**
   - Read `.github/copilot-instructions.md` and `AGENTS.md` first
   - Identify tech stack from repo structure
   - Find real build/test commands from `package.json`, `Cargo.toml`, `README.md`, workflows
   - Check for existing path-specific instructions in `.github/instructions/`

2. **Validation Phase**
   - Run existing tests BEFORE making changes (establish baseline)
   - Document pre-existing failures (not your responsibility unless related)
   - Run linters/formatters to understand current state

3. **Implementation Phase**
   - Make minimal, surgical changes
   - Fix the first failing step first
   - Add/adjust tests for behavior changes
   - Commit frequently with clear messages

4. **Verification Phase**
   - Run targeted tests for your changes
   - Run full test suite if significant changes
   - Run linters/formatters
   - Build the project
   - Document what you actually ran

5. **Documentation Phase**
   - Document only what is real and tested
   - Update relevant docs if behavior changes
   - Keep docs in sync with code

## High-Risk Zones

**DO NOT TOUCH UNLESS EXPLICITLY ASKED:**

- `dist/`, `build/`, `coverage/`, `out/` — Generated artifacts
- `**/*.exe`, `**/*.pkg`, `**/*.zip`, `**/*.tar.gz` — Packaged artifacts
- `node_modules/`, `target/`, `__pycache__/` — Dependencies
- `archive/`, `old_builds/`, `old_installers/` — Historical artifacts

**DANGER ZONES — REQUIRE EXTRA VALIDATION:**

- `scripts/` — Automation scripts (see `.github/instructions/scripts-danger-zone.instructions.md`)
- `**/prisma/` — Database schemas (see `.github/instructions/prisma.instructions.md`)
- `crates/` — Rust code (see `.github/instructions/rust.instructions.md`)
- `.github/workflows/` — CI/CD pipelines (see `.github/instructions/build.instructions.md`)

## Validation Standards

### What "Validated" Means

- **Tests Pass** — Show test output with pass/fail counts
- **Build Succeeds** — Show build output with no errors
- **Lint Clean** — Show linter output with no errors
- **Runtime Verified** — For UI/API changes, show manual testing proof

### What "Validated" Does NOT Mean

- "Should work" — Not validated
- "Looks good" — Not validated
- "Tests exist" — Not validated unless you ran them
- "CI will catch it" — Not validated

### Proof Requirements

When claiming validation:
1. Show the command you ran
2. Show relevant output (last 20-50 lines minimum)
3. Show exit code (if not zero, explain)
4. Show timestamp (proves you just ran it)

## Path-Based Ownership

Different parts of the codebase have different rules. Before modifying files, check:

- `.github/instructions/` — Path-specific rules
- File patterns matched to instruction files
- Agent prompts in `.github/agents/`

### Key Instruction Files

- `runtime.instructions.md` — All runtime TypeScript/JavaScript/Python
- `tests.instructions.md` — All test files
- `build.instructions.md` — Build scripts, CI/CD, Dockerfiles
- `api-runtime.instructions.md` — API TypeScript code
- `prisma.instructions.md` — Prisma schemas and migrations
- `rust.instructions.md` — Rust crates
- `scripts-danger-zone.instructions.md` — Automation scripts
- `agent-prompts.instructions.md` — Agent definitions

## Agent Roles

See `.github/agents/` for specialized agent prompts:

1. **Audit Hunter** — Find placeholders/mocks and classify
2. **CI Surgeon** — Make CI deterministic and fix test discovery
3. **Backend Integrity / API Guardian** — API contracts, error handling, schema validation
4. **Frontend Parity** — Remove dead UI, wire real API calls, add smoke tests
5. **Release Captain** — Enforce small PRs and Definition of Done
6. **Prisma Steward** — Database schema evolution and migration discipline
7. **Rust Forge** — Safe Rust code with proper error handling
8. **Automation Engineer** — Safe script execution with audit logging
9. **Security Guard** — Security review and vulnerability detection
10. **Docs Onboarding** — Documentation quality and completeness

## PR Requirements

Every PR must include:

1. **Summary** — What changed and why
2. **Validation** — What you tested and the results (with proof)
3. **Risk Assessment** — What could break
4. **Rollback Plan** — How to undo if needed
5. **Size Check** — Keep it small and focused

## Platform-Specific Behavior

When writing code that behaves differently on different platforms:

- Use proper platform detection (no hardcoded assumptions)
- Guard platform-specific code with runtime checks
- Test on target platforms (or document inability to test)
- Fail gracefully with clear error messages on unsupported platforms

## Security Requirements

- Never commit secrets
- Never add bypass/circumvention features
- Validate all external inputs
- Use parameterized queries (no SQL injection)
- Escape output (no XSS)
- Log security events (without leaking secrets)

## Definition of Done

A task is complete when:

- [ ] Changes made are minimal and focused
- [ ] All related tests pass (proof provided)
- [ ] Build succeeds (proof provided)
- [ ] Linters pass (proof provided)
- [ ] Manual testing done (for user-facing changes)
- [ ] Documentation updated (if behavior changed)
- [ ] Security review passed (if security-relevant)
- [ ] PR reviewed and approved
- [ ] CI green (all checks pass)

## Common Mistakes to Avoid

1. **Greenwashing** — Claiming tests pass without running them
2. **Scope Creep** — Fixing unrelated issues in the same PR
3. **Silent Failures** — Returning success when operation failed
4. **Placeholder Production** — Leaving TODOs in runtime code
5. **Fake Data** — Using mock data in production paths
6. **Undocumented Behavior** — Changing behavior without updating docs
7. **Uncontrolled Execution** — Running arbitrary commands without validation

## Emergency Procedures

### If CI Fails
1. Read the failure logs (actual logs, not assumptions)
2. Reproduce locally if possible
3. Fix the root cause (not the symptom)
4. Verify the fix works
5. Document what broke and how you fixed it

### If Tests Fail
1. Determine if it's a regression (your change) or pre-existing
2. If pre-existing and unrelated, document but don't fix (out of scope)
3. If regression, fix immediately
4. Add test coverage if missing

### If Build Fails
1. Check error messages carefully
2. Verify all dependencies are installed
3. Check for platform-specific issues
4. Fix or document platform limitations

## How to Use This System

### For Contributors
1. Read `.github/copilot-instructions.md` before starting
2. Check for path-specific instructions before modifying files
3. Follow the Standard Development Flow
4. Use PR template to structure your PRs

### For AI Agents
1. Read this file and copilot-instructions.md at session start
2. Check for specialized agent prompts in `.github/agents/`
3. Follow path-specific instructions in `.github/instructions/`
4. Provide proof of validation (don't claim without evidence)

### For Reviewers
1. Verify validation proof in PR description
2. Check that changes are minimal and focused
3. Ensure tests actually pass (check CI logs)
4. Verify no placeholders in production code
5. Confirm documentation is updated

## Contact & Escalation

If you're unsure about:
- Security implications → Tag security team or use Security Guard agent
- Breaking changes → Tag Release Captain or senior eng
- Database changes → Tag DBA or use Prisma Steward agent
- CI/CD issues → Use CI Surgeon agent
- Architectural decisions → Tag tech lead

---

**Last Updated:** 2025-12-21  
**Version:** 2.0 (GitHub × AI Operating System)
