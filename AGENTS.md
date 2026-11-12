# AGENTS.md

Guidance for AI agents working in this repository.

## Project Overview

A small Node.js inventory management API built on Express and Mongoose (MongoDB). `app.js` is the entry point (loads `.env`, validates `MONGODB_URI`, requires `./index`, starts listening, connects to MongoDB). `index.js` builds and exports the Express app: it applies `express.json()`, mounts `booksRouter` at `/books`, and owns the JSON `404` handler and the error handler. The book handlers live in `routes/books.routes.js` as an `express.Router()`, and the `Book` schema/model lives in `models/book.model.js` — the model had to leave `index.js` because a router requiring `index.js` for it would be a circular require. Routes: `POST /books` creates a document, `GET /books` returns every book, `GET /books/:id` returns one book, `PUT /books/:id` updates one, `DELETE /books/:id` deletes one. The `Book` model requires `title`, `author` and `countInStock`. Responses are JSON: validation failures return `400`, unknown routes return a JSON `404`, and unexpected errors return `500` without leaking stack traces. There is no controller layer yet — add one under `controllers/` if the handlers grow past CRUD.

## Stack

- Runtime: Node.js
- Framework: Express 5
- Database: MongoDB via Mongoose 9
- Configuration: `dotenv` (path pinned to `__dirname/.env`)
- Module system: CommonJS (`require` / `module.exports`) — `package.json` sets `"type": "commonjs"`
- Language: plain JavaScript, no TypeScript or build step
- Linting: ESLint 10 (flat config), installed once in the **root** `package.json` and shared by all three projects

## Running the App

```bash
npm install
cp .env.example .env  # then fill in MONGODB_URI
npm start              # or: npm run dev (nodemon)
```

- Configuration is loaded from `.env` by `dotenv` in the first statements of `app.js`: `require("dotenv").config({ path: path.join(__dirname, ".env"), quiet: true })`. Keep that call above anything that reads `process.env` — it was previously placed after the `PORT` read, which silently ignored `PORT` in `.env`. Because the path is resolved from `__dirname`, `node app.js` works from any working directory. Existing shell environment variables take precedence over `.env` values, and there is no `--env-file` flag in the npm scripts.
- `app.js` requires `./index` **after** the dotenv call; requiring it earlier would still work today (nothing in `index.js` reads `process.env` at load time), but keeping the order means future `process.env` reads in `index.js` see `.env` values.
- Server listens on `process.env.PORT`, defaulting to `3000`. The local `.env` sets `PORT=3000`, the same port the sibling `node_learning/` and `classwork/` apps use, so only one of them can run at a time.
- **A stale server causes phantom 404s.** Node does not reload code, so if you start the app, edit `app.js` or `index.js`, and request again, the *old* process still answers on `3000` with the old routes. This happened once: `POST /books` returned `404 Cannot POST /books` while `GET /` returned 200 from a process started hours before the rewrite. Before debugging routes, check `Get-NetTCPConnection -LocalPort 3000 -State Listen` and compare the listener's `StartTime` with the newer of `(Get-Item index.js).LastWriteTime` and `(Get-Item app.js).LastWriteTime`; kill the old PID and restart.
- The app exits at startup with a clear message if `MONGODB_URI` is missing; the check runs before `app.listen(...)`.
- The app connects to MongoDB on startup; a connection failure is logged but the HTTP server still starts.
- **Port 27017 egress depends on the network.** On `NITDA-ICT-HUB` the app failed with "Could not connect to any servers … IP that isn't whitelisted" even though Atlas had `0.0.0.0/0` open: that Wi-Fi dropped outbound TCP 27015-27017 (`portquiz.net:80` connected, `portquiz.net:27017` and `8.8.8.8:27017` timed out). On `Nodza Gashaka` the same `.env` connects successfully. If the error returns, re-check the network path with `Test-NetConnection portquiz.net -Port 27017` before touching Atlas or the code.
- **Local MongoDB is the fallback for blocked networks.** MongoDB Community Server is installed on this machine as Windows service `MongoDB` (`winget install --id MongoDB.Server --exact`), listening on `127.0.0.1:27017` with data under `C:\Program Files\MongoDB\Server\<version>\data`. Switching between Atlas and local is a `.env`-only change — `MONGODB_URI=mongodb://127.0.0.1:27017/inventory-management` for local, the `mongodb+srv://` string for Atlas. No code reads or rewrites the URI, so do not add connection-branching logic. The local database starts empty and is unrelated to the Atlas data. Keep the MSI default `bindIp` (loopback only): there is no authentication configured, and changing it to `0.0.0.0` would expose an unauthenticated database to the network. `mongosh` (`winget install --id MongoDB.Shell --exact`) is optional and only used to verify the server answers.

