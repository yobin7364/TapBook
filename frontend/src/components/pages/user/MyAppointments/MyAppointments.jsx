import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Pagination,
  Rating,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CommonToast from "../../../common/CommonToast";
import { useDispatch, useSelector } from "react-redux";
import {
  getUpcomingAppointments,
  getPastAppointments,
  cancelAppointment,
  submitReview,
} from "../../../../action/customer/appointmentAction";
import { resetAppointmentStatus } from "../../../../redux/appointmentSlice";

const MyAppointments = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("upcoming");
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [severity, setSeverity] = useState("");

  const dispatch = useDispatch();

  const {
    upcoming,
    past,
    loadingUpcoming,
    loadingPast,
    canceling,
    cancelSuccess,
    errorCancel,
    errorPast,
    errorUpcoming,
  } = useSelector((state) => state.userAppointment);

  useEffect(() => {
    if (errorCancel) {
      setSeverity("error");
      setToastMessage(errorCancel);
      setShowToast(true);
    }
  }, [errorCancel]);

  useEffect(() => {
    if (errorPast) {
      setSeverity("error");
      setToastMessage(errorPast);
      setShowToast(true);
    }
  }, [errorPast]);

  useEffect(() => {
    if (errorUpcoming) {
      setSeverity("error");
      setToastMessage(errorUpcoming);
      setShowToast(true);
    }
  }, [errorUpcoming]);

  const [cancelNote, setCancelNote] = useState("");

  useEffect(() => {
    if (tab === "upcoming") {
      dispatch(getUpcomingAppointments());
    } else {
      dispatch(getPastAppointments());
    }
  }, [dispatch, tab]);

  // For Review
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [appointmentToReview, setAppointmentToReview] = useState(null);

  useEffect(() => {
    if (!openReviewDialog) {
      setRating(0);
      setReviewText("");
    }
  }, [openReviewDialog]);

  const handleCancel = (appointment) => {
    setAppointmentToCancel(appointment);
    setOpenCancelDialog(true);
  };

  const confirmCancel = ({ appointmentId, cancelNote }) => {
    dispatch(cancelAppointment({ appointmentId, cancelNote })).then(() => {
      dispatch(getUpcomingAppointments());
    });
  };

  useEffect(() => {
    if (!canceling && cancelSuccess) {
      setSeverity("success");
      setOpenCancelDialog(false);
      setAppointmentToCancel(null);
      setToastMessage("Appointment canceled successfully!");
      setShowToast(true);
    }
  }, [canceling, cancelSuccess]);

  const handleReview = (appointment) => {
    setAppointmentToReview(appointment);
    setOpenReviewDialog(true);
  };

  const submitUserReview = () => {
    const givenReview = {
      appointment: appointmentToReview?.service?._id,
      rating,
      comment: reviewText,
    };

    dispatch(submitReview(givenReview));

    setOpenReviewDialog(false);
    setAppointmentToReview(null);
    setRating(0);
    setReviewText("");
    setToastMessage("Review submitted successfully!");
    setShowToast(true);
  };

  const capitalizeFirst = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <Box
      sx={{
        p: 4,
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          minWidth: "800px",
          backgroundColor: "white",
          borderRadius: 3,
          p: 4,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Appointments
        </Typography>

        {/* Tabs */}
        <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
          <Button
            variant={tab === "upcoming" ? "contained" : "outlined"}
            onClick={() => {
              setTab("upcoming");
            }}
          >
            Upcoming
          </Button>
          <Button
            variant={tab === "past" ? "contained" : "outlined"}
            onClick={() => {
              setTab("past");
            }}
          >
            Past
          </Button>
        </Box>

        {/* Appointments List */}

        {tab === "upcoming" &&
          (loadingUpcoming ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            upcoming?.map((appointment) => (
              <Box
                key={appointment.id}
                sx={{
                  p: 3,
                  mb: 3,
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  backgroundColor: "white",
                }}
              >
                <Typography fontWeight="bold" gutterBottom>
                  {new Date(appointment.slot.start).toLocaleString("en-GB", {
                    timeZone: "UTC",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {capitalizeFirst(appointment.service?.category) || "NaN"}
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  with {capitalizeFirst(appointment.service?.admin?.name)}
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleCancel(appointment)}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ))
          ))}
        {tab === "past" &&
          (loadingPast ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            past?.map((appointment) => (
              <Box
                key={appointment.id}
                sx={{
                  p: 3,
                  mb: 3,
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  backgroundColor: "white",
                }}
              >
                <Typography fontWeight="bold" gutterBottom>
                  {new Date(appointment.slot.start).toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {appointment.service?.category || "nan"}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  with {appointment.service?.name}
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => handleReview(appointment)}
                  >
                    Give Review
                  </Button>
                </Box>
              </Box>
            ))
          ))}

        {/* Cancel Confirmation Dialog */}
        <Dialog
          open={openCancelDialog}
          onClose={() => setOpenCancelDialog(false)}
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ bgcolor: "red", color: "white" }}>
            Cancel Appointment
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {appointmentToCancel && (
              <>
                <Typography>
                  Are you sure you want to cancel this appointment?
                </Typography>
                <Typography sx={{ mt: 2 }}>
                  <strong>Service:</strong>{" "}
                  {capitalizeFirst(appointmentToCancel.service?.category) ||
                    "nan"}
                </Typography>
                <Typography>
                  <strong>Doctor:</strong>{" "}
                  {capitalizeFirst(appointmentToCancel.service?.admin?.name)}
                </Typography>
                <Typography>
                  <strong>Date:</strong>{" "}
                  {new Date(appointmentToCancel.slot.start).toLocaleString(
                    "en-GB",
                    {
                      timeZone: "UTC",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }
                  )}
                </Typography>

                {/* Cancel Note Field */}
                <TextField
                  label="Cancel Note"
                  multiline
                  rows={3}
                  fullWidth
                  value={cancelNote}
                  onChange={(e) => setCancelNote(e.target.value)}
                  sx={{ mt: 3 }}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCancelDialog(false)}>No</Button>
            <Button
              onClick={() =>
                confirmCancel({
                  startDate: appointmentToCancel.slot.start,
                  appointmentId: appointmentToCancel._id,
                  cancelNote: cancelNote,
                })
              }
              disabled={!cancelNote}
              color="error"
            >
              Yes, Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Review Dialog */}
        <Dialog
          open={openReviewDialog}
          onClose={() => setOpenReviewDialog(false)}
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#f5f5f5",
              borderRadius: 2,
              fontWeight: "bold",
            }}
          >
            Give Review
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography mb={1}>Rate the Service</Typography>
            <Rating
              name="simple-controlled"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
            />
            <TextField
              label="Write a Review"
              multiline
              rows={4}
              fullWidth
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              sx={{ mt: 3 }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenReviewDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={submitUserReview} variant="contained">
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        {/* Toast for cancellation and review */}
        <CommonToast
          open={showToast}
          message={toastMessage}
          severity={severity}
          onClose={() => {
            setShowToast(false);
            dispatch(resetAppointmentStatus());
          }}
        />
      </Box>
    </Box>
  );
};

export default MyAppointments;
