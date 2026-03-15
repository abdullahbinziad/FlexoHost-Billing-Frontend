# Frontend Security Audit Report

## HIGH SEVERITY

### 1. **Open Redirect via `redirect` Parameter**
**Location:** `src/contexts/AuthContext.tsx` – `getSmartRedirect()`

**Issue:** The redirect path is not validated for external URLs. If `?redirect=https://evil.com` is passed, after login the user is sent to the attacker’s site.

**Current logic:** Only blocks `/auth`, `/login`, `/register`. Paths like `https://evil.com` or `//evil.com` fall through and are used as-is.

**Fix:** Restrict redirects to same-origin, relative paths only:
```ts
if (!decodedPath.startsWith('/') || decodedPath.startsWith('//')) {
  return getRoleBasedDefault(userRole);
}
```

---

### 2. **Token in `localStorage` (Duplicate Storage)**
**Location:** `src/services/api/authService.ts` (lines 22–24, 40–42)

**Issue:** Tokens are stored in both cookies (via `tokenManager`) and `localStorage`. `localStorage` is readable by any script on the page, so any XSS can steal tokens.

**Fix:** Remove `localStorage` usage for tokens. Use only cookies (ideally HttpOnly, set by the backend).

---

### 3. **Auth Cookies Not HttpOnly**
**Location:** `src/utils/tokenManager.ts`

**Issue:** Tokens are stored in cookies via `document.cookie`. These cookies are not HttpOnly, so JavaScript can read them. Any XSS can steal the token.

**Fix:** Use HttpOnly cookies set by the backend. The backend should set them on login and the frontend should not read or write tokens directly.

---

### 4. **Attachment URL Not Validated**
**Location:** `src/app/(client)/tickets/[ticketId]/page.tsx`, `src/app/(admin)/admin/tickets/[ticketId]/page.tsx` – `buildAttachmentUrl(att.url)`

**Issue:** `buildAttachmentUrl` does not validate `att.url`. Values like `//evil.com` or `javascript:alert(1)` could be used for phishing or redirects.

**Fix:** Validate that the URL is same-origin or a trusted domain before using it:
```ts
function buildAttachmentUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) return '';
  if (trimmed.startsWith('//')) return ''; // protocol-relative
  if (trimmed.startsWith('http')) {
    try {
      const u = new URL(trimmed);
      if (u.origin !== window.location.origin) return ''; // or allow configured CDN
    } catch { return ''; }
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}
```

---

### 5. **Notification `linkPath` Not Validated**
**Location:** `src/components/shared/NotificationsDropdown.tsx` (line 86)

**Issue:** `n.linkPath` is used with `window.location.href` without validation. If the backend is compromised or returns malicious data, `linkPath` could be `javascript:...` or `https://evil.com`.

**Fix:** Validate that `linkPath` is a relative path starting with `/` and not `//`:
```ts
if (n.linkPath && n.linkPath.startsWith('/') && !n.linkPath.startsWith('//')) {
  window.location.href = n.linkPath;
}
```

---

## MEDIUM SEVERITY

### 6. **CSP Allows `unsafe-inline` and `unsafe-eval`**
**Location:** `src/lib/security.ts` (line 261)

**Issue:** `script-src` includes `'unsafe-inline'` and `'unsafe-eval'`, which weakens XSS protection.

**Fix:** Remove them and use nonces or hashes for required inline scripts.

---

### 7. **Acting-As State Revalidation**
**Location:** `src/components/client/ClientLayout.tsx`

**Status:** ✅ Already implemented. On load, `loadActingAs()` restores from localStorage, then `useGetClientProfileActingAsQuery` validates the grant. If the API returns an error (e.g. 403), storage is cleared and acting-as is reset.

---

### 8. **JWT Secret in Frontend Repo**
**Location:** `src/proxy.ts` (line 48), `.env`

**Issue:** `proxy.ts` uses `process.env.JWT_SECRET` – this is server-side only in Next.js, so it is not exposed to the client. The `.env` file should not be committed; ensure `.env` is in `.gitignore`. Default value `'dev-secret-key-change-in-production'` is a fallback risk if misconfigured.

**Fix:** Ensure `.env` is in `.gitignore`. In production, require `JWT_SECRET` and fail if it is missing or default.

---

## LOW SEVERITY

### 9. **`sanitizeInput` in `security.ts`**
**Location:** `src/lib/security.ts` (lines 154–158)

**Status:** Uses `textContent` to escape, then `innerHTML` – correct for escaping. Not used for `dangerouslySetInnerHTML`; ticket messages use `sanitizeHtml` (DOMPurify) instead.

---

### 10. **OAuth Tokens in URL Hash**
**Location:** `src/app/(auth)/login/page.tsx` (lines 44–54)

**Issue:** Tokens are passed in the URL hash (`#accessToken=...&refreshToken=...`). Hash is not sent to the server but can appear in browser history or referrer.

**Mitigation:** Hash is cleared with `replaceState` after use. Risk is limited to a short window.

---

## MITIGATIONS ALREADY IN PLACE

| Control | Status |
|--------|--------|
| Ticket message HTML sanitized | ✅ DOMPurify |
| Login rate limiting (client-side) | ✅ `loginRateLimiter` |
| Redirect validation (partial) | ✅ Blocks auth loops, admin/client routes |
| Token in cookies (not localStorage) | ✅ Primary storage via `tokenManager` |
| SameSite=Lax on cookies | ✅ Reduces CSRF |
| Secure in production | ✅ `tokenManager` |
| Password strength validation | ✅ `validatePasswordStrength` |

---

## Summary of Recommended Fixes

1. **Open redirect:** Validate `redirect` to be relative and same-origin.
2. **Token storage:** Remove `localStorage` usage for tokens; use HttpOnly cookies from backend.
3. **Attachment URLs:** Validate `att.url` before use.
4. **Notification links:** Validate `linkPath` before redirect.
5. **CSP:** Remove `unsafe-inline` and `unsafe-eval` where possible.
6. **Acting-as:** Revalidate grant after rehydration.
