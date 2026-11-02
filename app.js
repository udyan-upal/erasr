import { parseSearch, findHistory } from "./history.mjs";

const $ = id => document.getElementById(id);
const form = $("search-form");
const input = $("site");
const search = $("search");
const status = $("status");
const results = $("results");
const list = $("history");
const remove = $("delete");
const more = $("more");
const dialog = $("confirmation");
let entries = [];
let matchDescription = "";
let shown = 0;
let pendingDeletion = [];

function setBusy(busy) {
  input.disabled = busy;
  search.disabled = busy;
  remove.disabled = busy;
  more.disabled = busy;
  list.querySelectorAll("button").forEach(button => { button.disabled = busy; });
  results.setAttribute("aria-busy", String(busy));
}

function showMore() {
  const fragment = document.createDocumentFragment();
  for (const entry of entries.slice(shown, shown + 100)) {
    const item = document.createElement("li");
    const title = document.createElement("a");
    title.className = "page-title";
    title.href = entry.url;
    title.target = "_blank";
    title.rel = "noopener noreferrer";
    title.textContent = entry.title || entry.url;
    const url = document.createElement("div");
    url.className = "page-url";
    url.textContent = entry.url;
    const details = document.createElement("div");
    details.className = "page-details";
    details.append(title, url);
    const deleteItem = document.createElement("button");
    deleteItem.type = "button";
    deleteItem.className = "delete-item";
    deleteItem.textContent = "Delete";
    deleteItem.setAttribute("aria-label", `Delete history for ${entry.title || entry.url}`);
    deleteItem.addEventListener("click", () => {
      confirmDeletion([entry], `Remove all visits to this page?\n${entry.url}`);
    });
    item.append(details, deleteItem);
    if (entry.lastVisitTime) {
      const time = document.createElement("time");
      const date = new Date(entry.lastVisitTime);
      time.dateTime = date.toISOString();
      time.textContent = date.toLocaleString();
      details.append(time);
    }
    fragment.append(item);
  }
  list.append(fragment);
  shown = Math.min(shown + 100, entries.length);
  more.hidden = shown >= entries.length;
}

function render(visibleCount = 100) {
  list.replaceChildren();
  shown = 0;
  results.hidden = entries.length === 0;
  $("count").textContent = `${entries.length.toLocaleString()} matching ${entries.length === 1 ? "page" : "pages"}`;
  showMore();
  while (shown < Math.min(visibleCount, entries.length)) showMore();
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  try {
    const { query, mode } = parseSearch(input.value);
    setBusy(true);
    entries = [];
    render();
    status.textContent = "Searching history…";
    entries = await findHistory(chrome.history, query, mode);
    matchDescription = mode === "site" ? `on ${query} and its subdomains` : `with “${query}” in the title or URL`;
    input.value = query;
    render();
    status.textContent = entries.length ? `History ${matchDescription}.` : `No saved history ${matchDescription}.`;
  } catch (error) {
    status.textContent = error.message || "Could not search history. Please try again.";
  } finally {
    setBusy(false);
  }
});

more.addEventListener("click", showMore);

function confirmDeletion(items, message) {
  pendingDeletion = [...items];
  $("confirm-message").textContent = message;
  dialog.returnValue = "cancel";
  dialog.showModal();
}

remove.addEventListener("click", () => {
  confirmDeletion(entries, `Remove all visits to these ${entries.length.toLocaleString()} matching pages ${matchDescription}?`);
});

dialog.addEventListener("close", async () => {
  const snapshot = pendingDeletion;
  pendingDeletion = [];
  if (dialog.returnValue !== "delete" || !snapshot.length) return;
  const visibleCount = shown;
  const single = snapshot.length === 1;
  setBusy(true);
  // Only delete URLs actually reviewed, not newly found history.
  const deleted = new Set();
  let failed = 0;
  try {
    for (let i = 0; i < snapshot.length; i += 20) {
      status.textContent = `Deleting… ${i.toLocaleString()} / ${snapshot.length.toLocaleString()} pages`;
      await Promise.all(snapshot.slice(i, i + 20).map(async entry => {
        try {
          await chrome.history.deleteUrl({ url: entry.url });
          deleted.add(entry.url);
        } catch {
          failed++;
        }
      }));
    }
    entries = entries.filter(entry => !deleted.has(entry.url));
    render(visibleCount);
    status.textContent = failed
      ? `Deleted ${deleted.size.toLocaleString()} pages. ${failed.toLocaleString()} could not be deleted; try again.`
      : single ? "Deleted history for this page."
        : `Deleted history for ${deleted.size.toLocaleString()} pages ${matchDescription}.`;
  } finally {
    setBusy(false);
    if (single) (list.querySelector("button") || input).focus();
  }
});
