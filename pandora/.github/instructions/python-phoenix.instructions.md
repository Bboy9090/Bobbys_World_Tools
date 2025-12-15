---
applyTo: "apps/phoenix-key/**/*.py,**/*.py"
---

# Python Rules (Phoenix Key / tooling)

- Prefer explicit preconditions and actionable error messages.
- Never silently swallow exceptions.
- Do not add platform-specific assumptions without guards (Windows/macOS/Linux).
- Do not hardcode paths; use pathlib.
- If modifying executable/launcher scripts, keep changes minimal and well documented.

## Validation
- Discover commands from: apps/phoenix-key/pyproject.toml, requirements*.txt, and docs.
- If tests exist for Python, run them; otherwise add small unit tests when valuable.
