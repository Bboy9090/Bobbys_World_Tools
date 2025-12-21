# Pull Request

## Summary

<!-- Brief description of what this PR does -->

## Type of Change

<!-- Check all that apply -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🔧 Configuration change
- [ ] 🎨 Code refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test addition or update
- [ ] 🔒 Security fix

## Motivation

<!-- Why is this change needed? What problem does it solve? -->
<!-- Link to related issues: Fixes #123, Relates to #456 -->

## Changes Made

<!-- List the specific changes made in this PR -->

- 
- 
- 

## Validation — PROOF REQUIRED

<!-- ⚠️ NO FAKE SUCCESS. Provide actual evidence. -->
<!-- If you didn't run it, don't claim it passed. -->

### Tests

<!-- Show that tests pass -->

```bash
# Command you ran:


# Output (last 20+ lines showing results):


```

**Test Summary:**
- ✅ / ❌ All tests pass
- ✅ / ❌ New tests added (if applicable)
- ✅ / ❌ Existing tests still pass

### Build

<!-- Show that build succeeds -->

```bash
# Command you ran:


# Output (last 10+ lines showing success):


```

**Build Status:** ✅ Success / ❌ Failed

### Linting

<!-- Show that linter passes -->

```bash
# Command you ran:


# Output:


```

**Lint Status:** ✅ Clean / ⚠️ Warnings / ❌ Errors

### Manual Testing (if applicable)

<!-- For UI/API changes, show manual testing proof -->

**What I tested:**
- 
- 

**Test Environment:**
- OS: 
- Browser (if UI): 
- Node version: 

**Results:**
<!-- Screenshots, curl output, etc. -->


## Truth-First Checklist

<!-- These verify you followed repository rules -->

- [ ] **No placeholders in production code** — No TODOs, FIXMEs, "coming soon" in runtime paths
- [ ] **No fake success** — All returns/responses are real, not mocked (tests excluded)
- [ ] **Tests actually run** — I ran the tests and they passed (proof above)
- [ ] **Build actually run** — I built the code and it succeeded (proof above)
- [ ] **Linter actually run** — I ran the linter (proof above)
- [ ] **Small focused PR** — This PR does one thing well (not multiple unrelated changes)
- [ ] **No generated artifacts committed** — No dist/, build/, *.exe, *.pkg files
- [ ] **Platform-specific code guarded** — Runtime checks for Windows/Mac/Linux specific code
- [ ] **Errors are explicit** — Error messages are actionable, not vague
- [ ] **No secrets committed** — No API keys, passwords, tokens in code

## Path-Specific Requirements

<!-- Check if your changes require following specific instructions -->

- [ ] **API changes** → Followed `.github/instructions/api-runtime.instructions.md`
- [ ] **Prisma schema** → Followed `.github/instructions/prisma.instructions.md`
- [ ] **Rust code** → Followed `.github/instructions/rust.instructions.md`
- [ ] **Scripts** → Followed `.github/instructions/scripts-danger-zone.instructions.md`
- [ ] **Tests** → Followed `.github/instructions/tests.instructions.md`
- [ ] **CI/Build** → Followed `.github/instructions/build.instructions.md`
- [ ] N/A — No path-specific requirements for this PR

## Risk Assessment

**Risk Level:** Low / Medium / High

**What could break:**
<!-- Be honest about potential risks -->

- 
- 

**Mitigation:**
<!-- How are risks mitigated? -->

- 
- 

## Rollback Plan

<!-- If something goes wrong, how do we undo this? -->

**Rollback Steps:**
1. 
2. 

**Data Impact:** None / Reversible / Requires backup restore

## Breaking Changes

<!-- Are there any breaking changes? -->

- [ ] No breaking changes
- [ ] Breaking changes (describe below)

**If breaking changes, describe migration path:**
<!-- How should users/developers adapt to this change? -->


## Documentation

- [ ] Documentation updated (README, API docs, etc.)
- [ ] Inline code comments added (for complex logic)
- [ ] CHANGELOG.md updated (if applicable)
- [ ] N/A — No documentation changes needed

## Security Review

- [ ] No security-sensitive changes
- [ ] Security changes reviewed (describe below)

**If security-sensitive:**
<!-- What security measures were taken? -->


## Performance Impact

- [ ] No performance impact
- [ ] Performance improved (show benchmarks)
- [ ] Performance degraded (justify below)

**If performance impact:**
<!-- Show before/after measurements -->


## Deployment Notes

<!-- Anything special needed for deployment? -->

- [ ] No special deployment steps
- [ ] Requires environment variable changes (document below)
- [ ] Requires database migration (document below)
- [ ] Requires cache clear
- [ ] Other (describe below)

**Special deployment instructions:**


## Agent Assignment (Optional)

<!-- Which specialized agent should review this? -->

- [ ] @api-guardian — API changes
- [ ] @prisma-steward — Database schema
- [ ] @rust-forge — Rust code
- [ ] @automation-engineer — Scripts
- [ ] @security-guard — Security review
- [ ] @docs-onboarding — Documentation
- [ ] @audit-hunter — Placeholder detection
- [ ] @ci-surgeon — CI/CD changes

## Additional Context

<!-- Any other information reviewers should know -->


---

## For Reviewers

**Review Checklist:**
- [ ] Code follows repository standards
- [ ] Validation proof is adequate (tests/build/lint actually ran)
- [ ] No placeholders or fake success in production code
- [ ] PR is small and focused (one thing per PR)
- [ ] Breaking changes are justified and documented
- [ ] Security implications considered
- [ ] Documentation updated appropriately
- [ ] Rollback plan is reasonable

**Questions for author:**
<!-- Reviewers: ask questions here -->
