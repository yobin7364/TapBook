import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// get upcomming Appointments
export const getUpcomingAppointments = createAsyncThunk(
  "appointments/upcoming",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/appointments/upcoming");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch upcoming appointments"
      );
    }
  }
);

// get past Appointments
export const getPastAppointments = createAsyncThunk(
  "appointments/past",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/appointments/past");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch past appointments"
      );
    }
  }
);

// PUT: Update Appointment
export const updateAppointment = createAsyncThunk(
  "appointments/update",
  async ({ appointmentId, updatedData }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `/api/appointments/${appointmentId}`,
        updatedData
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update appointment"
      );
    }
  }
);

// PUT: Cancel Appointment
export const cancelAppointment = createAsyncThunk(
  "appointments/cancel",
  async ({ appointmentId, cancelNote }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `/api/appointments/${appointmentId}/cancel`,
        { cancelNote }
      );
      return data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(
        error.response?.data?.error || "Failed to cancel appointment"
      );
    }
  }
);

// get user notification
export const getUserNotification = createAsyncThunk(
  "notification/user",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/api/notifications?page=${page}&limit=${limit}`
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch past appointments"
      );
    }
  }
);
