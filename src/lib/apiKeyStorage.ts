export interface ApiKeys {
  openrouter?: string;
  tavily?: string;
}

const API_KEYS_STORAGE_KEY = 'nova-api-keys';

export function loadApiKeys(): ApiKeys {
  const saved = localStorage.getItem(API_KEYS_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return {};
    }
  }
  return {};
}

export function saveApiKeys(keys: ApiKeys) {
  localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
}

export function clearApiKeys() {
  localStorage.removeItem(API_KEYS_STORAGE_KEY);
}