## Repository Layout

```
package.json      # ROOT, tooling only: ESLint devDependencies + lint/lint:fix scripts
eslint.config.mjs # ESLint 10 flat config for all three projects (ESM file)
.gitignore        # Root ignores: node_modules/, .env*, *.log
inventory-management-system/
  app.js          # Entry point: dotenv, MONGODB_URI check, app.listen, mongoose.connect
  index.js        # Express app: express.json, mounts booksRouter at /books, JSON 404, error handler
  models/
    book.model.js # bookSchema + Book model (mongoose.model("Book", ...))
  routes/
    books.routes.js # express.Router(): POST /, GET /, GET /:id, PUT /:id, DELETE /:id
  package.json    # Dependencies and scripts (start, dev via nodemon, test, type-check)
  .env.example    # Template for MONGODB_URI and PORT
node_learning/    # Separate scratch Express app ("Hello, World!" on port 5000)
classwork/        # Separate scratch Express app (in-memory products)
```

The inventory app lives in `inventory-management-system/`. `index.js` builds the app and owns the middleware order; book request handling lives in `routes/books.routes.js` and the schema in `models/book.model.js`. Process-level concerns (env, listening, DB connection) stay in `app.js`; `index.js` ends with `module.exports = app` and must never call `app.listen` or `mongoose.connect`. Requiring `index.js` alone therefore builds the app without opening a port, which is what tests should use. `package.json` points `main` and the `start`/`dev` scripts at `app.js`, so running `node index.js` only builds the app and exits — it does not serve. Add new folders only when the code justifies them (`controllers/` is the next candidate); do not create empty placeholder files.

## Linting

ESLint runs from the repository root and covers all three projects — do not add a second ESLint config inside a sub-project.

```bash
npm install        # once, at the repo root
npm run lint       # report
npm run lint:fix   # auto-fix
```

- Config lives in the root `eslint.config.mjs` (ESLint 10 is flat-config only; `.eslintrc*` and `.eslintignore` are no longer supported).
- The config file is ESM while every project's source is CommonJS. That is expected: the config uses `import` / `export default`, and `languageOptions.sourceType` is `"commonjs"` for `**/*.js`.
- Rules: `js.configs.recommended` from `@eslint/js`, plus `globals.node`.
- `no-unused-vars` is configured with `argsIgnorePattern: "^next$"` **for `inventory-management-system/index.js` only**, because Express recognises error handlers by arity and the unused `next` parameter is required. Do not "fix" that parameter by deleting it.
- The VS Code ESLint extension picks this up automatically because the root has `node_modules/eslint`. If a file shows no squiggles, open the repo root as the workspace folder.

## Classwork App (`classwork/`)

`classwork/` is a separate npm project with its own `package.json`, `node_modules/`, and Express 5 dependency; it is not part of the inventory API and has no Mongo connection. Run it from inside `classwork/`: `npm start` (`node index.js`), `npm run dev` (`nodemon index.js`, restarts on changes), or bare `node --watch index.js`. `nodemon` is a **devDependency here** — keep it that way and do not add it to `dependencies`.

- `classwork/index.js` serves an in-memory array of 8 products (no database).
- `GET /products/high-ratings` filters `rating > ?rating`, defaulting to `3` when the query is omitted; a non-numeric value returns `400`.
- `GET /product/:id` returns the product or `404` when the id is unknown or not an integer.
- `POST /add-product` appends the JSON body to the in-memory list.
- Unmatched routes fall through to a JSON `404` handler.
- The port is `process.env.PORT ?? 3000`. Note that port `3000` is also the root app's default, so set `PORT` when running both at once (a second bind on `3000` fails or silently conflicts).
- `npm test` is still the npm placeholder that exits with an error; there are no tests in this project. Switching it to `node --test` would make it pass with zero tests, like the inventory app — a deliberate change, not a drive-by one.
- `npm install` here reports 2 moderate `npm audit` findings from `nodemon`'s `minimatch` dependency. They are dev-only; `npm audit fix --force` would *downgrade* nodemon to 3.1.11, so leave it alone unless a real fix lands upstream.

## Conventions

- Routes live on an `express.Router()` in `routes/books.routes.js`, mounted once in `index.js` with `app.use("/books", booksRouter)`. Declare paths relative to the mount point (`router.get("/:id")`, not `router.get("/books/:id")`), and register new routers in `index.js` **above** the 404 handler.
- Use `const`/`let`, double quotes, and semicolons to match existing code.
- Keep port and connection settings configurable when touched — do not add more hardcoded values.
- Linting is ESLint (see **Linting** above): run `npm run lint` from the repo root before considering a change done. `npm run type-check` (inside `inventory-management-system/`) still only performs a JavaScript syntax check (`node --check` on `app.js`, `index.js`, `routes/books.routes.js` and `models/book.model.js`) because there is no TypeScript in the project. Add any new source file to that script. Match the surrounding style rather than reformatting files.
- Never commit `.env`; add new variables to `.env.example` with placeholder values.

