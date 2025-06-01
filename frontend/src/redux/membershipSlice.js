import { createSlice } from "@reduxjs/toolkit";
import {
  subscribeMembership,
  getMembership,
  cancelMembership,
} from "../action/customer/membershipAction"; // adjust path as needed

const initialState = {
  currentMembership: null,
  loadingMembership: false,
  errorMembership: null,

  subscribing: false,
  subscriptionSuccess: false,
  errorSubscription: null,

  canceling: false,
  cancelSuccess: false,
  errorCancel: null,
};

const membershipSlice = createSlice({
  name: "membership",
  initialState,
  reducers: {
    resetMembershipStatus: (state) => {
      state.subscriptionSuccess = false;
      state.cancelSuccess = false;
      state.errorSubscription = null;
      state.errorCancel = null;
    },
  },
  extraReducers: (builder) => {
    // Subscribe
    builder
      .addCase(subscribeMembership.pending, (state) => {
        state.subscribing = true;
        state.errorSubscription = null;
        state.subscriptionSuccess = false;
      })
      .addCase(subscribeMembership.fulfilled, (state, action) => {
        state.subscribing = false;
        state.subscriptionSuccess = true;
        state.currentMembership = action.payload;
      })
      .addCase(subscribeMembership.rejected, (state, action) => {
        state.subscribing = false;
        state.errorSubscription = action.payload;
      });

    // Get Membership
    builder
      .addCase(getMembership.pending, (state) => {
        state.loadingMembership = true;
        state.errorMembership = null;
      })
      .addCase(getMembership.fulfilled, (state, action) => {
        state.loadingMembership = false;
        state.currentMembership = action.payload;
      })
      .addCase(getMembership.rejected, (state, action) => {
        state.loadingMembership = false;
        state.errorMembership = action.payload;
      });

    // Cancel Membership
    builder
      .addCase(cancelMembership.pending, (state) => {
        state.canceling = true;
        state.errorCancel = null;
        state.cancelSuccess = false;
      })
      .addCase(cancelMembership.fulfilled, (state) => {
        state.canceling = false;
        state.cancelSuccess = true;
        state.currentMembership = null;
      })
      .addCase(cancelMembership.rejected, (state, action) => {
        state.canceling = false;
        state.errorCancel = action.payload;
      });
  },
});

export const { resetMembershipStatus } = membershipSlice.actions;

export default membershipSlice.reducer;
