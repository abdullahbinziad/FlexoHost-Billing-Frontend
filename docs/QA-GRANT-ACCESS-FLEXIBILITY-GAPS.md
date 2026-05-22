# Grant Access / Acting-As Feature — QA Flexibility & Quality Gaps

**Role:** Software Quality Assurance  
**Scope:** Grant access (create, edit, revoke) + “Acting as” another client (manage their account)  
**Date:** Review of current implementation

---

## 1. Extensibility & configuration

| Gap | Severity | Description |
|-----|----------|-------------|
| **Hardcoded access areas** | Medium | Backend and frontend both hardcode exactly three areas: `invoices`, `tickets`, `orders`. Adding a new area (e.g. “Documents”, “API keys”) requires code changes in model, service, `require-client-access`, `effective-client`, controllers, frontend types, form, sidebar filter, and nav config. No single config or enum shared by BE/FE. |
| **Hardcoded service types** | Medium | Service types (HOSTING, VPS, DOMAIN, EMAIL, LICENSE) are duplicated: backend enums, frontend `SERVICE_TYPES` in grant-access constants. Adding a new product type requires updating both and ensuring grant `serviceType` validation stays in sync. |
| **Nav filter tied to exact hrefs** | Medium | `filterClientNavByAccessAreas()` uses `item.href === "/tickets"`, `"/billing"`, `"/invoices"`, `"/billing/history"`. Any route rename or new area (e.g. new “Billing” sub-item) must be updated here; no mapping like `area → hrefs[]` or nav-item metadata for “which area this belongs to”. |

**Recommendation:** Introduce a single source of truth for “areas” and “service types” (e.g. shared constants or API-driven config) and derive nav visibility and backend checks from that.

---

## 2. Validation gaps

| Gap | Severity | Description |
|-----|----------|-------------|
| **No request validation on PATCH grant** | Medium | `PATCH /clients/:clientId/access-grants/:grantId` has no body validation (unlike create with validation). Invalid `scope`/`serviceType`/`permissions`/`expiresAt` can reach the service and produce generic errors or inconsistent state. |
| **No grantId/clientId path validation** | Low | Route params `grantId` and `clientId` are not validated as Mongo IDs (or allowed formats). Malformed IDs could cause 500 or unclear errors. |
| **Edit form doesn’t enforce scope rules** | Low | Grant edit form allows submitting “By service type” without selecting a type, or “Specific services” with no services selected; backend then throws. Frontend could disable submit or show inline validation when scope is incomplete. |

**Recommendation:** Add validation middleware (e.g. Joi/express-validator) for PATCH body and path params; mirror scope rules in the edit form with inline validation and disabled submit.

---

## 3. Stale or invalid “acting as” state

| Gap | Severity | Description |
|-----|----------|-------------|
| **Rehydrate never re-validates grant** | High | On reload, acting-as is restored from `localStorage` and Redux is rehydrated. There is no check that the user still has an active, non-expired grant for that `clientId`. If the grant was revoked or expired, the user can still send `X-Acting-As` until an API returns 403; until then, UI shows “managing X’s account” and may show stale or forbidden data. |
| **No expiry check on load** | High | Persisted `clientId`/`ownerLabel` don’t include `expiresAt`. After expiry, the user keeps acting-as until they hit a 403 or switch back. |
| **Single storage key** | Low | Only one “acting as” context is stored (`flexohost_acting_as`). If you later support multiple tabs or “recent clients”, the key structure would need to change. |

**Recommendation:** After rehydration, call an endpoint that validates the grant (e.g. `GET /clients/acting-as/:clientId` or a lightweight “can I act as this client?”). If 403, clear `localStorage` and Redux and optionally show a toast. Optionally persist `expiresAt` and clear state when expired before any request.

---

## 4. Inconsistent client-area pages (acting as)

| Gap | Severity | Description |
|-----|----------|-------------|
| **VPS / Domains / Emails / All Services not using active client** | High | Only Hosting (and dashboard) use `useActiveClient()` and `activeClientId` for API calls. VPS page uses mock data; Domains/Emails/All Services may use “my” client or mock data. When acting as another client, those tabs still show the wrong (or no) data and don’t respect grant scope. |
| **Billing History (transactions) not effective-client scoped** | High | Transactions controller uses “my” client (`Client.findOne({ user })`) for non-admin, not `getEffectiveClientId(req, res, 'orders')`. So “Billing History” when acting as shows the grantee’s own transactions, not the shared client’s. Inconsistent with “Orders” and “Invoices” and with the “orders” access area. |
| **Sidebar doesn’t hide by service scope** | Medium | When grant is “Hosting only” or “Specific services”, the sidebar still shows Hosting, VPS, Domains, Emails, All Services. Only “access areas” (invoices/tickets/orders) are used to hide Billing/Tickets. So a grantee can open /vps or /domains and get 403 or empty data instead of not seeing those links. |

