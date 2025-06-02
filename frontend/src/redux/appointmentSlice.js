import { createSlice } from "@reduxjs/toolkit";
import {
  getUpcomingAppointments,
  getPastAppointments,
  cancelAppointment,
  updateAppointment,
} from "../action/customer/appointmentAction";

const initialState = {
  upcoming: [],
  past: [],
  loadingUpcoming: false,
  loadingPast: false,
  errorUpcoming: null,
  errorPast: null,

  canceling: false,
  cancelSuccess: false,
  errorCancel: null,

  updating: false,
  updateSuccess: false,
  errorUpdate: null,
};

const appointmentSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    resetAppointmentStatus: (state) => {
      state.cancelSuccess = false;
      state.updateSuccess = false;
      state.errorCancel = null;
      state.errorUpdate = null;
    },
  },
  extraReducers: (builder) => {
    // Upcoming Appointments
    builder
      .addCase(getUpcomingAppointments.pending, (state) => {
        state.loadingUpcoming = true;
        state.errorUpcoming = null;
      })
      .addCase(getUpcomingAppointments.fulfilled, (state, action) => {
        state.loadingUpcoming = false;
        state.upcoming = action.payload.upcoming;
      })
      .addCase(getUpcomingAppointments.rejected, (state, action) => {
        state.loadingUpcoming = false;
        state.errorUpcoming = action.payload;
      });

    // Past Appointments
    builder
      .addCase(getPastAppointments.pending, (state) => {
        state.loadingPast = true;
        state.errorPast = null;
      })
      .addCase(getPastAppointments.fulfilled, (state, action) => {
        state.loadingPast = false;
        state.past = action.payload.past;
      })
      .addCase(getPastAppointments.rejected, (state, action) => {
        state.loadingPast = false;
        state.errorPast = action.payload;
      });

    // Cancel Appointment
    builder
      .addCase(cancelAppointment.pending, (state) => {
        state.canceling = true;
        state.cancelSuccess = false;
        state.errorCancel = null;
      })
      .addCase(cancelAppointment.fulfilled, (state) => {
        state.canceling = false;
        state.cancelSuccess = true;
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.canceling = false;
        state.errorCancel = action.payload;
      });

    // Update Appointment
    builder
      .addCase(updateAppointment.pending, (state) => {
        state.updating = true;
        state.updateSuccess = false;
        state.errorUpdate = null;
      })
      .addCase(updateAppointment.fulfilled, (state) => {
        state.updating = false;
        state.updateSuccess = true;
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.updating = false;
        state.errorUpdate = action.payload;
      });
  },
});

export const { resetAppointmentStatus } = appointmentSlice.actions;

export default appointmentSlice.reducer;
