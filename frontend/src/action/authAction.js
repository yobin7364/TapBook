import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import { jwtDecode } from "jwt-decode";

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
      const token = data.token;

      // Save token in localStorage
      if (token) {
        localStorage.setItem("authToken", token);
      }

      // set token to Auth header
      setAuthToken(token);

      const decoded = jwtDecode(token);

      return decoded; // Success response
    } catch (error) {
      return rejectWithValue(error.response?.data?.errors || "Login failed");
    }
  }
);

// Get current user information
export const currentUserInfo = createAsyncThunk(
  "users/current",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/users/current", userData);

      return data; // Success response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors || "Current User failed to load"
      );
    }
  }
);
