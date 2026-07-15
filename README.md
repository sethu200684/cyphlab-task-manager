# Project & Team Task Management Platform

A role-based project and task management app built for the CyphLab Full Stack
Developer internship practical assignment.

## Live Demo
- **Frontend:** https://cyphlab-task-manager-fi83-delta.vercel.app
- **Backend API:** https://cyphlab-task-manager-seven.vercel.app/api

## Tech Stack
- **Frontend:** Next.js 16 (App Router) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL + Prisma ORM (hosted on Prisma Postgres)
- **Auth:** JWT + bcrypt
- **CI/CD:** GitHub Actions (install, lint, build validation on every push)
- **Deployment:** Vercel (frontend + backend, both as separate projects)

## Roles & Permissions
- **Admin** — manage users and roles, full visibility over all projects and tasks
- **Project Manager** — create/manage projects, assign members, create and edit tasks
- **Team Member** — view assigned projects, update status only on tasks assigned to them

## Project Structure
```
cyphlab-task-manager/
├── server/          Express API (Prisma, auth, RBAC, routes)
├── client/          Next.js frontend
├── docs/            Diagrams and Postman collection
│   └── diagrams/
├── .github/
│   └── workflows/   CI pipeline
├── feature_completion_report.md
├── cicd_explanation.md
└── README.md
```

## Local Setup

### 1. Database
Create a Postgres database (locally, or a free instance on Neon/Supabase/Prisma Postgres via `npx create-db`).

### 2. Backend
```bash
cd server
cp .env.example .env      # fill in DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run dev                # runs on http://localhost:4000
```

### 3. Frontend
```bash
cd client
cp .env.example .env.local
npm install
npm run dev                # runs on http://localhost:3000
```

### 4. Try it out
1. Register a user at `/register` — new users default to `TEAM_MEMBER`.
2. To test Admin/PM flows, promote a user's role via Prisma Studio (`npx prisma studio` inside `server`) or through the in-app Admin panel once one user has been manually promoted.
3. Log in and explore — dashboard content and permissions change based on role.

## API Overview
Full request/response details are in the Postman collection: [`docs/postman_collection.json`](./docs/postman_collection.json)

| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/users | Admin |
| PATCH | /api/users/:id/role | Admin |
| GET | /api/users/me | Authenticated |
| GET | /api/projects | Authenticated (scoped by role) |
| POST | /api/projects | Admin, Project Manager |
| POST | /api/projects/:id/members | Admin, Project Manager |
| GET | /api/projects/:id | Members of that project, Admin, PM |
| POST | /api/tasks | Admin, Project Manager |
| PATCH | /api/tasks/:id | Admin, Project Manager |
| PATCH | /api/tasks/:id/status | Assignee, Admin, Project Manager |
| GET | /api/tasks/mine | Authenticated |

## Diagrams
- [Entity Relationship Diagram](./docs/diagrams/er_diagram.svg)
- [Use Case Diagram](./docs/diagrams/use_case_diagram.svg)
- [System Architecture](./docs/diagrams/system_architecture.svg)

## Additional Features (Beyond Core Spec)
- Dashboard task summary — live counts of the logged-in user's tasks by status
- Project search/filter on the dashboard
- Color-coded status badges across task views
- Full live deployment (frontend + backend), not just local

See [`feature_completion_report.md`](./feature_completion_report.md) for the full completion checklist.

## CI/CD
GitHub Actions runs lint and build validation on every push. Full explanation: [`cicd_explanation.md`](./cicd_explanation.md)

## AI Tool Usage Disclosure
Claude (Anthropic) was used throughout this project for:
- Scaffolding the initial project structure (Express routes, Prisma schema, JWT/RBAC middleware, Next.js pages)
- Debugging deployment issues (Prisma Client generation on Vercel serverless functions, ESLint config for CI, environment variable configuration)
- Generating the ER, use case, and architecture diagrams
- Drafting documentation (this README, feature completion report, CI/CD explanation)

All code was reviewed, tested, and run by me before committing. I personally handled all git operations and commit history, tested every API endpoint via Postman, debugged deployment-specific runtime errors (e.g. the Prisma client path resolution on Vercel), and made the final decisions on architecture, feature scope, and UI design throughout.

## Known Limitations
- Free-tier hosting may have a brief cold-start delay on the first request after a period of inactivity.
- No email verification on registration (out of scope for this assignment's timeline).
- No automated test suite — CI currently covers lint and build validation rather than unit/integration tests.