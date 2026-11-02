export function normalizeSite(value) {
  const text = value.trim();
  let url;
  try {
    url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    throw new Error("Enter a valid website, like facebook.com.");
  }
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "").replace(/^www\./, "");
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      !hostname || /[\s*]/.test(hostname) ||
      (!hostname.includes(".") && hostname !== "localhost") ||
      (!hostname.startsWith("[") && hostname.split(".").some(label => !/^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(label)))) {
    throw new Error("Enter a valid website, like facebook.com.");
  }
  return hostname;
}

export function parseSearch(value) {
  const query = value.trim();
  if (!query) throw new Error("Enter a website or keyword.");
  try {
    return { query: normalizeSite(query), mode: "site" };
  } catch {
    return { query, mode: "keyword" };
  }
}

export function matchesSite(value, site) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    return ["http:", "https:"].includes(url.protocol) &&
      (hostname === site || hostname.endsWith(`.${site}`));
  } catch {
    return false;
  }
}

export async function findHistory(history, query, mode = "auto") {
  if (mode === "auto") ({ query, mode } = parseSearch(query));
  if (!["site", "keyword"].includes(mode)) throw new Error("Choose Site or Keyword search.");
  query = query.trim();
  if (!query) throw new Error("Enter a website or keyword.");
  // Chrome defaults to only 100 results and the last 24 hours; override both.
  // Search is only a prefilter: validate hostnames so titles, paths and lookalike
  // domains can never cause another site's history to be deleted.
  // Fetch all entries for keyword searches to support literal substrings and
  // phrases independently of Chrome's own text-search tokenization.
  const entries = await history.search({ text: mode === "site" ? query : "", startTime: 0, maxResults: 2147483647 });
  const keyword = query.toLowerCase();
  return entries.filter(entry => {
    if (mode === "site") return matchesSite(entry.url, query);
    try {
      if (!["http:", "https:"].includes(new URL(entry.url).protocol)) return false;
    } catch {
      return false;
    }
    return (entry.title || "").toLowerCase().includes(keyword) || entry.url.toLowerCase().includes(keyword);
  })
    .sort((a, b) => (b.lastVisitTime || 0) - (a.lastVisitTime || 0));
}
