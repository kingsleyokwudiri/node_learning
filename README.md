# node_learning

A collection of small Node.js/Express practice projects. Each project is self-contained with its own `package.json` and `node_modules`, so install and run them from their own folder.

## Projects

| Folder | Stack | What it is | Port |
| --- | --- | --- | --- |
| [`inventory-management-system/`](./inventory-management-system) | Express 5, Mongoose 9, dotenv | Inventory API backed by MongoDB. Exposes `POST /books`, `GET /books`, and `GET /books/:id`. | `3000` (from `.env`) |
| [`classwork/`](./classwork) | Express 5 | Product API over an in-memory array of 8 products. No database. | `3000` |
| [`node_learning/`](./node_learning) | Express 5 | Minimal "Hello, World!" server. | `5000` |

> All three default to port `3000` except `node_learning/`, so only one of the `3000` projects can run at a time. Set `PORT` to run them side by side.

## Linting (all projects)

ESLint is installed **once at the repository root** and checks all three projects. The root `package.json` is tooling only: it has no runtime dependencies and does not start any app.

```bash
npm install        # once, at the repo root
npm run lint       # report problems
npm run lint:fix   # fix what can be fixed automatically
```

- Config: `eslint.config.mjs` (ESLint 10 flat config) — `@eslint/js` recommended rules, Node globals, `sourceType: "commonjs"`.
- The config file is ESM even though the projects are CommonJS; that is standard for ESLint 10 and does not change how the apps load.
- Each sub-project keeps its own `node_modules` for its runtime dependencies. `npm install` at the root only installs ESLint.
- VS Code: the ESLint extension uses the root install, so open the repository root as your workspace folder.

## Inventory management system

The main project. Requires a MongoDB connection string. `index.js` holds the Express app (schema/model, routes, 404 and error handlers) and `app.js` is the entry point that loads `.env`, connects to MongoDB, and starts listening.

```bash
cd inventory-management-system
npm install
cp .env.example .env     # then set MONGODB_URI (and optionally PORT)
npm run dev              # nodemon, restarts on file changes
npm start                # plain node
```

### Environment

Copy `.env.example` to `.env`. `MONGODB_URI` is required — the app exits at startup with a clear message if it is missing. `.env` is gitignored; never commit real credentials.

### Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/books` | Creates a book from the JSON request body. Requires `title`, `author` and `countInStock`. |
| `GET` | `/books` | Returns every book. |
| `GET` | `/books/:id` | Returns one book, or `null` when no book has that id. |

Example:

```bash
curl http://localhost:3000/books
curl http://localhost:3000/books/<ID>

curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{"title":"The Pragmatic Programmer","author":"Hunt & Thomas","countInStock":3}'
```

Responses are always JSON:

| Status | When |
| --- | --- |
| `200` | Books returned by `GET /books` or `GET /books/:id`. A missing book currently returns `200` with `null`, not `404`. |
| `201` | Book created; returns the stored document |
| `400` | `title`/`author`/`countInStock` missing, of the wrong type, or `countInStock` not a number (`{"message":"Validation failed","errors":{...}}`) |
| `400` | `:id` is not a valid ObjectId, or a numeric field cannot be cast (`{"message":"..."}`) |
| `400` | Request body is not valid JSON (`{"message":"Invalid JSON body"}`) |
| `404` | Unknown path or method (`{"message":"Route not found"}`) |
| `500` | Unexpected server error (details logged, not exposed) |

> **Note:** the `Book` schema in `index.js` has three required fields: `title` (a `String`), `author` (a `String`) and `countInStock` (a `Number`). Mongoose strict mode drops fields that are not in the schema, so any extra keys in the request body are not stored. These field names are still being iterated on.

### Scripts

| Script | Command | Purpose |
| --- | --- | --- |
| `npm start` | `node app.js` | Run the server |
| `npm run dev` | `nodemon app.js` | Run with auto-restart |
| `npm test` | `node --test` | Node's built-in test runner (no tests yet) |
| `npm run type-check` | `node --check app.js && node --check index.js` | Syntax check only |

## Classwork product API

```bash
cd classwork
npm install
node index.js
```

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/products/high-ratings?rating=3` | Products with `rating` above the given value (default `3`; non-numeric returns `400`) |
| `GET` | `/product/:id` | Single product by id (`404` if unknown) |
| `POST` | `/add-product` | Appends the JSON body to the in-memory list |
| any | anything else | JSON `404` |

Data lives in memory, so it resets on every restart.

## Hello World server

```bash
cd node_learning
npm install
node index.js
```

`GET http://localhost:5000/` returns `Hello, World!`.

## Notes

- Node's `--watch`/nodemon do not reload `.env`; restart after changing it.
- If a route suddenly returns `404` after you edited the code, check for a stale server still holding the port — the old process keeps serving the old routes.
