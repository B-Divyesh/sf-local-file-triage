import type { PlanItem, TriageManifest } from './triage';

const DB_NAME = 'triagebox-local';
const STORE = 'surveys';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function put(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(value, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

async function get<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  const value = await new Promise<T | undefined>((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return value;
}

async function remove(key: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).delete(key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export interface SavedSurvey {
  rootName: string;
  savedAt: string;
  items: PlanItem[];
  manifest?: TriageManifest;
}

export type StorageNamespace = 'real' | 'demo';

// Demo records must never share the record used for a person's actual survey.
// Keeping the namespace in the key also makes this boundary inspectable in DevTools.
const surveyKey = (namespace: StorageNamespace) => namespace === 'demo' ? 'demo:latest' : 'latest';

export const saveSurvey = (survey: SavedSurvey, namespace: StorageNamespace = 'real') => put(surveyKey(namespace), survey);
export const loadSurvey = (namespace: StorageNamespace = 'real') => get<SavedSurvey>(surveyKey(namespace));
export const clearSurvey = (namespace: StorageNamespace) => remove(surveyKey(namespace));
