import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/authSlice"; // Import the auth slice
import dashboardReducer from "../redux/dashboardSlice";
import serviceReducer from "../redux/serviceSlice";

const store = configureStore({
  reducer: {
    auth: authReducer, // Register the auth slice
    dashboard: dashboardReducer,
    service: serviceReducer,
  },
});

export default store;
