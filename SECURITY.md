# Security policy

## Supported versions

Security fixes are applied to the latest version on the `main` branch. Please make sure you are testing the latest code before reporting an issue.

## Reporting a vulnerability

Please **do not** report security vulnerabilities through public GitHub issues.

Instead, use GitHub's private vulnerability reporting:

1. Open the [Security Advisories](https://github.com/udyan-upal/erasr/security/advisories/new) page for this repository.
2. Click **Report a vulnerability**.
3. Include a description of the issue, steps to reproduce, the affected version or commit, and any relevant proof of concept.

Reports are reviewed on a best-effort basis. Please allow time for a fix before disclosing the issue publicly.

## Scope

erasr reads and deletes browsing history locally using Chrome's `history` permission. Security-relevant issues include, but are not limited to:

- Unintended network requests or data collection.
- History data being exposed or sent anywhere.
- Over-broad permissions or unexpected access to browsing data.
- Code injection or execution of untrusted content.
- Bugs that delete history other than what the user reviewed and confirmed.

Out of scope:

- Vulnerabilities in Chrome or the operating system itself.
- Attacks that require an attacker to already have local filesystem or account access.
- General privacy questions that do not describe a security weakness.

## Privacy by design

- Only the `history` permission is requested.
- No host permissions, content scripts, telemetry, or runtime network requests.
- Styles, fonts, and icons are bundled locally.
- Search and deletion happen entirely on the user's device.
