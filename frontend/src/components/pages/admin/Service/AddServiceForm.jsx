import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  Grid,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { useSelector, useDispatch } from "react-redux";
import { addService } from "../../../../action/admin/serviceSettingAction";
import { useNavigate } from "react-router-dom";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const defaultHours = daysOfWeek.reduce((acc, day) => {
  acc[day] = {
    from: dayjs("2023-01-01T09:00:00"),
    to: dayjs("2023-01-01T17:00:00"),
    closed: false,
  };
  return acc;
}, {});

const AddServiceForm = () => {
  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [businessHours, setBusinessHours] = useState(defaultHours);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { addedService, loadingAddService } = useSelector(
    (state) => state.service
  );

  useEffect(() => {
    if (addedService?.success) {
      navigate("/serviceSetting");
    }
  }, [addedService, navigate]);

  const toggleClosed = (day) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], closed: !prev[day].closed },
    }));
  };

  const isFormValid =
    serviceName.trim() !== "" &&
    category.trim() !== "" &&
    duration !== "" &&
    address.trim() !== "" &&
    price !== "" &&
    !isNaN(Number(price)) &&
    Object.values(businessHours).every((day) => {
      if (day.closed) return true;
      return day.from && day.to;
    });

  const formatTime = (time) => dayjs(time).format("HH:mm:ss");

  const handleSubmit = async () => {
    const finalPayload = {
      serviceName: serviceName.trim(),
      category,
      price: Number(price),
      duration: Number(duration),
      address: address.trim(),
      businessHours: {},
    };

    daysOfWeek.forEach((day) => {
      finalPayload.businessHours[day] = {
        from: businessHours[day].closed
          ? "00:00:00"
          : formatTime(businessHours[day].from),
        to: businessHours[day].closed
          ? "00:00:00"
          : formatTime(businessHours[day].to),
        closed: businessHours[day].closed,
      };
    });

    dispatch(addService(finalPayload));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={3}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Add New Service
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Typography fontWeight="bold">Service Name *</Typography>
            <TextField
              fullWidth
              required
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography fontWeight="bold">Category *</Typography>
            <Select
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select Category
              </MenuItem>
              <MenuItem value="haircut">Haircut</MenuItem>
              <MenuItem value="massage">Massage</MenuItem>
              <MenuItem value="yoga">Yoga</MenuItem>
              <MenuItem value="dentist">Dentist</MenuItem>
              <MenuItem value="gym">Gym</MenuItem>
              <MenuItem value="consultation">Consultation</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography fontWeight="bold">Duration (minutes) *</Typography>
            <Select
              fullWidth
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select Duration
              </MenuItem>
              <MenuItem value={15}>15 minutes</MenuItem>
              <MenuItem value={30}>30 minutes</MenuItem>
              <MenuItem value={60}>1 hour</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography fontWeight="bold">Address *</Typography>
            <TextField
              fullWidth
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography fontWeight="bold">Price ($) *</Typography>
            <TextField
              fullWidth
              value={price}
              onChange={(e) => {
                if (/^\d*\.?\d*$/.test(e.target.value)) {
                  setPrice(e.target.value);
                }
              }}
              inputProps={{ inputMode: "decimal", pattern: "\\d*" }}
            />
          </Grid>
        </Grid>

        <Typography mt={4} mb={1} fontWeight="bold">
          Business Hours *
        </Typography>
        {daysOfWeek.map((day) => (
          <Box key={day} mb={2} display="flex" alignItems="center" gap={2}>
            <Typography sx={{ width: 100 }} fontWeight="bold">
              {day}
            </Typography>
            <TimePicker
              label="From"
              value={businessHours[day].from}
              onChange={(newVal) =>
                setBusinessHours((prev) => ({
                  ...prev,
                  [day]: { ...prev[day], from: newVal },
                }))
              }
              disabled={businessHours[day].closed}
              minutesStep={5}
            />
            <TimePicker
              label="To"
              value={businessHours[day].to}
              onChange={(newVal) =>
                setBusinessHours((prev) => ({
                  ...prev,
                  [day]: { ...prev[day], to: newVal },
                }))
              }
              disabled={businessHours[day].closed}
              minutesStep={5}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={businessHours[day].closed}
                  onChange={() => toggleClosed(day)}
                />
              }
              label="Closed"
            />
          </Box>
        ))}

        <Box mt={3}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isFormValid || loadingAddService}
            startIcon={
              loadingAddService ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {loadingAddService ? "Submitting..." : "Submit Service"}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default AddServiceForm;
