// src/redux/action/admin/serviceAction.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Add New Service
export const addService = createAsyncThunk(
  "admin/post/service",
  async (serviceData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/admin/services", serviceData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to add service"
      );
    }
  }
);

// Get a single service
export const getServiceById = createAsyncThunk(
  "service/single",
  async ({ serviceId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/services/${serviceId}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to load service"
      );
    }
  }
);

// Update a service by ID
export const updateServiceById = createAsyncThunk(
  "service/updateById",
  async ({ serviceId, updatedData }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `/api/admin/services/${serviceId}`,
        updatedData
      );
      return data; //
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update service"
      );
    }
  }
);

// get Available Slots By Date
export const getAvailableSlotsByDate = createAsyncThunk(
  "service/availableSlots",
  async ({ serviceId, date }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/api/services/${serviceId}/available-slots?date=${date}`
      );
      return data; //
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to load available slots"
      );
    }
  }
);

// get my service
export const getMyService = createAsyncThunk(
  "service/admin/details",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/services/me`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to my service "
      );
    }
  }
);
