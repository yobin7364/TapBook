import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/authSlice"; // Import the auth slice
import dashboardReducer from "../redux/dashboardSlice";
import serviceReducer from "../redux/serviceSlice";
import manageAppointmentReducer from "../redux/manageAppointmentSlice";
import membershipReducer from "../redux/membershipSlice";
import userAppointmentReducer from "../redux/appointmentSlice";
import providerReviewsReducer from "../redux/reviewSlice";

const store = configureStore({
  reducer: {
    auth: authReducer, // Register the auth slice
    dashboard: dashboardReducer,
    service: serviceReducer,
    manageAppointment: manageAppointmentReducer,
    membership: membershipReducer,
    userAppointment: userAppointmentReducer,
    providerReviews: providerReviewsReducer,
  },
});

export default store;
