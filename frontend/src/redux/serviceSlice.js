// src/redux/slice/admin/serviceSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  addService,
  getServiceById,
  updateServiceById,
} from "../action/admin/serviceSettingAction";

const initialState = {
  // Add Service
  addedService: null,
  loadingAddService: false,
  errorAddService: null,

  // Get Single Service
  singleService: null,
  loadingSingleService: false,
  errorSingleService: null,

  // Update Service
  updatedService: null,
  loadingUpdateService: false,
  errorUpdateService: null,
};

const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Add Service
    builder
      .addCase(addService.pending, (state) => {
        state.loadingAddService = true;
        state.errorAddService = null;
      })
      .addCase(addService.fulfilled, (state, action) => {
        state.loadingAddService = false;
        state.addedService = action.payload;
      })
      .addCase(addService.rejected, (state, action) => {
        state.loadingAddService = false;
        state.errorAddService = action.payload;
      });

    // Get Service By ID
    builder
      .addCase(getServiceById.pending, (state) => {
        state.loadingSingleService = true;
        state.errorSingleService = null;
      })
      .addCase(getServiceById.fulfilled, (state, action) => {
        state.loadingSingleService = false;
        state.singleService = action.payload;
      })
      .addCase(getServiceById.rejected, (state, action) => {
        state.loadingSingleService = false;
        state.errorSingleService = action.payload;
      });

    // Update Service By ID
    builder
      .addCase(updateServiceById.pending, (state) => {
        state.loadingUpdateService = true;
        state.errorUpdateService = null;
      })
      .addCase(updateServiceById.fulfilled, (state, action) => {
        state.loadingUpdateService = false;
        state.updatedService = action.payload;
      })
      .addCase(updateServiceById.rejected, (state, action) => {
        state.loadingUpdateService = false;
        state.errorUpdateService = action.payload;
      });
  },
});

export default serviceSlice.reducer;
