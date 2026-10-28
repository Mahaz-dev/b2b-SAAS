# Conventions

Rules for every change to this codebase. They exist so any reviewer, human or agent, finds the same standard everywhere.

## Code

- No comments in code. Names, structure, and types carry meaning. If a piece of logic needs a comment to be understood, rename or restructure it instead.
- Reuse only when it is the better approach: shared code must serve at least two call sites, or isolate a boundary such as the database, environment, or an external API. No speculative abstraction.
- TypeScript strict mode. No `any` in application code. Every external input is validated with zod before use.
- Server code never runs in client components. Environment access is server-only and enforced at runtime.
- Errors are typed and handled at boundaries. No silent failures, no swallowed promises.

## Structure

- `src/app` — routes only. No business logic in route handlers or pages.
- `src/actions` — server actions. Each action validates its input, touches one domain, and returns a plain state object.
- `src/lib` — boundaries: database client, environment, authentication, external APIs.
- `src/components/ui` — presentational primitives shared by at least two screens.
- `src/lib/schema.ts` — the only data model. Migrations are generated from it with drizzle-kit, never hand-edited.

## Verification before any change is called done

- `npm run typecheck` passes.
- `npm run build` passes.
- New database models ship with indexes on every foreign key and every field used in a `where` clause.
