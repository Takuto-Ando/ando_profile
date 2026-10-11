function documentBridge(channel) {
  const state = new Map();
  const storage = {
    getItem: (key) => state.get(String(key)) ?? null,
    setItem: (key, value) => {
      state.set(String(key), String(value));
    },
    removeItem: (key) => {
      state.delete(String(key));
    },
    clear: () => {
      state.clear();
    },
    key: (index) => Array.from(state.keys())[index] ?? null,
    get length() {
      return state.size;
    },
  };
  Object.defineProperty(window, "localStorage", { value: storage });
  Object.defineProperty(window, "sessionStorage", { value: storage });
  const send = (detail) => parent.postMessage({ channel, ...detail }, "*");
  const initialize = () => {
    let scheduled = false;
    const measure = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        const body = document.body;
        const margin = parseFloat(getComputedStyle(body).marginBottom) || 0;
        send({
          type: "height",
          height: Math.ceil(
            Math.max(
              body.scrollHeight,
              body.getBoundingClientRect().bottom + scrollY + margin,
            ),
          ),
        });
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("load", measure);
    document.addEventListener("click", (event) => {
      if (!event.isTrusted || !(event.target instanceof Element)) return;
      const link = event.target.closest("a");
      if (!(link instanceof HTMLAnchorElement)) return;
      const target = link.dataset.privateDocument;
      if (target) {
        event.preventDefault();
        send({ type: "open", id: target });
      } else if (link.hash && link.getAttribute("href")?.startsWith("#")) {
        event.preventDefault();
        let fragment;
        try {
          fragment = decodeURIComponent(link.hash.slice(1));
        } catch {
          return;
        }
        const section = document.getElementById(fragment);
        if (section)
          send({
            type: "scroll",
            top: section.getBoundingClientRect().top + scrollY,
          });
      }
    });
    measure();
  };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
}

export function prepareDocument(entry, documents, channel) {
  const template = document.createElement("template");
  template.innerHTML = entry.html;
  template.content
    .querySelectorAll(
      "iframe, object, embed, base, meta[http-equiv], script[src]",
    )
    .forEach((element) => element.remove());
  template.content.querySelectorAll("script").forEach((script) => {
    const type = (script.getAttribute("type") || "").toLowerCase();
    if (type === "application/json" || type === "application/ld+json") return;
    if (
      entry.interactive === true &&
      ["", "text/javascript", "application/javascript", "module"].includes(type)
    )
      script.setAttribute("nonce", channel);
    else script.remove();
  });
  template.content.querySelectorAll("*").forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.toLowerCase().startsWith("on"))
        element.removeAttribute(attribute.name);
    }
  });
  template.content.querySelectorAll("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href") || "";
    if (href.startsWith("#")) return;
    if (/^https?:\/\//i.test(href)) {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
      return;
    }
    let path;
    try {
      path = decodeURIComponent(
        new URL(href, "https://private.invalid/" + entry.id).pathname,
      ).slice(1);
    } catch {
      path = "";
    }
    const target =
      documents.find((document) => document.id === path) ||
      documents.find(
        (document) => document.id.split("/").pop() === path.split("/").pop(),
      );
    if (target) {
      anchor.setAttribute("href", "#");
      anchor.setAttribute("data-private-document", target.id);
    } else {
      anchor.removeAttribute("href");
      anchor.setAttribute("title", "関連する原本はこの資料庫に未登録です。");
    }
  });
  return (
    '<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer">' +
    `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${channel}'; script-src-attr 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'">` +
    `<script nonce="${channel}">(${documentBridge.toString()})(${JSON.stringify(channel)});</script>` +
    "</head><body>" +
    template.innerHTML +
    "</body></html>"
  );
}
