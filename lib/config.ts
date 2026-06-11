// ─── Route pages ──────────────────────────────────────────
// Comma-separated lists of path prefixes. Used by both the
// server-side proxy.ts and client-side components.

export const AUTH_PAGES = (
  process.env.NEXT_PUBLIC_AUTH_PAGES ?? "/sign-in,/sign-up"
).split(",");

export const ADMIN_PAGES = (
  process.env.ADMIN_PAGES ?? "/dashboard"
).split(",");

export const USER_PAGES = (
  process.env.USER_PAGES ?? "/students"
).split(",");

export const PREMIUM_PAGES = (
  process.env.PREMIUM_PAGES ?? "/students/categorias"
).split(",");

// ─── Session / idle timeout ───────────────────────────────
// Used client-side by SessionGuard.

export const SESSION_TIMEOUT_MS = Number(
  process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MS ?? 3_600_000,
);

export const SESSION_CHECK_INTERVAL_MS = Number(
  process.env.NEXT_PUBLIC_SESSION_CHECK_INTERVAL_MS ?? 60_000,
);