**Recommendation:** Use `activeClientId` (and grant scope) on all client-area list/detail pages (VPS, Domains, Emails, All Services). Scope transactions API by effective client when not admin, and pass area `orders` (or a dedicated “transactions” area if you split it). Optionally extend access model so sidebar can hide service sections by grant scope (e.g. from `accessAreas` or a new “allowedServiceTypes” in the acting-as response).

---

## 5. Security & direct URL access

| Gap | Severity | Description |
|-----|----------|-------------|
| **Direct URL when area not allowed** | Medium | Sidebar hides e.g. Invoices when `accessAreas.invoices` is false, but the user can still open `/invoices` directly. Backend correctly returns 403; frontend could redirect or show a single “You don’t have access to this section” page instead of the normal layout + error. |
| **Grant Access / Account when acting as** | Low | When acting as, “Access” (grant-access) and “Account” are still visible. Grant-access is for the owner; Account might expose profile/settings. Consider hiding or restricting “Access” when acting as, and showing a read-only or limited “Account” for the shared client. |

**Recommendation:** Add a small guard on client-area routes: if acting as and the route’s “area” is not in `accessAreas`, redirect to `/` or to a “no access” page. Optionally hide or repurpose “Access” and “Account” when `isActingAs` is true.

---

## 6. Edit grant UX & data

| Gap | Severity | Description |
|-----|----------|-------------|
| **serviceIds shape from API** | Low | Edit form assumes `grant.serviceIds` is either string[] or objects with `_id`. If API returns raw ObjectIds or another shape, the mapping could be wrong and prefill could show no selection. |
| **No loading state for acting-as profile** | Low | Sidebar uses `actingAsData?.accessAreas` to filter. While the acting-as profile is loading, `accessAreas` is undefined and all nav items are shown; after load, some disappear. Minor flicker. |
| **Success message for edit** | Low | On successful grant update, “Access updated.” is set but the dialog closes immediately; if the success message is only in the list area, it may be easy to miss. Consider a toast or keeping a short-lived success state in the list. |

**Recommendation:** Normalize `serviceIds` in one place (e.g. API transform or a small util) for the edit form. Optionally show a skeleton or keep previous `accessAreas` until new one loads. Add a toast on successful grant update.

---

## 7. Backend update logic

| Gap | Severity | Description |
|-----|----------|-------------|
| **Partial update when scope not sent** | Low | Update service applies `scope`/`serviceType`/`serviceIds` only when `updates.scope !== undefined`. The current edit form always sends full body, so this is fine. If you later add a “patch only these fields” API, ensure scope-specific validations (e.g. service_type requires serviceType) still run when scope is not sent. |
| **Multiple grants same user/client** | Low | Merging of multiple grants (e.g. area flags) is done in `checkAccess`. Behaviour is documented but not obvious; any UI that shows “your access” might need to explain merged permissions. |

**Recommendation:** Document merge behaviour for multiple grants; if you add partial PATCH, validate required fields per current grant scope when those fields are present.

---

## 8. Summary table

| Category              | High | Medium | Low |
|------------------------|------|--------|-----|
| Extensibility          | 0    | 3      | 0   |
| Validation             | 0    | 1      | 2   |
| Stale acting-as state  | 2    | 0      | 1   |
| Inconsistent pages     | 2    | 1      | 0   |
| Security / UX           | 0    | 2      | 1   |
| Edit UX / data          | 0    | 0      | 3   |
| Backend update          | 0    | 0      | 2   |

**Suggested priorities:**  
1) Re-validate grant on rehydrate and clear state if no longer allowed.  
2) Scope transactions (Billing History) by effective client and align with “orders” area.  
3) Wire VPS/Domains/Emails/All Services to `activeClientId` and grant scope.  
4) Add PATCH body and path validation for grant update.  
5) Optionally: config-driven areas/service types, nav filter by area metadata, and route guard when acting as without access.
