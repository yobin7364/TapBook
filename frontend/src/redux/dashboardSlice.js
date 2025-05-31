import { createSlice } from "@reduxjs/toolkit";
import {
  getDashboardData,
  getExportAppointments,
  cancelAppointmentsBatch,
} from "../action/admin/dashboardAction";

const initialState = {
  dashboardData: {},
  loadingDashboardData: false,
  errorDashboardData: null,

  exportedAppointments: {},
  loadingExportedAppointments: false,
  errorExportedAppointments: null,

  loadingBatchCancel: false,
  successBatchCancel: false,
  errorBatchCancel: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    resetBatchCancelState: (state) => {
      state.successBatchCancel = false;
      state.errorBatchCancel = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard
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
      })

      // Export Appointments
      .addCase(getExportAppointments.pending, (state) => {
        state.loadingExportedAppointments = true;
        state.errorExportedAppointments = null;
      })
      .addCase(getExportAppointments.fulfilled, (state, action) => {
        state.loadingExportedAppointments = false;
        state.exportedAppointments = action.payload;
      })
      .addCase(getExportAppointments.rejected, (state, action) => {
        state.loadingExportedAppointments = false;
        state.errorExportedAppointments = action.payload;
      })

      // Cancel Appointments Batch
      .addCase(cancelAppointmentsBatch.pending, (state) => {
        state.loadingBatchCancel = true;
        state.successBatchCancel = false;
        state.errorBatchCancel = null;
      })
      .addCase(cancelAppointmentsBatch.fulfilled, (state) => {
        state.loadingBatchCancel = false;
        state.successBatchCancel = true;
      })
      .addCase(cancelAppointmentsBatch.rejected, (state, action) => {
        state.loadingBatchCancel = false;
        state.successBatchCancel = false;
        state.errorBatchCancel = action.payload;
      });
  },
});

export const { resetBatchCancelState } = dashboardSlice.actions;
export default dashboardSlice.reducer;
