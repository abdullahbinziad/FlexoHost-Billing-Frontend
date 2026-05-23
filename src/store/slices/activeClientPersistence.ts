const STORAGE_KEY = "flexohost_acting_as";

export interface PersistedActingAs {
  clientId: string;
  ownerLabel: string;
}

export function loadActingAs(): PersistedActingAs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PersistedActingAs;
    if (data?.clientId && typeof data?.ownerLabel === "string") return data;
  } catch {
    // ignore
  }
  return null;
}

export function saveActingAs(payload: PersistedActingAs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function clearActingAsStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
