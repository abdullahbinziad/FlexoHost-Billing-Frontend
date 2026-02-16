/**
 * Domain Portfolio Type Definitions
 */

export interface Domain {
  id: string;
  userId?: string;
  name: string;
  status: "active" | "expired" | "pending" | "suspended";
  expirationDate: string;
  autoRenewal: boolean;
  registrationDate: string;
  registrar?: string;
}

export interface DomainProtectionOffer {
  domain: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  currency: string;
  period: string;
}

export interface DomainTableFilters {
  search: string;
  status?: Domain["status"];
  sortBy?: "name" | "status" | "expirationDate" | "autoRenewal";
  sortOrder?: "asc" | "desc";
}

export interface BulkAction {
  type: "renew" | "enableAutoRenewal" | "disableAutoRenewal" | "delete";
  domainIds: string[];
}
