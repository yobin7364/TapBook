// src/redux/slice/admin/serviceSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  addService,
  getServiceById,
  updateServiceById,
  getAvailableSlotsByDate,
} from "../action/admin/serviceSettingAction";

import { getSerivesList } from "../action/customer/servicesListAction";

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

  // Get Services List
  servicesList: {},
  loadingServicesList: false,
  errorServicesList: null,

  // Available Slots
  availableSlots: [],
  loadingAvailableSlots: false,
  errorAvailableSlots: null,
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

    // Get Services List
    builder
      .addCase(getSerivesList.pending, (state) => {
        state.loadingServicesList = true;
        state.errorServicesList = null;
      })
      .addCase(getSerivesList.fulfilled, (state, action) => {
        state.loadingServicesList = false;
        state.servicesList = action.payload;
      })
      .addCase(getSerivesList.rejected, (state, action) => {
        state.loadingServicesList = false;
        state.errorServicesList = action.payload;
      });
    // Get Available Slots
    builder
      .addCase(getAvailableSlotsByDate.pending, (state) => {
        state.loadingAvailableSlots = true;
        state.errorAvailableSlots = null;
      })
      .addCase(getAvailableSlotsByDate.fulfilled, (state, action) => {
        state.loadingAvailableSlots = false;
        state.availableSlots = action.payload;
      })
      .addCase(getAvailableSlotsByDate.rejected, (state, action) => {
        state.loadingAvailableSlots = false;
        state.errorAvailableSlots = action.payload;
      });
  },
});

export default serviceSlice.reducer;
