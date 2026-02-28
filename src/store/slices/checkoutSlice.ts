import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  CheckoutFormData,
  BillingCycle,
  DomainAction,
  ServerLocation,
  Addon,
  BillingContact,
  PaymentMethod,
  DomainSearchResult,
  OrderSummary,
  NewAccountInfo,
} from "@/types/checkout";

interface CheckoutState {
  formData: Partial<CheckoutFormData>;
  orderSummary: OrderSummary | null;
  isLoading: boolean;
  error: string | null;
  step: number;
  productId: string | null;
  referral: string | null;
  newAccountInfo: NewAccountInfo | null;
}

const initialState: CheckoutState = {
  formData: {
    billingCycle: "triennially",
    domainAction: "register",
    selectedAddons: [],
    useDefaultRegistrant: true,
    agreeToTerms: false,
  },
  orderSummary: null,
  isLoading: false,
  error: null,
  step: 1,
  productId: null,
  referral: null,
  newAccountInfo: null,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    // Form Data Updates
    setBillingCycle: (state, action: PayloadAction<BillingCycle>) => {
      state.formData.billingCycle = action.payload;
    },
    setDomainAction: (state, action: PayloadAction<DomainAction>) => {
      state.formData.domainAction = action.payload;
    },
    setSelectedDomain: (
      state,
      action: PayloadAction<DomainSearchResult | undefined>
    ) => {
      state.formData.selectedDomain = action.payload;
    },
    setServerLocation: (state, action: PayloadAction<ServerLocation>) => {
      state.formData.serverLocation = action.payload;
    },
    toggleAddon: (state, action: PayloadAction<Addon>) => {
      const addons = state.formData.selectedAddons || [];
      const index = addons.findIndex((a) => a.id === action.payload.id);
      if (index >= 0) {
        state.formData.selectedAddons = addons.filter(
          (a) => a.id !== action.payload.id
        );
      } else {
        state.formData.selectedAddons = [...addons, action.payload];
      }
    },
    setBillingContact: (state, action: PayloadAction<BillingContact>) => {
      state.formData.billingContact = action.payload;
    },
    setUseDefaultRegistrant: (state, action: PayloadAction<boolean>) => {
      state.formData.useDefaultRegistrant = action.payload;
    },
    setRegistrantContact: (
      state,
      action: PayloadAction<BillingContact | undefined>
    ) => {
      state.formData.registrantContact = action.payload;
    },
    setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.formData.paymentMethod = action.payload;
    },
    setPromoCode: (state, action: PayloadAction<string | undefined>) => {
      state.formData.promoCode = action.payload;
    },
    setAgreeToTerms: (state, action: PayloadAction<boolean>) => {
      state.formData.agreeToTerms = action.payload;
    },
    setReferral: (state, action: PayloadAction<string | null>) => {
      state.referral = action.payload;
    },
    setProductId: (state, action: PayloadAction<string | null>) => {
      state.productId = action.payload;
    },
    setNewAccountInfo: (state, action: PayloadAction<NewAccountInfo | null>) => {
      state.newAccountInfo = action.payload;
    },
    // Update entire form data
    updateFormData: (
      state,
      action: PayloadAction<Partial<CheckoutFormData>>
    ) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    // Order Summary
    setOrderSummary: (state, action: PayloadAction<OrderSummary>) => {
      state.orderSummary = action.payload;
    },
    // Step Navigation
    setStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload;
    },
    nextStep: (state) => {
      state.step += 1;
    },
    previousStep: (state) => {
      if (state.step > 1) {
        state.step -= 1;
      }
    },
    // Loading & Error States
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // Reset Checkout
    resetCheckout: (state) => {
      state.formData = initialState.formData;
      state.orderSummary = null;
      state.error = null;
      state.step = 1;
    },
    // Clear Checkout (after successful order)
    clearCheckout: () => initialState,
  },
});

export const {
  setBillingCycle,
  setDomainAction,
  setSelectedDomain,
  setServerLocation,
  toggleAddon,
  setBillingContact,
  setUseDefaultRegistrant,
  setRegistrantContact,
  setPaymentMethod,
  setPromoCode,
  setAgreeToTerms,
  setReferral,
  setProductId,
  setNewAccountInfo,
  updateFormData,
  setOrderSummary,
  setStep,
  nextStep,
  previousStep,
  setLoading,
  setError,
  resetCheckout,
  clearCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
