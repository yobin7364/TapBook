// src/redux/action/admin/reviewAction.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosInstance";

// Get Reviews by Provider ID
export const getProviderReviews = createAsyncThunk(
  "admin/get/providerReviews",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/reviews/mine`);
      return data.reviews;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch provider reviews"
      );
    }
  }
);
