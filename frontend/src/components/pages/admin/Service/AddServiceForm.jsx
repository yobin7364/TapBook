import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import React, { useState } from "react";

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
  acc[day] = { from: null, to: null, closed: false };
  return acc;
}, {});

const isValidPrice = (value) => /^\d*\.?\d*$/.test(value);

const AddServiceForm = ({ onCancel, onSave }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [tempHours, setTempHours] = useState(defaultHours);

  const toggleClosed = (day) => {
    setTempHours({
      ...tempHours,
      [day]: { ...tempHours[day], closed: !tempHours[day].closed },
    });
  };

  const hasInvalidTimes = () =>
    daysOfWeek.some(
      (day) =>
        !tempHours[day].closed &&
        (!tempHours[day].from ||
          !tempHours[day].to ||
          tempHours[day].from >= tempHours[day].to)
    );

  const handleSave = () => {
    const formData = {
      name,
      category,
      duration,
      address,
      price,
      hours: tempHours,
    };

    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Add New Service
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <Typography fontWeight="bold">Name *</Typography>
          <TextField
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <Typography fontWeight="bold">Category</Typography>
          <Select
            fullWidth
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Select Category</MenuItem>
            <MenuItem value="haircut">Haircut</MenuItem>
            <MenuItem value="massage">Massage</MenuItem>
            <MenuItem value="yoga">Yoga</MenuItem>
            <MenuItem value="dentist">Dentist</MenuItem>
            <MenuItem value="gym">Gym</MenuItem>
            <MenuItem value="consultation">Consultation</MenuItem>
          </Select>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Typography fontWeight="bold">Appointment Duration</Typography>
          <Select
            fullWidth
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Select Duration</MenuItem>
            <MenuItem value="15 minutes">15 minutes</MenuItem>
            <MenuItem value="30 minutes">30 minutes</MenuItem>
            <MenuItem value="1 hour">1 hour</MenuItem>
          </Select>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Typography fontWeight="bold">Address</Typography>
          <TextField
            fullWidth
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <Typography fontWeight="bold">Price ($)</Typography>
          <TextField
            fullWidth
            value={price}
            onChange={(e) => {
              if (isValidPrice(e.target.value)) {
                setPrice(e.target.value);
              }
            }}
            inputProps={{ inputMode: "decimal", pattern: "\\d*" }}
          />
        </Grid>
      </Grid>

      <Typography mt={4} mb={1} fontWeight="bold">
        Business Hours
      </Typography>
      {daysOfWeek.map((day) => (
        <Box key={day} mb={2} display="flex" alignItems="center" gap={2}>
          <Typography sx={{ width: 100 }} fontWeight="bold">
            {day}
          </Typography>
          <TimePicker
            label="From"
            value={tempHours[day].from}
            onChange={(newVal) =>
              setTempHours({
                ...tempHours,
                [day]: { ...tempHours[day], from: newVal },
              })
            }
            disabled={tempHours[day].closed}
            minutesStep={5}
          />
          <TimePicker
            label="To"
            value={tempHours[day].to}
            onChange={(newVal) =>
              setTempHours({
                ...tempHours,
                [day]: { ...tempHours[day], to: newVal },
              })
            }
            disabled={tempHours[day].closed}
            minTime={tempHours[day].from}
            minutesStep={5}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={tempHours[day].closed}
                onChange={() => toggleClosed(day)}
              />
            }
            label="Closed"
          />
        </Box>
      ))}

      <Box mt={3}>
        <Button variant="outlined" sx={{ mr: 2 }} onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!name || !price || Number(price) < 0 || hasInvalidTimes()}
        >
          Save
        </Button>
      </Box>
    </Paper>
  );
};

export default AddServiceForm;
