"use client";

// We re-export the application-wide Context hook here so that components spread 
// across the app can pull from the unified root <AuthProvider> state without split configurations.
export { useAuth } from "@/contexts/AuthContext";
