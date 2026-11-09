# AGENTS.md

Guidance for AI agents working in this repository.

## Project Overview

A small Node.js inventory management API built on Express and Mongoose (MongoDB). The project is in an early stage: a single entry point serves a few hardcoded text routes and opens a MongoDB connection. There is no inventory model, router layer, or persistence logic yet.

## Stack

- Runtime: Node.js
- Framework: Express 5
- Database: MongoDB via Mongoose 9
- Module system: CommonJS (`require` / `module.exports`) — `package.json` sets `"type": "commonjs"`
- Language: plain JavaScript, no TypeScript or build step

## Running the App

```bash
npm install
cp .env.example .env  # then fill in MONGODB_URI
npm start              # or: npm run dev (nodemon)
```

- Configuration is loaded from `.env` via Node's built-in `--env-file` flag; no dotenv package is used.
- Server listens on `process.env.PORT`, defaulting to `3000`.
- The app exits at startup if `MONGODB_URI` is missing.
- The app connects to MongoDB on startup; a connection failure is logged but the HTTP server still starts.

## Repository Layout

```
index.js        # Express app, route handlers, Mongo connection, server startup
package.json    # Dependencies and scripts
.env.example    # Template for required environment variables
.gitignore      # Ignores node_modules and .env
```

Everything lives in `index.js` today. When adding features, keep the existing structure recognizable and introduce folders only when the code justifies them (for example `models/`, `routes/`, `controllers/`).

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
- There is no error-handling middleware, validation, or 404 handler.
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
