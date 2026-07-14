# CI/CD Workflow Explanation

## Overview
This project uses **GitHub Actions** for continuous integration. The workflow is defined in `.github/workflows/ci.yml` and runs automatically on every push and pull request to the `main` branch.

## What it does
The workflow runs two independent jobs in parallel — one for the backend, one for the frontend — so a failure in one doesn't block validation of the other.

### Server job
1. Checks out the repository code
2. Sets up Node.js
3. Installs dependencies with `npm ci` (a strict, reproducible install based on `package-lock.json`)
4. Generates the Prisma Client (`npx prisma generate`) — required before any Prisma-dependent code can run
5. Runs ESLint (`npm run lint`) to catch syntax errors and code quality issues

### Client job
1. Checks out the repository code
2. Sets up Node.js
3. Installs dependencies with `npm ci`
4. Runs ESLint to catch code quality issues
5. Runs a full production build (`npm run build`) — this is the strongest check, since any broken import, syntax error, or type issue will cause the build to fail loudly

## Why this matters
- **Catches errors before they reach production.** If a broken commit is pushed, the build fails immediately and visibly in the GitHub Actions tab, rather than silently breaking the deployed app.
- **Enforces consistency.** Every contributor's code goes through the same checks, regardless of their local environment.
- **Fast feedback.** Both jobs run in parallel and typically complete in under 30 seconds, so issues are caught within moments of pushing.

## What's not covered (and why)
This pipeline currently validates linting and build correctness, not full automated test coverage (unit/integration tests). Given the project's timeline, manual testing was performed thoroughly via Postman (all API endpoints) and direct UI testing (all three role flows) instead. 