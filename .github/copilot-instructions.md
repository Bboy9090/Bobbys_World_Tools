# Copilot Instructions for Bobby's World Tools

## Core Principles
- No placeholder / no fake success / truthfulness / test-first
- Small, focused PRs only
- Never commit dist/build artifacts

## Team Roles
For specialized tasks, see [AGENTS.md](./AGENTS.md) which defines five Copilot agent roles:
1. **Audit Hunter** - Find placeholders/mocks and classify
2. **CI Surgeon** - Make CI deterministic + fix test discovery
3. **Backend Integrity** - API contracts, error handling, schema validation
4. **Frontend Parity** - Remove dead UI, wire real API calls, add smoke tests
5. **Release Captain** - Coordinate + enforce small PRs + keep "Definition of Done" sacred

## Build & Test Commands
```bash
npm run build      # Build the frontend
npm run test       # Run all tests
npm run lint       # Run ESLint
npm run dev        # Start development server
```

## Before Committing
- [ ] Tests pass
- [ ] Build succeeds
- [ ] No linting errors
- [ ] PR is small and focused
