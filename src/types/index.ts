/**
 * Types - Public API
 * @see README.md for structure
 *
 * Prefer importing from domain files for tree-shaking:
 *   import type { Invoice } from '@/types/invoice'
 *   import type { User } from '@/types/auth'
 *
 * Or use barrel:
 *   import type { Invoice, User } from '@/types'
 */

// API
export type { ApiResponse, PaginatedResponse, ApiError } from './api';

// Auth
export type {
  User,
  Client,
  AuthTokens,
  LoginCredentials,
  LoginResponse,
  RegisterUserData,
  ClientRegistrationData,
  ClientRegistrationResponse,
  ChangePasswordData,
  ForgotPasswordData,
  ResetPasswordData,
  VerifyTokenResponse,
  AuthState,
  AuthActions,
  AuthContextType,
} from './auth';

// Checkout
export type {
  BillingCycle,
  BillingCycleOption,
  DomainAction,
  DomainSearchResult,
  ServerLocation,
  Addon,
  Address,
  BillingContact,
  PaymentMethod,
  OrderItem,
  CheckoutFormData,
  OrderSummary,
  NewAccountInfo,
  CreateOrderPayload,
} from './checkout';

// Currency
export type { Currency } from './currency';
export { SUPPORTED_CURRENCY_CODES, DEFAULT_CURRENCIES } from './currency';

// Domain
export type {
  Domain,
  DomainProtectionOffer,
  DomainTableFilters,
  BulkAction,
} from './domain';

// Domain manage (detail view)
export type {
  DomainDetails,
  ContactInfo,
  DNSRecord,
  EmailForward,
  TabItem,
} from './domain-manage';

// Hosting
export type { HostingService, ServicesRenewingSoon } from './hosting';

// Hosting manage (detail view)
export type {
  HostingServiceDetails,
  QuickShortcut,
  SidebarSection,
  SidebarItem,
} from './hosting-manage';

// Invoice
export type {
  InvoiceStatus,
  InvoiceItem,
  InvoiceTransaction,
  Invoice,
} from './invoice';

// Navigation
export type { NavItem, SubMenuItem } from './navigation';

// VPS manage
export type { VPSServiceDetails } from './vps-manage';

// Admin
export * from './admin';
