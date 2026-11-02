# Product roadmap

Keep History Clearance minimal, private, and local-first. The items below are planned features, not currently available functionality.

## Priority 1: Scheduled cleanup

- [ ] Add optional automatic deletion every **7, 15, or 30 days**.
- [ ] Let users choose the cleanup scope:
  - **All browsing history** in the current Chrome profile.
  - **A particular site**, including its subdomains, using the same safe domain matching as manual search.
- [ ] Support multiple site rules with independent schedules.
- [ ] Make the deletion policy explicit and separate from the schedule:
  - Delete **all matching history** each time the rule runs.
  - Or delete **only visits older than a chosen retention period**, preserving newer visits.
- [ ] Preview the rule's scope and matching history before enabling it. Require explicit confirmation for automatic, irreversible deletion, especially for all-history rules.
- [ ] Show the next run, last run, outcome, and number of pages or visits removed. Label the counting unit accurately.
- [ ] Provide **Run now**, **Pause/resume**, **Edit**, and **Remove rule** controls. Confirm manual runs.
- [ ] Use `chrome.alarms` and a Manifest V3 service worker; do not depend on an open extension tab.
- [ ] Persist rules locally with `chrome.storage.local`. Request only the additional `alarms` and `storage` permissions needed for scheduling.
- [ ] Restore missing alarms on startup and reconcile overdue schedules after Chrome reopens. Explain that cleanup cannot run while Chrome is closed and timing is approximate.
- [ ] Prevent overlapping runs, handle partial failures, and record outcomes without retaining deleted URLs or titles.
- [ ] Do not silently broaden rules, enable scheduling by default, or run a newly created rule immediately without consent.
- [ ] Test restarts, device sleep, missed runs, rule edits, disabled rules, and deletion failures. Use visit-level deletion for retention policies so newer visits to the same URL are not accidentally removed.

## Priority 2: More control over manual cleanup

- [ ] Add checkboxes to delete multiple selected results without deleting every match.
- [ ] Add date filters: today, last 7 days, last 30 days, and a custom range. Clearly distinguish deleting visits in a range from deleting all visits to a matching URL.
- [ ] Add optional exclusions for protected sites. Show exclusions in previews and apply them consistently to scheduled and manual bulk cleanup.
- [ ] Offer keyword-based scheduled rules after site scheduling is reliable, with a clear preview of title/URL matching and potentially broad results.
- [ ] Show a deletion summary and a retry option for failed items. Never imply that deleted history can be undone.

## Priority 3: Product polish

- [ ] Offer optional local notifications for scheduled cleanup completion or failure; request notification permission only when enabled.
- [ ] Export/import cleanup rules as a local JSON file, without browsing history. Validate imports and require review before enabling imported schedules.
- [ ] Add keyboard shortcuts and improve focus placement after deleting a result.
- [ ] Add end-to-end tests in a disposable Chrome profile for real history search, deletion, and scheduling.
- [ ] Add Chrome Web Store installation once the extension is ready for publication, with a clear permission explanation and privacy policy.
- [ ] Document Chrome Sync implications: deletions may propagate to other devices, but do not erase activity held separately by websites or Google account services.

## Guardrails

- No analytics, account requirement, server uploads, or remote runtime assets.
- Keep search and one-page deletion fast and accessible as features grow.
- Automatic deletion must always be opt-in, understandable, and easy to pause.
- Clearly communicate that deletion is permanent; never promise recovery or complete erasure outside Chrome's accessible history.
