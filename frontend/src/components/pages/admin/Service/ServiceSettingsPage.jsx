// ServiceSettingsPage.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Paper,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CommonToast from "../../../common/CommonToast";

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
    from: new Date(0, 0, 0, 9, 0),
    to: new Date(0, 0, 0, 17, 0),
    closed: ["Friday", "Saturday", "Sunday"].includes(day),
  };
  return acc;
}, {});

const ServiceSettingsPage = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [category, setCategory] = useState("Consulting");
  const [duration, setDuration] = useState("30 minutes");
  const [address, setAddress] = useState("123 Main St");
  const [businessHours, setBusinessHours] = useState(defaultHours);
  const [tempHours, setTempHours] = useState(defaultHours);
  const [toastOpen, setToastOpen] = useState(false);

  const hasInvalidTimes = () => {
    return daysOfWeek.some((day) => {
      const { from, to, closed } = tempHours[day];
      return !closed && from >= to;
    });
  };

  const handleSave = () => {
    if (hasInvalidTimes()) return;
    setBusinessHours(tempHours);
    setIsEditMode(false);
    setToastOpen(true);
  };

  const toggleClosed = (day) => {
    setTempHours({
      ...tempHours,
      [day]: {
        ...tempHours[day],
        closed: !tempHours[day].closed,
      },
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={4} maxWidth="900px" mx="auto" minHeight="85vh">
        <Paper elevation={3} sx={{ backgroundColor: "#f9f9f9", p: 0 }}>
          <Box
            sx={{
              backgroundColor: "#e3f2fd",
              px: 4,
              py: 3,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              color: "#0d47a1",
              marginBottom: 4,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              Service Settings
            </Typography>
          </Box>

          <Box px={4} pb={4}>
            {!isEditMode ? (
              <Box>
                <Typography>
                  <strong>Category:</strong> {category}
                </Typography>
                <Typography>
                  <strong>Appointment Duration:</strong> {duration}
                </Typography>
                <Typography>
                  <strong>Address:</strong> {address}
                </Typography>
                <Box
                  mt={3}
                  sx={{ backgroundColor: "#f5f5f5", p: 2, borderRadius: 1 }}
                >
                  <Typography variant="h6" fontWeight="bold" mb={1}>
                    Business Hours
                  </Typography>
                  {daysOfWeek.map((day) => (
                    <Typography key={day}>
                      <strong>{day}:</strong>{" "}
                      {businessHours[day].closed
                        ? "Closed"
                        : `${businessHours[day].from.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} – ${businessHours[day].to.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`}
                    </Typography>
                  ))}
                </Box>
                <Button
                  variant="contained"
                  sx={{ mt: 3 }}
                  onClick={() => setIsEditMode(true)}
                >
                  Edit
                </Button>
              </Box>
            ) : (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography fontWeight="bold">Category</Typography>
                    <Select
                      fullWidth
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <MenuItem value="Consulting">Consulting</MenuItem>
                      <MenuItem value="Therapy">Therapy</MenuItem>
                      <MenuItem value="Fitness">Fitness</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography fontWeight="bold">
                      Appointment Duration
                    </Typography>
                    <Select
                      fullWidth
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    >
                      <MenuItem value="15 minutes">15 minutes</MenuItem>
                      <MenuItem value="30 minutes">30 minutes</MenuItem>
                      <MenuItem value="1 hour">1 hour</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography fontWeight="bold">Address</Typography>
                    <TextField
                      fullWidth
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Typography mt={4} mb={1} fontWeight="bold">
                  Business Hours
                </Typography>
                {daysOfWeek.map((day) => (
                  <Box
                    key={day}
                    mb={2}
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
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
                  <Button
                    variant="outlined"
                    sx={{ mr: 2 }}
                    onClick={() => setIsEditMode(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={hasInvalidTimes()}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

          <CommonToast
            open={toastOpen}
            onClose={() => setToastOpen(false)}
            message="Service settings updated successfully!"
          />
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default ServiceSettingsPage;
