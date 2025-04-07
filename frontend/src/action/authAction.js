import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Register User
export const registerUser = createAsyncThunk(
  "/api/users/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/users/register", userData);
      return data; // Success response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors || "Registration failed"
      );
    }
  }
);

// Login User
export const loginUser = createAsyncThunk(
  "api/users/login",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/users/login", userData);

      // Save token in localStorage
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      return data; // Success response
    } catch (error) {
      return rejectWithValue(error.response?.data?.errors || "Login failed");
    }
  }
);
