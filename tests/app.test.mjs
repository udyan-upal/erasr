import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { parseSearch, findHistory } from "../history.mjs";

class Element {
  children = [];
  listeners = {};
  value = "";
  textContent = "";
  append(...children) {
    for (const child of children) {
      if (child.tag === "fragment") this.children.push(...child.children);
      else this.children.push(child);
    }
  }
  replaceChildren() { this.children = []; }
  setAttribute() {}
  addEventListener(name, handler) { this.listeners[name] = handler; }
  querySelectorAll(tag) {
    return this.children.flatMap(child => [ ...(child.tag === tag ? [child] : []), ...child.querySelectorAll(tag) ]);
  }
  querySelector(tag) { return this.querySelectorAll(tag)[0]; }
  focus() {}
  showModal() {}
}

async function setup(fail = false) {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, new Element());
    return elements.get(id);
  };
  const deleted = [];
  const context = {
    document: {
      getElementById: get,
      createElement: tag => Object.assign(new Element(), { tag }),
      createDocumentFragment: () => Object.assign(new Element(), { tag: "fragment" }),
    },
    chrome: { history: {
      search: async () => [
        { url: "https://example.com/one", title: "Recipes one" },
        { url: "https://example.com/two", title: "Recipes two" },
      ],
      deleteUrl: async ({ url }) => {
        if (fail) throw new Error("Failed");
        deleted.push(url);
      },
    } },
    parseSearch, findHistory,
  };
  const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
  vm.runInNewContext(source.replace(/^import .*;\n/, ""), context);
  get("site").value = "recipes";
  await get("search-form").listeners.submit({ preventDefault() {} });
  return { get, deleted };
}

test("individual deletion removes only the chosen URL and updates results", async () => {
  const { get, deleted } = await setup();
  get("history").querySelectorAll("button")[1].listeners.click();
  assert.match(get("confirm-message").textContent, /https:\/\/example.com\/two/);
  get("confirmation").returnValue = "delete";
  await get("confirmation").listeners.close();
  assert.deepEqual(deleted, ["https://example.com/two"]);
  assert.equal(get("history").children.length, 1);
  assert.match(get("count").textContent, /1 matching page$/);
});

test("canceling individual deletion leaves history untouched", async () => {
  const { get, deleted } = await setup();
  get("history").querySelector("button").listeners.click();
  await get("confirmation").listeners.close();
  assert.deepEqual(deleted, []);
  assert.equal(get("history").children.length, 2);
});

test("failed individual deletion keeps the result available to retry", async () => {
  const { get } = await setup(true);
  get("history").querySelector("button").listeners.click();
  get("confirmation").returnValue = "delete";
  await get("confirmation").listeners.close();
  assert.equal(get("history").children.length, 2);
  assert.match(get("status").textContent, /1 could not be deleted/);
  assert.equal(get("history").querySelector("button").disabled, false);
});

test("delete all still removes every matching URL", async () => {
  const { get, deleted } = await setup();
  get("delete").listeners.click();
  get("confirmation").returnValue = "delete";
  await get("confirmation").listeners.close();
  assert.equal(deleted.length, 2);
  assert.equal(get("results").hidden, true);
});
