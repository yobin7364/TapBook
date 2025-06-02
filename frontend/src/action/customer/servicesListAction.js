import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Get list of services
export const getSerivesList = createAsyncThunk(
  "admin/get/services",
  async ({ page }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`api/services?page=${page}&limit=8`);

      return data; // Success response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors || "Failed to List Services"
      );
    }
  }
);

export const bookAppointment = createAsyncThunk(
  "customer/bookAppointment",
  async (appointmentData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/appointments", appointmentData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors || "Failed to book appointment"
      );
    }
  }
);
