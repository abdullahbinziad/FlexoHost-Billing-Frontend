import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ActiveClientState {
  /** When set, user is "managing" this client's account (grantee). All client-scoped APIs use this ID and send X-Acting-As. */
  actingAsClientId: string | null;
  /** Owner email/name for banner: "You are managing X's account". */
  ownerLabel: string | null;
}

const initialState: ActiveClientState = {
  actingAsClientId: null,
  ownerLabel: null,
};

const activeClientSlice = createSlice({
  name: "activeClient",
  initialState,
  reducers: {
    setActingAs: (state, action: PayloadAction<{ clientId: string; ownerLabel: string }>) => {
      state.actingAsClientId = action.payload.clientId;
      state.ownerLabel = action.payload.ownerLabel;
    },
    clearActingAs: (state) => {
      state.actingAsClientId = null;
      state.ownerLabel = null;
    },
  },
});

export const { setActingAs, clearActingAs } = activeClientSlice.actions;
export default activeClientSlice.reducer;
