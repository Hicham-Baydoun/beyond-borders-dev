# Beyond Borders Travel Management System (BBTMS)

CSC 490 project. The SRS (Phases I to III) is the source of truth for every requirement ID used in the code.

**Stack (SRS Chapter 5):** React + Vite + Tailwind (client), Node.js + Express (server), PostgreSQL + Prisma (data), Mailpit for dev email.

## Layout

```
client/                 React web app (customer, agent and admin areas, Table 8)
server/
  prisma/schema.prisma  Data model (Appendix B)
  prisma/seed.js        Seed data (Table 33)
  src/app.js            Express app, mounts /api/v1
  src/config/env.js     Validated environment variables
  src/lib/              prisma, clock (staging time control), eventBus, crypto, errors
  src/middleware/       session (30-min idle), role checks, Zod validation, error handler
  src/modules/m01..m12  One folder per module (Table 7): routes, controller, service, repository, README, __tests__
  tests/                Integration tests (Jest + Supertest)
docker-compose.yml      PostgreSQL 16 + Mailpit
```

## Prerequisites (Windows)

```powershell
winget install Git.Git OpenJS.NodeJS.LTS axllent.mailpit
winget install PostgreSQL.PostgreSQL.16 --override "--mode unattended --superpassword <choose one> --serverport 5432"
```

Create the database user and databases (once):

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -c "CREATE ROLE bbtms LOGIN PASSWORD 'bbtms' CREATEDB;"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -c "CREATE DATABASE bbtms OWNER bbtms;"
```

(Alternative: Docker Desktop with `npm run db:up`, or a free hosted PostgreSQL such as Neon.)

## First run

```powershell
npm install                                   # client + server (npm workspaces)
copy server\.env.example server\.env          # then set SESSION_SECRET and ENCRYPTION_KEY
npm run db:migrate -w server                  # applies prisma/migrations
npm run db:seed -w server
npm run dev:server                            # http://localhost:4000/api/v1/health
npm run dev:client                            # http://localhost:5173
mailpit                                       # dev inbox at http://localhost:8025
```

Seed logins (Table 33): admin `fadi.aoun@bbtravel.test` / `Admin#2027`, agent `nour.saleh@bbtravel.test` / `Agent#2027`, customer `rana.khoury@example.com` / `Travel2027`.

## Shared team database (SRS Section 5.6)

The whole team uses one free hosted PostgreSQL database on Neon, so everyone sees the same seed data and each other's changes.

**New teammate:** install Node.js 20+ and Git, clone the repo, then run one command:

```bash
npm run setup
```

It installs everything, asks you to paste `DATABASE_URL` and `ENCRYPTION_KEY` (Hicham sends them to you **privately**), checks them, writes `server/.env` and confirms the shared database connects. `ENCRYPTION_KEY` must be identical for everyone, otherwise you cannot read passport numbers other people saved. You can run `npm run setup` again any time; it keeps a backup of your old `.env`.

**Hicham (project owner):** run `npm run team:invite` to print a ready-to-send message with both values.

Then start with `npm run dev:server` and `npm run dev:client`. Do **not** run `db:seed` again unless the team agrees.

Rules for the shared database:
- Only one person runs migrations (`npm run db:migrate -w server`). Commit the new `prisma/migrations` folder, then tell the team to pull.
- Never commit `.env`. Never paste the connection string in the repo or in Jira.
- Automated tests use your **local** `bbtms_test` database, never the shared one.

## Team rules (SRS Sections 4.4 and 5.4)

- Every change goes through a branch and is reviewed by a second team member before merge.
- A module touches only its own tables; it calls other modules through their `service.js`.
- Emails and audit entries are triggered by events (`src/lib/eventBus.js`), not direct calls.
- Read the time from `src/lib/clock.js`, never `new Date()`, so tests can move the clock.
- Error messages say what went wrong and what to do next.
