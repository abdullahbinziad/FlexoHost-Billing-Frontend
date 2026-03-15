"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useGetMyClientProfileQuery } from "@/store/api/clientApi";
import { setActingAs, clearActingAs } from "@/store/slices/activeClientSlice";

/**
 * Returns the effective "active" client ID for the client area:
 * - When managing another account (grantee): the shared client's ID.
 * - Otherwise: the logged-in user's own client ID.
 * Use this everywhere we scope data by client (hosting, invoices, orders, tickets, etc.).
 */
export function useActiveClient() {
  const dispatch = useDispatch();
  const actingAsClientId = useSelector((s: RootState) => s.activeClient?.actingAsClientId ?? null);
  const ownerLabel = useSelector((s: RootState) => s.activeClient?.ownerLabel ?? null);
  const { data: myProfile, isLoading: isMyProfileLoading } = useGetMyClientProfileQuery(undefined, { skip: false });

  const activeClientId = actingAsClientId ?? myProfile?._id ?? null;
  const isActingAs = Boolean(actingAsClientId);
  /** True when we need own profile to resolve activeClientId and that query is still loading. */
  const isProfileLoading = !isActingAs && isMyProfileLoading;

  const setActingAsClient = useCallback(
    (clientId: string, label: string) => {
      dispatch(setActingAs({ clientId, ownerLabel: label }));
    },
    [dispatch]
  );

  const clearActingAsClient = useCallback(() => {
    dispatch(clearActingAs());
  }, [dispatch]);

  return {
    activeClientId,
    isActingAs,
    ownerLabel,
    isProfileLoading,
    setActingAs: setActingAsClient,
    clearActingAs: clearActingAsClient,
    /** Own profile when not acting as; undefined when acting as (use getClientProfileActingAs if needed). */
    myProfile: isActingAs ? undefined : myProfile,
  };
}
