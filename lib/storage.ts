// localStorage can throw in private windows or with blocked site data.
// Preferences are conveniences, so a failed read or write is safe to ignore.

export function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Keeps working for this visit; the preference just is not remembered.
  }
}
