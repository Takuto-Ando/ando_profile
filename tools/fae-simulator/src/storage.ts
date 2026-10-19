import type { Dataset, LearningState } from "./model";

const emptyState = (): LearningState => ({
  schemaVersion: 1,
  attempts: [],
  favorites: [],
});
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("fae-design-win", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("state");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error("別タブを閉じて再読込してください"));
  });
}
async function read<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("state", "readonly");
    const request = transaction.objectStore("state").get(key);
    transaction.oncomplete = () => {
      db.close();
      resolve(request.result as T | undefined);
    };
    transaction.onerror = transaction.onabort = () => {
      db.close();
      reject(transaction.error ?? new Error("読込に失敗しました"));
    };
  });
}
async function write(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("state", "readwrite");
    transaction.objectStore("state").put(value, key);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = transaction.onabort = () => {
      db.close();
      reject(transaction.error ?? new Error("保存に失敗しました"));
    };
  });
}
export const loadLearning = async () =>
  (await read<LearningState>("learning")) ?? emptyState();
export const saveLearning = (state: LearningState) => write("learning", state);
export const loadDataset = () => read<Dataset>("dataset");
export const saveDataset = (dataset: Dataset) => write("dataset", dataset);
