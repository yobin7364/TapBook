// src/redux/action/admin/appointmentAction.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Get Appointments by Status
export const getAppointmentsByStatus = createAsyncThunk(
  "admin/get/appointmentsByStatus",
  async (status, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/api/admin/appointments?status=${status}`
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors || "Failed to fetch appointments"
      );
    }
  }
);

// Update Appointment Status
export const updateAppointmentStatus = createAsyncThunk(
  "admin/put/updateAppointmentStatus",
  async ({ appointmentId, newStatus }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `/api/appointments/${appointmentId}/status`,
        newStatus
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors || "Failed to update appointment status"
      );
    }
  }
);
