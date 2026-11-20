# The Wild Oasis - System documentation

Specification of the cabin booking application in this repository. The code is the source of truth; every rule, limit, route and message below was taken from it.

| Document | Content |
|---|---|
| [01 - Overview](01-overview.md) | Purpose, scope, actors, tech stack, glossary |
| [02 - Architecture](02-architecture.md) | Layers, diagrams (context, create reservation, login), folder structure |
| [03 - Functional requirements](03-functional-requirements.md) | FR-01..., acceptance criteria, business rules BR-01... |
| [04 - Data model](04-data-model.md) | ER diagram, tables, columns, constraints, migrations |
| [05 - Routes and API](05-routes-and-api.md) | Pages, server actions, REST endpoint |
| [06 - Security](06-security.md) | Authentication, authorization, validation, rate limiting, headers, threats |
| [07 - Deployment](07-deployment.md) | Environment variables, local setup, database setup, Vercel, checklist |
| [08 - Testing](08-testing.md) | Unit test coverage, how to run, gaps |

## How to read

- New to the project: read 01, then 02.
- Implementing or reviewing behaviour: 03 (requirements and business rules), then 05 (exact inputs and errors) and 04 (storage).
- Operating the system: 07 and 06.
- Where a feature is described as "Not implemented", the code contains no such behaviour.
- Code references are relative links to files in the repository (for example [booking.ts](../app/_lib/booking.ts)).
