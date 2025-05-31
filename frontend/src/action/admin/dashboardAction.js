import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

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
