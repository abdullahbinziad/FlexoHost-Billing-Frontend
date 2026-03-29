/**
 * Services barrel — use concrete modules from here when convenient.
 * Auth flows use `authentication.service` and `client.service` directly.
 */

export { authenticationService } from "./authentication.service";
export { clientService } from "./client.service";

export type {
  LoginCredentials,
  RegisterUserData,
  ClientRegistrationData,
  User,
  Client,
  AuthTokens,
} from "@/types/auth";
