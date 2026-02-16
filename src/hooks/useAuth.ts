"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store";
import { authService } from "@/services/api/authService";

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const login = async (email: string, password: string) => {
    return await authService.login(email, password);
  };

  const logout = async () => {
    return await authService.logout();
  };

  return {
    ...auth,
    login,
    logout,
  };
};