## Testing

Tests run with Node's built-in test runner (`node --test`). There are no test files yet, so `npm test` reports zero tests and passes. Add tests as `*.test.js` or under a `test/` directory. A test can `require("./index")` to exercise routes without opening a port or connecting to MongoDB, since only `app.js` does those.

## Known Issues and Cautions

- **Credentials are loaded from `MONGODB_URI`** in `.env` (gitignored). Never hardcode connection strings or commit `.env`. `.env.example` documents the required variables with placeholders.
- `mongoose.connect(...)` is called after `app.listen(...)` and is not awaited before serving traffic. Keep this ordering in mind: handlers can run before the database is ready.
- **`Book` has three required fields**, `title` (`String`), `author` (`String`) and `countInStock` (`Number`). Mongoose strict mode drops unknown paths, so extra keys in the request body are not stored. Add fields to `bookSchema` (in `models/book.model.js`) rather than relying on arbitrary body keys. The field names are still being iterated on, so update this list whenever `bookSchema` changes.
- Each book handler wraps its own `try`/`catch` and returns `400` with `error.message`. The `index.js` error middleware is the second line of defence for anything a handler does not catch: Express 5 forwards rejected promises from async handlers to it. Anything thrown outside a request (e.g. in `mongoose.connect`) is not covered.
- Inside `index.js`, the error middleware must stay **after** the router mount and keep its four-argument signature `(error, req, res, next)`; Express only recognises error handlers by arity. The JSON `404` handler must stay after the router mount too, and `module.exports = app` must stay last. A router registered below the 404 handler is unreachable.
- Registered routes are `POST /books`, `GET /books`, `GET /books/:id`, `PUT /books/:id` and `DELETE /books/:id`; there is no `PATCH`. Unknown paths and methods return `{"message":"Route not found"}` with `404`; a Postman request with the wrong method therefore looks like a missing route.
- **No book route returns `404`.** A valid ObjectId with no matching book produces `400` with `{"message":"Book not found"}` from `GET`, `PUT` and `DELETE`. An id that is not a valid ObjectId throws a `CastError`, which each handler's own `catch` turns into a `400`. Returning `404` for a missing document is the usual REST choice and would be a behaviour change — decide deliberately, do not "fix" it as part of an unrelated edit.
- `node_modules/` and `package-lock.json` are present; do not modify them by hand.
- The root `.gitignore` ignores the root `node_modules/`, but `node_learning/node_modules/` is **already committed** upstream (588 tracked files) and `classwork/` + `inventory-management-system/` each have their own `.gitignore`. Adding a root ignore rule does not untrack files that are already in the index, so never `git add` a `node_modules` tree. Commit the root `package-lock.json` with the lint tooling change so installs stay reproducible.
- Root `npm install` installs ESLint only (~80 packages, all devDependencies). It does not install the apps' runtime dependencies; each sub-project still needs its own `npm install`.

## Mandatory Guardrails & Security

- **Credentials & Secrets:** Never look at, expose, or log database passwords, connection strings, or sensitive credentials without explicit permission.
- **Git Commits:** Do not include co-authors in git commit messages or trailers (e.g., no `Co-authored-by:` lines).
- **Documentation in every commit (mandatory):** Every commit must review and update **both** `README.md` and this `AGENTS.md` so they match the code being committed. A change to routes, endpoints, request/response shapes, scripts, ports, environment variables, dependencies, project structure, or known issues is never complete until both files say so. If a file genuinely needs no change, state that explicitly in the commit message or hand-off. Do not leave documentation updates for a later commit.
- **Code Integrity:** Always ensure `npm run type-check` and tests pass before completing a task.
- **Dependencies:** Do not introduce new third-party packages without explicit permission.

## Before Finishing Work

- Re-read `README.md` and `AGENTS.md` and update both to reflect the work being committed (see **Documentation in every commit** above). `README.md` is the user-facing description of setup and endpoints; `AGENTS.md` is the agent-facing record of state, conventions, and pitfalls. Keep them consistent with each other.
- Run `npm run lint` from the repo root and resolve new reports (or explain why a rule is intentionally disabled).
- Run the server and confirm it starts if you changed startup or routing code.
- Remove debugging `console.log` output that is not intentional.
- Do not commit secrets or the MongoDB connection string.
