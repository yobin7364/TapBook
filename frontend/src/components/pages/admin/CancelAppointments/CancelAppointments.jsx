// Install needed libraries first if not installed:
// npm install @mui/material @mui/x-date-pickers dayjs

import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import dayjs from "dayjs";

const CancelAppointment = () => {
  const [startDateTime, setStartDateTime] = useState(null);
  const [endDateTime, setEndDateTime] = useState(null);

  const handleStartChange = (newValue) => {
    setStartDateTime(newValue);
    if (endDateTime && newValue && dayjs(newValue).isAfter(endDateTime)) {
      setEndDateTime(null);
    }
  };

  const handleEndChange = (newValue) => {
    if (startDateTime && newValue && dayjs(newValue).isBefore(startDateTime)) {
      alert("End DateTime cannot be before Start DateTime");
      return;
    }
    setEndDateTime(newValue);
  };

  const handleBatchCancel = () => {
    console.log(
      "Batch cancel from:",
      startDateTime?.format(),
      "to:",
      endDateTime?.format()
    );
    // Add your API logic here
  };

  return (
    <Box width="100%" maxWidth={600} mx="auto" p={3} sx={{ minHeight: "79vh" }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <EventBusyIcon />
        <Typography variant="h6">Batch Cancel Appointments</Typography>
      </Box>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box display="flex" flexDirection="column" gap={2}>
          <DateTimePicker
            label="Start Date & Time"
            value={startDateTime}
            onChange={handleStartChange}
            disablePast
            renderInput={(params) => <TextField {...params} />}
          />
          <DateTimePicker
            label="End Date & Time"
            value={endDateTime}
            onChange={handleEndChange}
            disablePast
            minDateTime={startDateTime || undefined}
            renderInput={(params) => <TextField {...params} />}
          />
        </Box>
      </LocalizationProvider>

      <Box mt={4}>
        <Button
          variant="contained"
          color="error"
          fullWidth
          disabled={!startDateTime || !endDateTime}
          onClick={handleBatchCancel}
        >
          Cancel Appointments
        </Button>
      </Box>
    </Box>
  );
};

export default CancelAppointment;
