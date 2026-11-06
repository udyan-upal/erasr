# AGENTS.md

## Project

`erasr` is a local-first Chrome Manifest V3 extension for reviewing and deleting browsing history. Runtime code is vanilla JS with no dependencies and no bundler; `index.html` can be loaded unpacked directly.

## Commands

Requires Node.js 20+ for development only.

```sh
npm ci                                          # install dev deps (Tailwind, Phosphor icons)
npm test                                        # all tests
node --test tests/history.test.mjs              # one test file
node --test --test-name-pattern="normalizes" tests/history.test.mjs
npm run build:css                               # regenerate style.css
```

There is no lint, typecheck, or formatter script.

## Generated stylesheet

- `style.css` is generated and committed. Never edit it directly.
- Edit `src/style.css` or utility classes in `index.html`, then run `npm run build:css` and commit both files. CI rebuilds it and fails if `style.css` is stale.
- Tailwind v4 uses `source(none)` and explicit `@source` entries for `index.html` and `app.js` in `src/style.css`. Add `@source` for any new file containing utility classes.

## Architecture

- `background.js` opens `index.html` in a new tab when the extension action is clicked.
- `app.js` owns all UI state, search submission, pagination, confirmation, and deletion. It imports search logic from `history.mjs`.
- `history.mjs` is pure and testable; the `chrome.history` API object is passed in as an argument rather than accessed globally.
- `findHistory()` deliberately searches with `startTime: 0` and `maxResults: 2147483647`. Chrome otherwise returns only 100 results from the last 24 hours; do not narrow these values.
- Site search uses `matchesSite()` on every result. Chrome's text search is only a prefilter, and loose matching could delete another site's history.
- Deletion uses `chrome.history.deleteUrl` per reviewed URL, not range deletion. Bulk delete is limited to the entries the user reviewed.

## Constraints

- Keep `manifest.json` permissions at `history` only. Do not add host permissions, content scripts, remote code, telemetry, or runtime network requests; this is a core product guarantee.
- Do not add runtime dependencies. Development dependencies should stay minimal.
- Tests use Node's built-in runner with mocked DOM and `chrome` APIs; they are not browser end-to-end tests. After runtime changes, reload the unpacked extension at `chrome://extensions` and verify search/deletion manually in Chrome.
- `tests/app.test.mjs` evaluates `app.js` in a `vm` with a hand-written DOM mock. Changing element IDs or DOM APIs in `app.js` may require updating that mock.
- Update `docs/screenshot.png` when visible UI changes; README embeds it.

## Commit messages

Repo history uses plain imperative subjects, not Conventional Commits (`feat:`/`fix:`).

- Subject: imperative mood, sentence case, no trailing period, ideally <=72 characters — `Add keyword search`, not `added keyword search` or `feat: keyword search`.
- One logical change per commit. Keep unrelated refactors, formatting, and docs in separate commits.
- If the subject is not self-explanatory, add a blank line and a body explaining what changed and why; wrap around 72 characters.
- Reference issues in the body (`Closes #12`), not the subject.
- Run `npm test` before committing; CI also verifies the generated stylesheet. Keep `main` green.
