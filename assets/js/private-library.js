export function parseLibrary(plaintext) {
  if (/^\s*(?:<!doctype\s+html|<html[\s>])/i.test(plaintext)) {
    return [
      { id: "legacy-document", title: "保存済みの資料", html: plaintext },
    ];
  }
  const library = JSON.parse(plaintext);
  if (
    library.type !== "private-library" ||
    library.version !== 1 ||
    !Array.isArray(library.documents) ||
    !library.documents.length ||
    library.documents.length > 100
  ) {
    throw new Error("資料一覧の形式が不正です。");
  }
  const ids = new Set();
  for (const entry of library.documents) {
    if (
      !entry ||
      typeof entry.id !== "string" ||
      !entry.id ||
      entry.id.length > 240 ||
      ids.has(entry.id) ||
      typeof entry.title !== "string" ||
      !entry.title.trim() ||
      entry.title.length > 200 ||
      typeof entry.html !== "string" ||
      !/<html[\s>]/i.test(entry.html)
    ) {
      throw new Error("資料一覧の形式が不正です。");
    }
    ids.add(entry.id);
  }
  return library.documents;
}
