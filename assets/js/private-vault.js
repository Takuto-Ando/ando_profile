import { decryptDocument } from "./private-crypto.js";
import { parseLibrary } from "./private-library.js";

const form = document.getElementById("unlock-form");
const password = document.getElementById("password");
const unlock = document.getElementById("unlock");
const lock = document.getElementById("lock");
const gate = document.getElementById("gate");
const status = document.getElementById("status");
const frame = document.getElementById("document");
const library = document.getElementById("library");
const list = document.getElementById("library-list");
const count = document.getElementById("library-count");
const documentBar = document.getElementById("document-bar");
const documentTitle = document.getElementById("document-title");
const back = document.getElementById("back");

if (
  !(form instanceof HTMLFormElement) ||
  !(password instanceof HTMLInputElement) ||
  !(unlock instanceof HTMLButtonElement) ||
  !(lock instanceof HTMLButtonElement) ||
  !(gate instanceof HTMLElement) ||
  !(status instanceof HTMLElement) ||
  !(frame instanceof HTMLIFrameElement) ||
  !(library instanceof HTMLElement) ||
  !(list instanceof HTMLElement) ||
  !(count instanceof HTMLElement) ||
  !(documentBar instanceof HTMLElement) ||
  !(documentTitle instanceof HTMLElement) ||
  !(back instanceof HTMLButtonElement)
) {
  throw new Error("管理者ページの構成が不正です。");
}

let operation = 0;

const relock = () => {
  operation += 1;
  frame.removeAttribute("srcdoc");
  frame.hidden = true;
  library.hidden = true;
  list.replaceChildren();
  count.textContent = "";
  documentBar.hidden = true;
  documentTitle.textContent = "";
  frame.title = "保護された資料";
  gate.hidden = false;
  lock.hidden = true;
  password.value = "";
  unlock.disabled = false;
  status.textContent = "";
};

const showLibrary = () => {
  frame.removeAttribute("srcdoc");
  frame.hidden = true;
  frame.title = "保護された資料";
  documentBar.hidden = true;
  documentTitle.textContent = "";
  library.hidden = false;
};

const renderLibrary = (entries) => {
  list.replaceChildren();
  count.textContent = `${entries.length}件の資料。閲覧する資料を選んでください。`;
  for (const entry of entries) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "library-card";
    const title = document.createElement("span");
    title.className = "library-card-title";
    title.textContent = entry.title;
    const action = document.createElement("span");
    action.className = "note";
    action.textContent = "資料を開く →";
    card.append(title, action);
    card.addEventListener("click", () => {
      frame.srcdoc = protectedDocument(entry.html);
      frame.title = entry.title;
      documentTitle.textContent = entry.title;
      library.hidden = true;
      documentBar.hidden = false;
      frame.hidden = false;
      back.focus();
    });
    list.append(card);
  }
  showLibrary();
};

function protectedDocument(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  template.content
    .querySelectorAll("script, iframe, object, embed, base, meta[http-equiv]")
    .forEach((element) => element.remove());
  template.content.querySelectorAll("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href") || "";
    if (!href.startsWith("#")) {
      if (!/^https?:\/\//i.test(href)) anchor.removeAttribute("href");
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    }
  });
  return (
    '<!doctype html><html lang="ja"><head><meta charset="utf-8">' +
    '<meta name="referrer" content="no-referrer">' +
    '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src data:; base-uri &#39;none&#39;; form-action &#39;none&#39;">' +
    "</head><body>" +
    template.innerHTML +
    "</body></html>"
  );
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const current = ++operation;
  const entered = password.value;
  password.value = "";
  unlock.disabled = true;
  status.textContent = "資料を確認しています…";
  try {
    const response = await fetch(document.body.dataset.payloadUrl || "", {
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
    if (!response.ok)
      throw new Error("資料を読み込めません。時間をおいて再度お試しください。");
    const payload = await response.json();
    if (payload.state === "unconfigured")
      throw new Error("保護された資料はまだ設定されていません。");
    let html;
    try {
      html = await decryptDocument(payload, entered);
    } catch {
      throw new Error("パスワードが違うか、保護データが破損しています。");
    }
    if (current !== operation) return;
    renderLibrary(parseLibrary(html));
    gate.hidden = true;
    lock.hidden = false;
    status.textContent = "";
    lock.focus();
  } catch (error) {
    if (current !== operation) return;
    status.textContent =
      error instanceof Error ? error.message : "資料を開けませんでした。";
    password.focus();
  } finally {
    if (current === operation) unlock.disabled = false;
  }
});

lock.addEventListener("click", () => {
  relock();
  password.focus();
});
back.addEventListener("click", () => {
  showLibrary();
  list.querySelector("button")?.focus();
});
window.addEventListener("pagehide", relock);
window.addEventListener("pageshow", (event) => {
  if (event.persisted) relock();
});
