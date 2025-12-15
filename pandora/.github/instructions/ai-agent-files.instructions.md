---
applyTo: ".github/agents/**/*.md,.github/agents/**/*.agent.md,.github/agents/**/*.txt"
---

# Agent Prompt Files Rules

- Keep prompts short, testable, and non-contradictory.
- Avoid policies that tell the agent to invent output or claim it ran commands it didn't.
- Prefer checklists and decision trees.
- When referencing commands, tell the agent to read BUILD_INSTRUCTIONS.md / workflows for the exact command.
