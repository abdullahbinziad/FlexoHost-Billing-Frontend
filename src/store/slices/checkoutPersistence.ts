import type { CheckoutState } from "./checkoutSlice";
import { initialCheckoutState } from "./checkoutSlice";

const STORAGE_KEY = "flexohost_checkout_state_v1";

type PersistedCheckoutState = Pick<
  CheckoutState,
  "mode" | "formData" | "productId" | "productType" | "referral" | "newAccountInfo" | "step"
>;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sanitizePersistedCheckoutState(raw: unknown): PersistedCheckoutState | null {
  if (!isObject(raw)) return null;

  const mode = raw.mode === "domain" ? "domain" : "service";
  const formData = isObject(raw.formData) ? raw.formData : {};
  const productId = typeof raw.productId === "string" ? raw.productId : null;
  const productType =
    typeof raw.productType === "string" ? raw.productType : null;
  const referral = typeof raw.referral === "string" ? raw.referral : null;
  const step = typeof raw.step === "number" && Number.isFinite(raw.step) ? Math.max(1, raw.step) : 1;
  const newAccountInfo = isObject(raw.newAccountInfo) ? raw.newAccountInfo : null;

  return {
    mode,
    formData: {
      ...initialCheckoutState.formData,
      ...formData,
      billingContact: undefined,
    },
    productId,
    productType,
    referral,
    newAccountInfo: newAccountInfo as CheckoutState["newAccountInfo"],
    step,
  };
}

export function loadCheckoutState(): CheckoutState | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    const sanitized = sanitizePersistedCheckoutState(parsed);
    if (!sanitized) return undefined;
    const merged: CheckoutState = {
      ...initialCheckoutState,
      ...sanitized,
      orderSummary: null,
      isLoading: false,
      error: null,
    };
    return merged;
  } catch {
    return undefined;
  }
}

export function saveCheckoutState(checkout: CheckoutState): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PersistedCheckoutState = {
      mode: checkout.mode,
      formData: checkout.formData,
      productId: checkout.productId,
      productType: checkout.productType,
      referral: checkout.referral,
      newAccountInfo: checkout.newAccountInfo,
      step: checkout.step,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore persistence errors
  }
}

export function clearCheckoutStateStorage(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
