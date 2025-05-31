import { createSlice } from "@reduxjs/toolkit";
import {
  getAppointmentsByStatus,
  updateAppointmentStatus,
} from "../action/admin/manageAppointment";

const initialState = {
  // Get Appointments by Status
  appointmentsByStatus: [],
  loadingAppointmentsByStatus: false,
  errorAppointmentsByStatus: null,

  // Update Appointment Status
  updatedAppointment: null,
  loadingUpdateAppointment: false,
  errorUpdateAppointment: null,
};

const appointmentSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    // Get Appointments by Status
    builder
      .addCase(getAppointmentsByStatus.pending, (state) => {
        state.loadingAppointmentsByStatus = true;
        state.errorAppointmentsByStatus = null;
      })
      .addCase(getAppointmentsByStatus.fulfilled, (state, action) => {
        state.loadingAppointmentsByStatus = false;
        state.appointmentsByStatus = action.payload;
      })
      .addCase(getAppointmentsByStatus.rejected, (state, action) => {
        state.loadingAppointmentsByStatus = false;
        state.errorAppointmentsByStatus = action.payload;
      });

    // Update Appointment Status
    builder
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.loadingUpdateAppointment = true;
        state.errorUpdateAppointment = null;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.loadingUpdateAppointment = false;
        state.updatedAppointment = action.payload;
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.loadingUpdateAppointment = false;
        state.errorUpdateAppointment = action.payload;
      });
  },
});

export default appointmentSlice.reducer;
