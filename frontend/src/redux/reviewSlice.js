// src/redux/slice/admin/reviewSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { getProviderReviews } from "../action/admin/reviewAction";

const reviewSlice = createSlice({
  name: "providerReviews",
  initialState: {
    loading: false,
    reviews: [],
    error: null,
  },
  reducers: {
    // You can add additional synchronous reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProviderReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProviderReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(getProviderReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default reviewSlice.reducer;
