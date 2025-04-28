import { createSlice } from "@reduxjs/toolkit";
import { registerUser, loginUser, currentUserInfo } from "../action/authAction"; // Make sure to import your thunk

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    currentUserInfo: null,
  },
  reducers: {
    setCurrentUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!(
        action.payload && Object.keys(action.payload).length > 0
      );
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      state.isAuthenticated = false;
      localStorage.removeItem("authToken");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        //state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Capture the error message from rejectWithValue
      });
    // LOGIN
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || null;
        state.error = null;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Current User Info
    builder
      .addCase(currentUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(currentUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUserInfo = action.payload || null;
        state.error = null;
      })
      .addCase(currentUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentUser, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
