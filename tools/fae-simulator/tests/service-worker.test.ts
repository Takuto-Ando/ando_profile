import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";

function worker() {
  const base = "/ando_profile/fae-simulator/";
  const prefix = "fae-simulator-scope-";
  const cache = `${prefix}new`;
  const assets = [base, `${base}index.html`, `${base}assets/app.js`];
  const handlers: Record<string, (event: unknown) => void> = {};
  const addAll = vi.fn(async () => {});
  const cacheMatch = vi.fn(async () => undefined);
  const fallback = vi.fn(async () => "offline app");
  const remove = vi.fn(async () => true);
  const claim = vi.fn(async () => {});
  const skip = vi.fn(async () => {});
  const network = vi.fn(async () => {
    throw new Error("offline");
  });
  const source = readFileSync("public/sw.js", "utf8")
    .replace("__CACHE__", cache)
    .replace("__PREFIX__", prefix)
    .replaceAll("__BASE__", base)
    .replace("__ASSETS__", JSON.stringify(assets));
  vm.runInNewContext(source, {
    URL,
    fetch: network,
    self: {
      addEventListener: (type: string, handler: (event: unknown) => void) => {
        handlers[type] = handler;
      },
      location: { origin: "https://example.test" },
      clients: { claim },
      skipWaiting: skip,
    },
    caches: {
      open: vi.fn(async () => ({ addAll, match: cacheMatch })),
      keys: vi.fn(async () => [
        `${prefix}old`,
        cache,
        "fae-simulator-other-scope",
        "profile-cache",
      ]),
      delete: remove,
      match: fallback,
    },
  });
  return { base, assets, handlers, addAll, fallback, remove, claim, skip };
}
describe("subpath service worker isolation", () => {
  it("preloads only app-scoped assets", async () => {
    const state = worker();
    let pending: Promise<unknown> | undefined;
    state.handlers.install({
      waitUntil: (promise: Promise<unknown>) => {
        pending = promise;
      },
    });
    await pending;
    expect(state.addAll).toHaveBeenCalledWith(state.assets);
    expect(state.assets.every((url) => url.startsWith(state.base))).toBe(true);
    expect(state.skip).toHaveBeenCalledOnce();
  });
  it("removes only its own previous cache, not profile or other application caches", async () => {
    const state = worker();
    let pending: Promise<unknown> | undefined;
    state.handlers.activate({
      waitUntil: (promise: Promise<unknown>) => {
        pending = promise;
      },
    });
    await pending;
    expect(state.remove).toHaveBeenCalledExactlyOnceWith(
      "fae-simulator-scope-old",
    );
    expect(state.claim).toHaveBeenCalledOnce();
  });
  it("does not intercept admin, root, cross-origin or non-GET requests", () => {
    const state = worker();
    for (const request of [
      { url: "https://example.test/ando_profile/admin/", method: "GET" },
      { url: "https://example.test/", method: "GET" },
      { url: `https://other.test${state.base}`, method: "GET" },
      { url: `https://example.test${state.base}`, method: "POST" },
    ]) {
      const respondWith = vi.fn();
      state.handlers.fetch({ request, respondWith });
      expect(respondWith).not.toHaveBeenCalled();
    }
  });
  it("falls back to the subpath index, not the profile home", async () => {
    const state = worker();
    let pending: Promise<unknown> | undefined;
    state.handlers.fetch({
      request: {
        url: `https://example.test${state.base}unknown`,
        method: "GET",
        mode: "navigate",
      },
      respondWith: (promise: Promise<unknown>) => {
        pending = promise;
      },
    });
    expect(await pending).toBe("offline app");
    expect(state.fallback).toHaveBeenCalledWith(`${state.base}index.html`);
  });
});
