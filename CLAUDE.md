@AGENTS.md

# Ecuacity — Ecuadorian Citizenship Exam Simulator

## Stack
- **Next.js 16.2.4** — uses `proxy.ts` (project root), NOT `middleware.ts`
- **Better Auth v1.6.9** — email/password + admin plugin (roles: admin, user)
- **Drizzle ORM v0.45.2** + drizzle-kit v0.31.10 — PostgreSQL via Docker
- **Tailwind CSS v4** — flag colors: `flag-blue` (#003893), `flag-yellow` (#FFD100), `flag-red` (#ED1C24), `flag-yellow-dark` (#B39500)
- **shadcn v4.4.0** — components in `components/ui/`

## Route Protection
`proxy.ts` at root handles auth redirects. `/dashboard` → admin only, `/sign-in` & `/sign-up` → redirect if logged in, `/students` → logged-in users.

## Database
8 tables: `user`, `session`, `account`, `verification` (Better Auth) + `category`, `question`, `answer_option`, `user_progress`. All PKs are `uuid().defaultRandom()`. Schema in `lib/db/schema/questions-schema.ts` + `lib/auth/auth-schema.ts`.

## Project Conventions
- English for conversation, Spanish for app UI
- Workflow: `db:generate` → `db:migrate` (versioned), avoid `db:push`
- shadcn first for UI, custom components only when needed
- Consult `node_modules/next/dist/docs/` before writing Next.js code
