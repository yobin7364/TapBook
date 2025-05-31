import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";

import { cancelAppointmentsBatch } from "../../../../action/admin/dashboardAction";
import CommonToast from "../../../common/CommonToast";

const CancelAppointment = () => {
  const dispatch = useDispatch();

  const [selectedDate, setSelectedDate] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const { loadingBatchCancel, successBatchCancel, errorBatchCancel } =
    useSelector((state) => state.dashboard);

  useEffect(() => {
    if (successBatchCancel) {
      setSnackbarMessage("Appointments cancelled successfully.");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setSelectedDate(null);
    }

    if (errorBatchCancel) {
      setSnackbarMessage(
        typeof errorBatchCancel === "string"
          ? errorBatchCancel
          : "Something went wrong"
      );
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  }, [successBatchCancel, errorBatchCancel]);

  const handleBatchCancel = () => {
    if (!selectedDate) return;

    const formattedDate = dayjs(selectedDate)
      .hour(6)
      .minute(0)
      .second(0)
      .millisecond(0)
      .toISOString();

    dispatch(cancelAppointmentsBatch({ givenDate: { start: formattedDate } }));
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box width="100%" maxWidth={600} mx="auto" p={3} sx={{ minHeight: "79vh" }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <EventBusyIcon />
        <Typography variant="h6">Batch Cancel Appointments</Typography>
      </Box>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Select Date"
          value={selectedDate}
          onChange={(newDate) => setSelectedDate(newDate)}
          disablePast
          renderInput={(params) => <TextField fullWidth {...params} />}
        />
      </LocalizationProvider>

      <Box mt={4}>
        <Button
          variant="contained"
          color="error"
          fullWidth
          onClick={handleBatchCancel}
          disabled={!selectedDate || loadingBatchCancel}
          startIcon={loadingBatchCancel && <CircularProgress size={20} />}
        >
          {loadingBatchCancel ? "Cancelling..." : "Cancel Appointments"}
        </Button>
      </Box>

      <CommonToast
        open={openSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleCloseSnackbar}
      />
    </Box>
  );
};

export default CancelAppointment;
