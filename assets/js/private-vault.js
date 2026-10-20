import { decryptDocument } from "./private-crypto.js";
import { parseLibrary } from "./private-library.js";
import { prepareDocument } from "./private-document.js";
import { groupMaterials } from "./private-categories.js";

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
let documents = [];
let channel = "";

const relock = () => {
  operation += 1;
  frame.removeAttribute("srcdoc");
  frame.hidden = true;
  frame.style.height = "1px";
  document.body.classList.remove("document-open");
  documents = [];
  channel = "";
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
  frame.style.height = "1px";
  document.body.classList.remove("document-open");
  channel = "";
  frame.title = "保護された資料";
  documentBar.hidden = true;
  documentTitle.textContent = "";
  library.hidden = false;
};

const openDocument = (entry) => {
  channel = Array.from(crypto.getRandomValues(new Uint8Array(24)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  frame.style.height = "1px";
  frame.srcdoc = prepareDocument(entry, documents, channel);
  frame.title = entry.title;
  documentTitle.textContent = entry.title;
  library.hidden = true;
  documentBar.hidden = false;
  document.body.classList.add("document-open");
  frame.hidden = false;
  back.focus();
  window.scrollTo(0, 0);
};

const renderLibrary = (entries) => {
  documents = entries;
  list.replaceChildren();
  const groups = groupMaterials(entries);
  const visibleCount = groups.reduce(
    (total, group) => total + group.entries.length,
    0,
  );
  count.textContent = `参考資料${visibleCount}件。クイズは上のSimulatorから始められます。`;
  for (const group of groups) {
    const section = document.createElement("section");
    section.className = "material-category";
    const heading = document.createElement("h2");
    heading.textContent = group.title;
    const description = document.createElement("p");
    description.className = "note";
    description.textContent = group.description;
    const grid = document.createElement("div");
    grid.className = "library-grid";
    section.append(heading, description, grid);
    list.append(section);
    if (!group.entries.length) description.textContent += "（該当資料なし）";
    for (const entry of group.entries) {
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
        openDocument(entry);
      });
      grid.append(card);
    }
  }
  showLibrary();
};

window.addEventListener("message", (event) => {
  if (
    !channel ||
    event.source !== frame.contentWindow ||
    event.data?.channel !== channel
  )
    return;
  const detail = event.data;
  if (
    detail.type === "height" &&
    Number.isFinite(detail.height) &&
    detail.height > 0 &&
    detail.height <= 2000000
  ) {
    frame.style.height = `${Math.ceil(detail.height)}px`;
  } else if (detail.type === "open" && typeof detail.id === "string") {
    const entry = documents.find((document) => document.id === detail.id);
    if (entry) openDocument(entry);
  } else if (
    detail.type === "scroll" &&
    Number.isFinite(detail.top) &&
    detail.top >= 0 &&
    detail.top <= frame.offsetHeight
  ) {
    window.scrollTo(
      0,
      frame.getBoundingClientRect().top + scrollY + detail.top,
    );
  }
});

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
unlock.disabled = false;
