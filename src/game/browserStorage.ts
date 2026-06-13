import type { KeyValueStorage } from "../domain/persistence/localPersistence";

export function getBrowserStorage(): KeyValueStorage | null {
  if (typeof globalThis.localStorage === "undefined") {
    return null;
  }

  return globalThis.localStorage;
}
