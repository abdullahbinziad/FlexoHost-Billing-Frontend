/**
 * Build a safe attachment URL for use in img src, links, etc.
 * Rejects javascript:, data:, protocol-relative (//), and cross-origin URLs.
 */
export function buildAttachmentUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  // Reject dangerous schemes
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return "";
  }

  // Reject protocol-relative URLs (//evil.com)
  if (trimmed.startsWith("//")) return "";

  // Allow relative paths
  if (trimmed.startsWith("/")) return trimmed;

  // For absolute http(s), only allow same-origin
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      if (typeof window === "undefined") return trimmed; // SSR: pass through, backend should validate
      const u = new URL(trimmed);
      if (u.origin === window.location.origin) return trimmed;
      return "";
    } catch {
      return "";
    }
  }

  // Treat as relative path
  return `/${trimmed}`;
}
