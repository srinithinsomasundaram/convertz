import { type ConversionHistoryItem } from "./conversionHistory";

const DB_NAME = "convertz_local_db";
const STORE_NAME = "conversions";
const DB_VERSION = 1;

export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalConversion(item: ConversionHistoryItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getLocalConversions(): Promise<ConversionHistoryItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result as ConversionHistoryItem[];
      // Filter out expired conversions locally too
      const now = Date.now();
      const valid = results.filter((item) => {
        if (!item.expiresAt) return true;
        return item.expiresAt > now;
      });
      // Sort by createdAt descending
      valid.sort((a, b) => b.createdAt - a.createdAt);
      resolve(valid);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteLocalConversion(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearLocalHistory(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function cleanupExpiredLocalConversions(): Promise<void> {
  const db = await openDB();
  const conversions = await getLocalConversions();
  const now = Date.now();
  
  const expiredIds = conversions
    .filter(item => item.expiresAt && item.expiresAt <= now)
    .map(item => item.id);

  if (expiredIds.length === 0) return;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    expiredIds.forEach(id => store.delete(id));
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
