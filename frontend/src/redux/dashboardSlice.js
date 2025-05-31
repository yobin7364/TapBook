import { createSlice } from "@reduxjs/toolkit";
import { getDashboardData } from "../action/admin/dashboardAction";

const initialState = {
  dashboardData: {},
  loadingDashboardData: false,
  errorDashboardData: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Top Rated Book
    builder
      .addCase(getDashboardData.pending, (state) => {
        state.loadingDashboardData = true;
        state.errorDashboardData = null;
      })
      .addCase(getDashboardData.fulfilled, (state, action) => {
        state.loadingDashboardData = false;
        state.dashboardData = action.payload;
      })
      .addCase(getDashboardData.rejected, (state, action) => {
        state.loadingDashboardData = false;
        state.errorDashboardData = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
