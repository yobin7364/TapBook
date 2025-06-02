// src/redux/action/admin/reviewAction.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Get Reviews by Provider ID
export const getProviderReviews = createAsyncThunk(
  "admin/get/providerReviews",
  async (providerId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/reviews/user/${providerId}`);
      return data.reviews;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch provider reviews"
      );
    }
  }
);
