import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosInstance";

// Get Dashboard Data
export const getDashboardData = createAsyncThunk(
  "admin/get/dashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/admin/dashboard/stats");

      return data; // Success response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors || "Failed to load Dashboard Data"
      );
    }
  }
);

export const getExportAppointments = createAsyncThunk(
  "admin/appointments/export",
  async ({ from, to, status }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/api/admin/appointments/export?from=${from}&to=${to}&status=${status}`
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors || "Failed to export appointments"
      );
    }
  }
);

// cancel appointment batch
export const cancelAppointmentsBatch = createAsyncThunk(
  "admin/appointments/cancel/batch",
  async ({ givenDate }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        "/api/admin/appointments/batch-cancel-by-date",
        givenDate
      );
      return data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(
        error.response?.data?.errors || "Failed to cancel appointments"
      );
    }
  }
);

// Change Password
export const changeUserPassword = createAsyncThunk(
  "users/update/changePassword",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/users/change-password", userData);

      return data; // Success response
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(
        error.response?.data?.error?.details || "Failed to change "
      );
    }
  }
);
