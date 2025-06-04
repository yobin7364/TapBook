// src/redux/action/admin/membershipAction.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosInstance";

// Subscribe to Membership
export const subscribeMembership = createAsyncThunk(
  "membership/subscribe",
  async (subscriptionData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        "/api/membership/subscribe",
        subscriptionData
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors || "Failed to subscribe to membership"
      );
    }
  }
);

// Get Current Membership Details
export const getMembership = createAsyncThunk(
  "membership/get",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/membership");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors || "Failed to fetch membership"
      );
    }
  }
);

// Cancel Membership
export const cancelMembership = createAsyncThunk(
  "membership/cancel",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/membership/cancel");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors || "Failed to cancel membership"
      );
    }
  }
);
