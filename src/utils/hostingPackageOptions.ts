import type { Product } from "@/types/admin";

/** Fixes common typos in catalog names for display (does not change stored data). */
export function formatProductDisplayName(name: string): string {
  return name.replace(/\bSatdard\b/gi, "Standard");
}

/**
 * Drops duplicate API rows (same id) and duplicate labels (same trimmed name, case-insensitive).
 * When two products share the same display name, keeps the one matching preferredProductId if either matches; otherwise keeps the first.
 */
export function dedupeHostingProductsForSelect(products: Product[], preferredProductId?: string): Product[] {
  const byId = new Map<string, Product>();
  for (const p of products) {
    const id = String(p.id ?? "").trim();
    if (!id || byId.has(id)) continue;
    byId.set(id, p);
  }
  const list = [...byId.values()];

  const nameToBest = new Map<string, Product>();
  const noName: Product[] = [];

  for (const p of list) {
    const nameKey = String(p.name ?? "").trim().toLowerCase();
    if (!nameKey) {
      noName.push(p);
      continue;
    }
    const existing = nameToBest.get(nameKey);
    if (!existing) {
      nameToBest.set(nameKey, p);
      continue;
    }
    const pIsPreferred = preferredProductId && String(p.id) === preferredProductId;
    const pick = pIsPreferred ? p : existing;
    nameToBest.set(nameKey, pick);
  }

  return [...noName, ...nameToBest.values()];
}
