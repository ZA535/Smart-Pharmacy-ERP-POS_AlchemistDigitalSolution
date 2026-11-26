# Smart Pharmacy ERP & POS

Production-style full-stack pharmacy management with batch/expiry inventory, purchase order reconciliation, AI supplier bill extraction, FEFO POS, returns, and configurable alerts.

## Stack

- **API:** Node.js (JavaScript), Express, Prisma, PostgreSQL, JWT RBAC
- **UI:** React.js (Vite, JavaScript `.js`), React Router
- **AI:** Google Gemini vision (`GEMINI_API_KEY`) — demo extraction when unset

## Quick start

### 1. Database

```bash
docker compose up -d
```

### 2. Environment

```bash
cp server/.env.example server/.env
# Optional: set GEMINI_API_KEY for real bill OCR
```

### 3. Install & migrate

```bash
npm install
npm run db:push -w server
npm run db:seed -w server
```

(`db:push` uses `prisma db push` in the server workspace.)

### 4. Run

```bash
npm run dev
```

### Code formatting (Prettier)

```bash
npm install          # installs prettier at repo root
npm run format       # format client + server source
npm run format:check # CI-style check only
```

- **UI:** http://localhost:5173
- **API:** http://localhost:4000

### Demo accounts

| Role    | Email                    | Password     |
| ------- | ------------------------ | ------------ |
| Admin   | `admin@pharmacy.local`   | `admin123`   |
| Cashier | `cashier@pharmacy.local` | `cashier123` |

## Feature map

| Module                              | Admin | Cashier |
| ----------------------------------- | ----- | ------- |
| Dashboard & reports                 | ✓     | —       |
| Categories                          | ✓     | —       |
| Inventory (manual + AI confirm)     | ✓     | —       |
| AI bill upload                      | ✓     | —       |
| Purchase orders & PO reconciliation | ✓     | —       |
| Alerts & settings                   | ✓     | —       |
| Supplier returns                    | ✓     | —       |
| POS (FEFO) + receipt print          | ✓     | ✓       |
| Customer returns                    | ✓     | ✓       |
| Stock lookup                        | ✓     | ✓       |

## AI bill workflow

1. Create **Purchase Orders** for expected medicines (status `ORDERED`).
2. Upload supplier bill on **AI Bill Upload** (image/PDF).
3. Review/edit extracted rows → **Confirm & add to stock**.
4. Stock is created/updated per batch; open PO lines auto-match to `RECEIVED` / `PARTIAL`.

## Project layout

```
client/src/      React UI (JavaScript)
server/src/      Node.js layered API — see `server/ARCHITECTURE.md`
docker-compose.yml   PostgreSQL (optional if using pgAdmin)
```

## License

MIT (adjust as needed for your organization).
