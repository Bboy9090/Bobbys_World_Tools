---
applyTo: ".github/workflows/**,**/*.spec,build.sh,build.bat,build_exe.py,START_APP.*,start.*,electron-main.cjs"
---

# CI / Packaging Guard

These files are high-risk. Do not change unless the task explicitly requires it.
If you must change:
- keep diffs minimal
- explain impact on CI/build artifacts
- reference the exact workflow job/step this aligns with
- include rollback instructions
