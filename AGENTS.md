# AGENTS.md

Guidance for AI agents working in this repository.

## Project Overview

A small Node.js inventory management API built on Express and Mongoose (MongoDB). The project is in an early stage: a single entry point opens a MongoDB connection and exposes one route, `POST /books`, which creates a document through a `Book` model. The schema is still an empty placeholder and no router/controller layer exists yet.

## Stack

- Runtime: Node.js
- Framework: Express 5
- Database: MongoDB via Mongoose 9
- Configuration: `dotenv` (path pinned to `__dirname/.env`)
- Module system: CommonJS (`require` / `module.exports`) — `package.json` sets `"type": "commonjs"`
- Language: plain JavaScript, no TypeScript or build step

## Running the App

```bash
npm install
cp .env.example .env  # then fill in MONGODB_URI
npm start              # or: npm run dev (nodemon)
```

- Configuration is loaded from `.env` by `dotenv` in the first statements of `index.js`: `require("dotenv").config({ path: path.join(__dirname, ".env"), quiet: true })`. Keep that call above anything that reads `process.env` — it was previously placed after the `PORT` read, which silently ignored `PORT` in `.env`. Because the path is resolved from `__dirname`, `node index.js` works from any working directory. Existing shell environment variables take precedence over `.env` values, and there is no `--env-file` flag in the npm scripts.
- Server listens on `process.env.PORT`, defaulting to `3000`. The local `.env` sets `PORT=3000`, the same port the sibling `node_learning/` and `classwork/` apps use, so only one of them can run at a time.
- **A stale server causes phantom 404s.** Node does not reload code, so if you start the app, edit `index.js`, and request again, the *old* process still answers on `3000` with the old routes. This happened once: `POST /books` returned `404 Cannot POST /books` while `GET /` returned 200 from a process started hours before the rewrite. Before debugging routes, check `Get-NetTCPConnection -LocalPort 3000 -State Listen` and compare the listener's `StartTime` with `(Get-Item index.js).LastWriteTime`; kill the old PID and restart.
- The app exits at startup with a clear message if `MONGODB_URI` is missing; the check runs before `app.listen(...)`.
- The app connects to MongoDB on startup; a connection failure is logged but the HTTP server still starts.
- **Port 27017 egress depends on the network.** On `NITDA-ICT-HUB` the app failed with "Could not connect to any servers … IP that isn't whitelisted" even though Atlas had `0.0.0.0/0` open: that Wi-Fi dropped outbound TCP 27015-27017 (`portquiz.net:80` connected, `portquiz.net:27017` and `8.8.8.8:27017` timed out). On `Nodza Gashaka` the same `.env` connects successfully. If the error returns, re-check the network path with `Test-NetConnection portquiz.net -Port 27017` before touching Atlas or the code.

## Repository Layout

```
inventory-management-system/
  index.js        # Express app, Book model, POST /books, Mongo connection, startup
  package.json    # Dependencies and scripts (start, dev via nodemon, test, type-check)
  .env.example    # Template for MONGODB_URI and PORT
node_learning/    # Separate scratch Express app ("Hello, World!" on port 5000)
classwork/        # Separate scratch Express app (in-memory products)
```

The inventory app lives in `inventory-management-system/index.js`. Introduce folders only when the code justifies them (for example `models/`, `routes/`, `controllers/`).

## Classwork App (`classwork/`)

`classwork/` is a separate npm project with its own `package.json`, `node_modules/`, and Express 5 dependency; it is not part of the inventory API and has no Mongo connection. Run it with `node index.js` from inside `classwork/`.

- `classwork/index.js` serves an in-memory array of 8 products (no database).
- `GET /products/high-ratings` filters `rating > ?rating`, defaulting to `3` when the query is omitted; a non-numeric value returns `400`.
- `GET /product/:id` returns the product or `404` when the id is unknown or not an integer.
- Unmatched routes fall through to a JSON `404` handler.
- The port is `process.env.PORT ?? 3000`. Note that port `3000` is also the root app's default, so set `PORT` when running both at once (a second bind on `3000` fails or silently conflicts).

## Conventions

- Routes are registered directly with `app.get(...)`; follow that style until a router split is introduced.
- Use `const`/`let`, double quotes, and semicolons to match existing code.
- Keep port and connection settings configurable when touched — do not add more hardcoded values.
- No linting or formatting tooling is configured. `npm run type-check` currently only performs a JavaScript syntax check (`node --check`) because there is no TypeScript in the project. Match the surrounding style rather than reformatting files.
- Never commit `.env`; add new variables to `.env.example` with placeholder values.

## Testing

Tests run with Node's built-in test runner (`node --test`). There are no test files yet, so `npm test` reports zero tests and passes. Add tests as `*.test.js` or under a `test/` directory.

## Known Issues and Cautions

- **Credentials are loaded from `MONGODB_URI`** in `.env` (gitignored). Never hardcode connection strings or commit `.env`. `.env.example` documents the required variables with placeholders.
- `mongoose.connect(...)` is called after `app.listen(...)` and is not awaited before serving traffic. Keep this ordering in mind: handlers can run before the database is ready.
- **`Book` uses an empty schema** (`mongoose.Schema({})`). Mongoose strict mode drops unknown paths, so `POST /books` with `{"title":"test"}` stores and returns only `{"_id":"…","__v":0}` — the field is silently discarded. Define real schema fields before relying on the data.
- `BookModel = mongoose.model("Book", bookSchema)` is assigned without `const`, creating an implicit global. Make it `const`.
- Only `POST /books` exists; `GET /books`, `GET /` and every other method/path return Express's default `Cannot GET/POST ...` 404. A Postman request to the wrong method on `/books` therefore looks like a missing route.
- There is no error-handling middleware, validation, or custom 404 handler.
- `node_modules/` and `package-lock.json` are present; do not modify them by hand.

## Mandatory Guardrails & Security

- **Credentials & Secrets:** Never look at, expose, or log database passwords, connection strings, or sensitive credentials without explicit permission.
- **Git Commits:** Do not include co-authors in git commit messages or trailers (e.g., no `Co-authored-by:` lines).
- **Code Integrity:** Always ensure `npm run type-check` and tests pass before completing a task.
- **Dependencies:** Do not introduce new third-party packages without explicit permission.

## Before Finishing Work

- Update the AGENTS.md file based on the stage/progress of the repo
- Run the server and confirm it starts if you changed startup or routing code.
- Remove debugging `console.log` output that is not intentional.
- Do not commit secrets or the MongoDB connection string.
