import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/authSlice"; // Import the auth slice

const store = configureStore({
  reducer: {
    auth: authReducer, // Register the auth slice
  },
});

export default store;
