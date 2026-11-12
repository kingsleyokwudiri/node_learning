# node_learning

A collection of small Node.js/Express practice projects. Each project is self-contained with its own `package.json` and `node_modules`, so install and run them from their own folder.

## Projects

| Folder | Stack | What it is | Port |
| --- | --- | --- | --- |
| [`inventory-management-system/`](./inventory-management-system) | Express 5, Mongoose 9, dotenv | Inventory API backed by MongoDB. CRUD over `/books` (`POST`, `GET`, `GET /:id`, `PUT /:id`, `DELETE /:id`). | `3000` (from `.env`) |
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

The main project. Requires a MongoDB connection string. `app.js` is the entry point that loads `.env`, connects to MongoDB, and starts listening; `index.js` builds the Express app and mounts the routers. The pieces are split by responsibility:

| File | Holds |
| --- | --- |
| `app.js` | Process concerns only: dotenv, the `MONGODB_URI` check, `app.listen`, `mongoose.connect` |
| `index.js` | `express.json()`, mounts `booksRouter` at `/books`, the JSON `404` handler, the error handler, `module.exports = app` |
| `routes/books.routes.js` | An `express.Router()` with the five book handlers |
| `models/book.model.js` | `bookSchema` and the `Book` model |

```bash
cd inventory-management-system
npm install
cp .env.example .env     # then set MONGODB_URI (and optionally PORT)
npm run dev              # nodemon, restarts on file changes
npm start                # plain node
```

### Environment

Copy `.env.example` to `.env`. `MONGODB_URI` is required — the app exits at startup with a clear message if it is missing. `.env` is gitignored; never commit real credentials.

Either a hosted Atlas cluster or a local MongoDB server works; the app code does not change:

| Target | `MONGODB_URI` | Notes |
| --- | --- | --- |
| MongoDB Atlas | `mongodb+srv://<username>:<password>@<cluster-host>/<database>` | Needs outbound TCP 27017. |
| Local MongoDB | `mongodb://127.0.0.1:27017/inventory-management` | Loopback only, so it works on networks that block 27017. |

#### Local MongoDB (fallback for blocked networks)

Some networks (for example the `NITDA-ICT-HUB` Wi-Fi) drop outbound TCP 27015–27017. `portquiz.net:80` connects while `portquiz.net:27017` and `8.8.8.8:27017` time out, and Atlas then reports *"Could not connect to any servers… IP that isn't whitelisted"* even with `0.0.0.0/0` open. Rather than editing the Atlas access list, run MongoDB locally:

```powershell
winget install --id MongoDB.Server --exact --accept-package-agreements --accept-source-agreements
winget install --id MongoDB.Shell --exact     # optional: mongosh, for verification
```

The MSI installs a Windows service named `MongoDB` listening on `127.0.0.1:27017`, with data under `C:\Program Files\MongoDB\Server\<version>\data`. Keep the default `bindIp` — loopback-only needs no authentication and is not reachable from the network.

Then put this in `.env` and restart the app:

```
MONGODB_URI=mongodb://127.0.0.1:27017/inventory-management
```

Verify before debugging the app:

```powershell
Get-Service MongoDB
Test-NetConnection 127.0.0.1 -Port 27017
mongosh "mongodb://127.0.0.1:27017/inventory-management" --eval "db.runCommand({ping:1})"
```

The database is created on the first write, and it is empty — nothing from Atlas is copied across. Uninstall with `winget uninstall --id MongoDB.Server`.

### Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/books` | Creates a book from the JSON request body. Requires `title`, `author` and `countInStock`. Returns `201` with the stored document. |
| `GET` | `/books` | Returns every book. |
| `GET` | `/books/:id` | Returns one book, or `400` with `{"message":"Book not found"}` when no book has that id. |
| `PUT` | `/books/:id` | Updates a book with the JSON request body. Returns `200` with `{"message":"Book updated successfully","updatedBook":{...}}`. |
| `DELETE` | `/books/:id` | Deletes a book. Returns `200` with `{"message":"Book deleted successfully"}`. |

`GET`/`PUT`/`DELETE /books/:id` all live in `routes/books.routes.js`, mounted by `index.js` under `/books`.

Example:

```bash
curl http://localhost:3000/books
curl http://localhost:3000/books/<ID>

curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{"title":"The Pragmatic Programmer","author":"Hunt & Thomas","countInStock":3}'

curl -X PUT http://localhost:3000/books/<ID> \
  -H "Content-Type: application/json" \
  -d '{"countInStock":7}'

curl -X DELETE http://localhost:3000/books/<ID>
```

Responses are always JSON:

| Status | When |
| --- | --- |
| `200` | Books returned by `GET /books` or `GET /books/:id`; `PUT` and `DELETE` succeeded |
| `201` | Book created; returns the stored document |
| `400` | `title`/`author`/`countInStock` missing, of the wrong type, or `countInStock` not a number (`{"message":"Validation failed","errors":{...}}`) |
| `400` | `:id` is a valid ObjectId but no book matches (`{"message":"Book not found"}`) |
| `400` | `:id` is not a valid ObjectId, or a numeric field cannot be cast (`{"message":"..."}`) |
| `400` | Request body is not valid JSON (`{"message":"Invalid JSON body"}`) |
| `404` | Unknown path or method (`{"message":"Route not found"}`) |
| `500` | Unexpected server error (details logged, not exposed) |

> **Note:** the `Book` schema in `models/book.model.js` has three required fields: `title` (a `String`), `author` (a `String`) and `countInStock` (a `Number`). Mongoose strict mode drops fields that are not in the schema, so any extra keys in the request body are not stored. These field names are still being iterated on.

### Scripts

| Script | Command | Purpose |
| --- | --- | --- |
| `npm start` | `node app.js` | Run the server |
| `npm run dev` | `nodemon app.js` | Run with auto-restart |
| `npm test` | `node --test` | Node's built-in test runner (no tests yet) |
| `npm run type-check` | `node --check` on `app.js`, `index.js`, `routes/books.routes.js`, `models/book.model.js` | Syntax check only |

## Classwork product API

```bash
cd classwork
npm install
npm run dev     # nodemon, restarts on file changes
npm start       # plain node, no auto-restart
```

`nodemon` is a **devDependency** of this project only (the inventory app has its own). `npm test` is still the npm placeholder that exits with an error — there are no tests here.

The port is `process.env.PORT ?? 3000`. Set `PORT` to run this alongside another app on `3000`:

```powershell
$env:PORT=3001; npm run dev
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
