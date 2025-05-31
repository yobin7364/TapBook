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
        error.response?.data?.errors || "Failed to add service"
      );
    }
  }
);

// Get a single service by ID
export const getServiceById = createAsyncThunk(
  "service/getById",
  async (serviceId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/services/${serviceId}`);
      return data; // assuming API returns a service object
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors || "Failed to load service"
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
      return data; // assuming API returns the updated service
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors || "Failed to update service"
      );
    }
  }
);
