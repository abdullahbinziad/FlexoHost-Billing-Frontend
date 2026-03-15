/**
 * Auth Service Layer
 * Handles authentication operations
 */

import { authApi } from "@/store/api/authApi";
import { devLog } from "@/lib/devLog";
import { store } from "@/store";
import { setCredentials, clearCredentials } from "@/store/slices/authSlice";

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const result = await store.dispatch(
        authApi.endpoints.login.initiate({ email, password })
      ).unwrap();
      
      // Store credentials in Redux
      store.dispatch(
        setCredentials({ token: result.token, user: result.user })
      );

      return result;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await store.dispatch(authApi.endpoints.logout.initiate()).unwrap();
    } catch (error) {
      // Continue with logout even if API call fails
      devLog("Logout API error:", error);
    } finally {
      store.dispatch(clearCredentials());
    }
  },
};
