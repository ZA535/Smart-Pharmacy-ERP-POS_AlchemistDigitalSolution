# Server architecture

Layered **Node.js (JavaScript)** API. Each layer has a single responsibility.

```
HTTP Request
    ↓
routes/          → URL + middleware (auth, roles)
    ↓
controllers/     → Parse request, validate input (Zod), HTTP status
    ↓
services/        → Business rules & orchestration
    ↓
repositories/    → Database access (Prisma)
    ↓
database/        → Prisma client singleton
```

## Folders

| Folder | Purpose |
|--------|---------|
| `config/` | Environment & app config |
| `enums/` | Roles, PO status, stock receipt sources, etc. |
| `validators/` | Zod schemas (request shapes) |
| `middleware/` | Auth, uploads, global errors |
| `controllers/` | Thin HTTP handlers |
| `services/` | Use-cases (inventory, POS, returns, …) |
| `services/domain/` | Pure domain logic (FEFO, PO reconciliation, AI bill, metrics) |
| `repositories/` | Prisma queries grouped by aggregate |
| `errors/` | `AppError` for consistent API errors |
| `utils/` | Shared helpers |
| `routes/` | Express routers only |

## Conventions

- **Routes** never call Prisma directly.
- **Controllers** validate with `validators/`, call one service method, map response.
- **Services** throw `AppError` for expected failures (404, 400, 401).
- **Enums**: import from `enums/index.js` instead of scattering magic strings.

## Adding a feature

1. Add Zod schema in `validators/index.js`.
2. Add repository methods if new queries are needed.
3. Implement `services/<feature>.service.js`.
4. Add `controllers/<feature>.controller.js`.
5. Wire `routes/<feature>.routes.js` and register in `routes/index.js`.