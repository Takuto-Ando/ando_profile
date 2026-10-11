import {
  encryptDocument,
  decryptDocument,
} from "../assets/js/private-crypto.js";
import { parseLibrary } from "../assets/js/private-library.js";

const form = document.getElementById("encrypt-form");
const source = document.getElementById("source");
const existing = document.getElementById("existing");
const password = document.getElementById("password");
const confirm = document.getElementById("confirm");
const button = document.getElementById("encrypt");
const status = document.getElementById("status");
const download = document.getElementById("download");

if (
  !(form instanceof HTMLFormElement) ||
  !(source instanceof HTMLInputElement) ||
  !(existing instanceof HTMLInputElement) ||
  !(password instanceof HTMLInputElement) ||
  !(confirm instanceof HTMLInputElement) ||
  !(button instanceof HTMLButtonElement) ||
  !(status instanceof HTMLElement) ||
  !(download instanceof HTMLAnchorElement)
) {
  throw new Error("暗号化ツールの構成が不正です。");
}

let downloadUrl = "";
const clearDownload = () => {
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = "";
  download.removeAttribute("href");
  download.hidden = true;
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearDownload();
  button.disabled = true;
  status.textContent = "暗号化しています…";
  const entered = password.value;
  const repeated = confirm.value;
  password.value = "";
  confirm.value = "";
  try {
    if (!["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)) {
      throw new Error("このツールはlocalhostでのみ使用できます。");
    }
    if (entered !== repeated)
      throw new Error("確認用パスワードが一致しません。");
    const entries = new Map();
    const previous = existing.files?.[0];
    if (previous) {
      if (previous.size > 7100000)
        throw new Error("既存データが大きすぎます。");
      try {
        const plaintext = await decryptDocument(
          JSON.parse(await previous.text()),
          entered,
        );
        for (const entry of parseLibrary(plaintext))
          entries.set(entry.id, entry);
      } catch {
        throw new Error(
          "既存データを開けません。同じパスワードと正しいJSONを選んでください。",
        );
      }
    }
    const files = Array.from(source.files || []);
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024)
        throw new Error("5MiB以下のHTMLを選んでください。");
      const html = await file.text();
      if (!/<html[\s>]/i.test(html))
        throw new Error("完全なHTMLファイルを選んでください。");
      const template = document.createElement("template");
      template.innerHTML = html;
      const title = (
        template.content.querySelector("title")?.textContent?.trim() ||
        file.name
      ).slice(0, 200);
      entries.set(file.name, { id: file.name, title, html });
    }
    const library = {
      type: "private-library",
      version: 1,
      documents: Array.from(entries.values()),
    };
    if (!entries.size)
      throw new Error(
        "HTMLを1つ以上、または既存の暗号化データを選んでください。",
      );
    const serialized = JSON.stringify(library);
    parseLibrary(serialized);
    const payload = await encryptDocument(serialized, entered);
    downloadUrl = URL.createObjectURL(
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );
    download.href = downloadUrl;
    download.hidden = false;
    source.value = "";
    existing.value = "";
    status.textContent = `${entries.size}件の資料を暗号化しました。content.jsonを保存してください。`;
  } catch (error) {
    status.textContent =
      error instanceof Error ? error.message : "暗号化できませんでした。";
  } finally {
    button.disabled = false;
  }
});

window.addEventListener("pagehide", () => {
  clearDownload();
  password.value = "";
  confirm.value = "";
  source.value = "";
  existing.value = "";
});
