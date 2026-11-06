# Contributing to erasr

Thanks for taking the time to contribute. erasr is a small, local-first Chrome extension, and contributions of all sizes are welcome — bug reports, documentation fixes, and focused pull requests.

## Before you start

- Search [existing issues](https://github.com/udyan-upal/erasr/issues) and pull requests to avoid duplicates.
- For bugs, open an issue using the bug report template.
- For larger features or behaviour changes, open an issue first so the approach can be agreed on before you write code.
- For security issues, do **not** open a public issue. Follow [SECURITY.md](SECURITY.md).

## Development setup

You need:

- [Node.js](https://nodejs.org/) 20 or later (for development and tests)
- Google Chrome (to load and manually test the extension)

```sh
git clone https://github.com/udyan-upal/erasr.git
cd erasr
npm ci
```

Running the extension does not require a build:

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select this repository's folder.
4. After changing files, click **Reload** on the extension card and reopen its tab.

## Project layout

| Path | Purpose |
| --- | --- |
| `manifest.json` | Chrome extension manifest |
| `index.html` | Extension page markup |
| `app.js` | UI, search, and deletion flows |
| `history.mjs` | Search parsing and Chrome history helpers |
| `background.js` | Extension service worker |
| `src/style.css` | Tailwind source and custom styles |
| `style.css` | Generated, committed stylesheet |
| `assets/` | Bundled fonts and icons |
| `tests/` | Node test suite |

## Making changes

- Run the tests before opening a pull request:

  ```sh
  npm test
  ```

- If you change styling, edit `src/style.css` or the utility classes in `index.html`, then rebuild the committed stylesheet:

  ```sh
  npm run build:css
  ```

  Commit the regenerated `style.css` with your change. CI verifies that it is up to date.

- Manually verify history search and deletion in Chrome for any change that touches runtime behaviour. The test suite uses mocked browser APIs.

## Project principles

Please keep these invariants intact:

- **Local-first and private.** No analytics, telemetry, or uploads. The extension must not make runtime network requests.
- **Minimal permissions.** Only the `history` permission is required. Do not add host permissions or content scripts without prior discussion.
- **No unnecessary dependencies.** Runtime JavaScript is dependency-free; development dependencies should stay minimal.
- **Small and focused.** Prefer the smallest change that solves the problem.

## Pull requests

- Keep each pull request focused on one change.
- Describe what changed, why, and how you tested it.
- Add or update tests for behaviour changes.
- Update the README or other documentation when user-facing behaviour changes.
- Make sure CI passes.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
