/**
 * Global Type Definitions
 */

// User Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "client" | "admin";
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: "monthly" | "quarterly" | "semi-annually" | "annually";
  category: string;
  features: string[];
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  productId: string;
  status: "pending" | "active" | "suspended" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

// Invoice Types
export interface Invoice {
  id: string;
  orderId: string;
  amount: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  dueDate: string;
  paidDate?: string;
  createdAt: string;
}

// Service Types
export interface Service {
  id: string;
  orderId: string;
  productId: string;
  status: "active" | "suspended" | "cancelled";
  domain?: string;
  createdAt: string;
}

// Ticket Types
export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
}

// Domain Types
export interface Domain {
  id: string;
  userId: string;
  name: string;
  status: "active" | "expired" | "pending";
  expiryDate: string;
  registrationDate: string;
}
