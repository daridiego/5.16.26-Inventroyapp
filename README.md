# React + Vite
# Rio Bravito Inventory

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
This app now supports **database-backed persistence** for inventory changes (including `par` and `reorder`) so edits can be shared across devices.

Currently, two official plugins are available:
## How persistence works

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)
- If `VITE_INVENTORY_DB_URL` is set, the app loads/saves inventory from that HTTP endpoint.
- If the endpoint is unavailable, the app falls back to browser `localStorage`.
- Data shape sent to and expected from the database is:

## React Compiler
```json
{
  "items": [...],
  "counts": {
    "<itemId>": "<count>"
  }
}
```

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).
## Configure database-backed storage

## Expanding the ESLint configuration
Create a `.env.local` file in the project root:

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
```bash
VITE_INVENTORY_DB_URL=https://your-api-or-db-endpoint.example.com/inventory
VITE_INVENTORY_DB_AUTH_TOKEN=optional-secret-token
```

### Endpoint requirements

Your endpoint should support:

- `GET` → returns either `{ items, counts }` or `{ data: { items, counts } }`
- `PUT` → accepts `{ items, counts }` and persists it globally

### Example options

You can wire this up to any hosted backend (Supabase Edge Function, Firebase Cloud Function, Express API, etc.) as long as it follows the `GET`/`PUT` contract above.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```