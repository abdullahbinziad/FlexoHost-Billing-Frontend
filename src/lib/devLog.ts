/**
 * Development-only logging. Suppresses console output in production.
 * Use for debugging; in production, use error tracking (e.g. Sentry) instead.
 * Safely handles Error objects and avoids throwing.
 */
export function devLog(...args: unknown[]): void {
  if (process.env.NODE_ENV !== "production") {
    try {
      const safe = args.map((a) => {
        if (a instanceof Error) return { name: a.name, message: a.message, stack: a.stack };
        return a;
      });
      // Use console.log instead of console.error to avoid noisy red error output in dev tools.
      // This is strictly a development helper and is fully suppressed in production.
      // eslint-disable-next-line no-console
      console.log(...safe);
    } catch {
      // Never let devLog break the app
    }
  }
}
