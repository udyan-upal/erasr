import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSite, parseSearch, matchesSite, findHistory } from "../history.mjs";

test("normalizes domains and full URLs", () => {
  for (const value of ["facebook.com", " FACEBOOK.COM ", "https://www.facebook.com/profile?q=a", "facebook.com/", "facebook.com."]) {
    assert.equal(normalizeSite(value), "facebook.com");
  }
  assert.equal(normalizeSite("https://m.facebook.com"), "m.facebook.com");
  assert.equal(normalizeSite("bücher.de"), "xn--bcher-kva.de");
  assert.equal(normalizeSite("localhost:3000"), "localhost");
});

test("rejects malformed and unsafe input", () => {
  for (const value of ["", "not a site", "com", "*.facebook.com", "https://user:pass@facebook.com", "file://facebook.com", "face_book.com", "-bad.com", "bad..com"]) {
    assert.throws(() => normalizeSite(value));
  }
});

test("matches only exact hosts and their subdomains", () => {
  for (const value of ["https://facebook.com/", "http://www.facebook.com/a", "https://m.facebook.com/", "https://FACEBOOK.COM./"]) {
    assert.equal(matchesSite(value, "facebook.com"), true);
  }
  for (const value of ["https://notfacebook.com", "https://facebook.com.evil.com", "https://example.com/facebook.com", "https://example.com/?next=facebook.com", "file://facebook.com/a", "invalid"]) {
    assert.equal(matchesSite(value, "facebook.com"), false);
  }
});

test("searches all retained history, filters false positives, sorts newest first", async () => {
  const history = {
    async search(options) {
      assert.deepEqual(options, { text: "facebook.com", startTime: 0, maxResults: 2147483647 });
      return [
        { url: "https://facebook.com/old", lastVisitTime: 1 },
        { url: "https://example.com", title: "facebook.com", lastVisitTime: 10 },
        { url: "https://m.facebook.com/new", lastVisitTime: 5 },
      ];
    },
  };
  const entries = await findHistory(history, "facebook.com");
  assert.deepEqual(entries.map(entry => entry.lastVisitTime), [5, 1]);
});

test("handles empty results and propagates API errors", async () => {
  assert.deepEqual(await findHistory({ search: async () => [] }, "facebook.com"), []);
  await assert.rejects(findHistory({ search: async () => { throw new Error("Permission denied"); } }, "facebook.com"), /Permission denied/);
});

test("keyword search matches literal titles and URLs case-insensitively", async () => {
  const history = {
    async search(options) {
      assert.deepEqual(options, { text: "", startTime: 0, maxResults: 2147483647 });
      return [
        { url: "https://example.com/a", title: "Easy RECIPES", lastVisitTime: 1 },
        { url: "https://other.com/recipes/pasta", lastVisitTime: 3 },
        { url: "https://example.com/b", title: "Unrelated", lastVisitTime: 4 },
        { url: "javascript:recipes", title: "recipes", lastVisitTime: 5 },
        { url: "invalid", title: "recipes", lastVisitTime: 6 },
      ];
    },
  };
  const entries = await findHistory(history, "  Recipes  ", "keyword");
  assert.deepEqual(entries.map(entry => entry.lastVisitTime), [3, 1]);
});

test("keyword phrases and punctuation are literal, not regex patterns", async () => {
  const history = { search: async () => [
    { url: "https://example.com/a", title: "Learn C++ today" },
    { url: "https://example.com/b", title: "Learn C today" },
  ] };
  assert.equal((await findHistory(history, "c++ today", "keyword")).length, 1);
  assert.equal((await findHistory(history, ".*", "keyword")).length, 0);
});

test("rejects empty keywords and unsupported modes before calling Chrome", async () => {
  const history = { search: async () => { assert.fail("Must not search"); } };
  await assert.rejects(findHistory(history, "   ", "keyword"), /Enter/);
  await assert.rejects(findHistory(history, "recipes", "unknown"), /Choose/);
});

test("automatically detects domains, URLs, keywords and phrases", () => {
  for (const value of ["facebook.com", "https://www.facebook.com/profile", " FACEBOOK.COM "]) {
    assert.deepEqual(parseSearch(value), { query: "facebook.com", mode: "site" });
  }
  assert.deepEqual(parseSearch("bücher.de"), { query: "xn--bcher-kva.de", mode: "site" });
  for (const value of ["facebook", "recipes", "easy recipes", "C++", "version 1.2"]) {
    assert.deepEqual(parseSearch(` ${value} `), { query: value, mode: "keyword" });
  }
  assert.throws(() => parseSearch("  "), /Enter/);
});

test("default history search detects keywords without a mode", async () => {
  const history = { search: async options => {
    assert.equal(options.text, "");
    return [
      { url: "https://example.com", title: "Recipes" },
      { url: "https://other.com", title: "News" },
    ];
  } };
  assert.equal((await findHistory(history, "recipes")).length, 1);
});
