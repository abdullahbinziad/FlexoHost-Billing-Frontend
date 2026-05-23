import { getServerGroups } from "@/types/admin";
import type { ServerConfig } from "@/types/admin";

/** Same rules as backend order `parseServerGroups`. */
export function parseServerGroupsFromOrder(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v || "").trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw.split(",").map((v) => v.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Servers eligible for manual "Run module create" / same logic as auto-provision:
 * cPanel + enabled + product server group(s) + order server location + capacity.
 */
export function getEligibleServersForHostingOrderItem(
  servers: ServerConfig[] | undefined,
  rawOrderItem: { type?: string; configSnapshot?: Record<string, unknown> } | null | undefined
): ServerConfig[] {
  if (!rawOrderItem || String(rawOrderItem.type || "").toUpperCase() !== "HOSTING") {
    return [];
  }
  const cfg = (rawOrderItem.configSnapshot || {}) as {
    serverLocation?: string;
    serverGroup?: string;
    serverGroups?: string[] | string;
  };
  const location = cfg.serverLocation ? String(cfg.serverLocation).trim() : "";
  const configuredGroups = parseServerGroupsFromOrder(cfg.serverGroups ?? cfg.serverGroup);

  const cpanel = (servers || []).filter(
    (s) => String(s?.module?.type || "").toLowerCase() === "cpanel" && s.isEnabled !== false
  );

  let list = cpanel;
  if (configuredGroups.length > 0) {
    list = list.filter((s) => {
      const sg = getServerGroups(s);
      return sg.length === 0 || configuredGroups.some((g) => (sg as readonly string[]).includes(g));
    });
  }
  if (location) {
    list = list.filter((s) => String(s.location || "") === location);
  }
  list = list.filter((s) => {
    const current = typeof s.accountCount === "number" ? s.accountCount : 0;
    const max = typeof s.maxAccounts === "number" ? s.maxAccounts : 200;
    return current < max;
  });
  list.sort((a, b) => {
    const ca = typeof a.accountCount === "number" ? a.accountCount : 0;
    const cb = typeof b.accountCount === "number" ? b.accountCount : 0;
    return ca - cb;
  });
  return list;
}
