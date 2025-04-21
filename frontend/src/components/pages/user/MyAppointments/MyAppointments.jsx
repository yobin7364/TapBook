import React, { useState } from "react";
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CommonToast from "../../../common/CommonToast";

// Hardcoded Appointments (Upcoming + Past)
const appointments = [
  {
    id: 1,
    date: "2025-04-25",
    time: "10:00",
    service: "Medical Consultation",
    doctor: "Dr. Smith",
  },
  {
    id: 2,
    date: "2025-04-27",
    time: "14:00",
    service: "Personal Training",
    doctor: "John Doe",
  },
  {
    id: 3,
    date: "2025-04-30",
    time: "09:00",
    service: "Therapy Session",
    doctor: "Dr. Johnson",
  },
  {
    id: 4,
    date: "2025-05-02",
    time: "11:00",
    service: "Business Consultation",
    doctor: "Jane Wilson",
  },
  {
    id: 5,
    date: "2025-05-05",
    time: "16:00",
    service: "Fitness Assessment",
    doctor: "Mike Brown",
  },
  {
    id: 6,
    date: "2025-05-10",
    time: "08:00",
    service: "Yoga Class",
    doctor: "Sarah Lee",
  },
  {
    id: 7,
    date: "2025-05-12",
    time: "13:00",
    service: "Nutrition Consultation",
    doctor: "Anna White",
  },
  // Past
  {
    id: 8,
    date: "2024-04-10",
    time: "10:00",
    service: "Eye Checkup",
    doctor: "Dr. Clark",
  },
  {
    id: 9,
    date: "2024-03-22",
    time: "12:00",
    service: "Dental Cleaning",
    doctor: "Dr. Patel",
  },
  {
    id: 10,
    date: "2024-02-15",
    time: "09:30",
    service: "Physical Therapy",
    doctor: "Dr. Roberts",
  },
];

const MyAppointments = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("upcoming");
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [page, setPage] = useState(1);
  const appointmentsPerPage = 4;

  // For Review
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [appointmentToReview, setAppointmentToReview] = useState(null);

  const today = new Date();

  const handleUpdate = () => {
    navigate("/updateAppointment");
  };

  const handleCancel = (appointment) => {
    setAppointmentToCancel(appointment);
    setOpenCancelDialog(true);
  };

  const confirmCancel = () => {
    console.log("Appointment canceled:", appointmentToCancel);
    setOpenCancelDialog(false);
    setAppointmentToCancel(null);
    setToastMessage("Appointment canceled successfully!");
    setShowToast(true);
  };

  const handleReview = (appointment) => {
    setAppointmentToReview(appointment);
    setOpenReviewDialog(true);
  };

  const submitReview = () => {
    console.log("Review submitted:", {
      service: appointmentToReview?.service,
      rating,
      reviewText,
    });

    setOpenReviewDialog(false);
    setAppointmentToReview(null);
    setRating(0);
    setReviewText("");
    setToastMessage("Review submitted successfully!");
    setShowToast(true);
  };

  const filteredAppointments = appointments.filter((a) => {
    const appointmentDate = new Date(`${a.date}T${a.time}`);
    return tab === "upcoming"
      ? appointmentDate >= today
      : appointmentDate < today;
  });

  const startIndex = (page - 1) * appointmentsPerPage;
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + appointmentsPerPage
  );

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
              setPage(1);
            }}
          >
            Upcoming
          </Button>
          <Button
            variant={tab === "past" ? "contained" : "outlined"}
            onClick={() => {
              setTab("past");
              setPage(1);
            }}
          >
            Past
          </Button>
        </Box>

        {/* Appointments List */}
        {paginatedAppointments.map((appointment) => (
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
              {new Date(
                `${appointment.date}T${appointment.time}`
              ).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold">
              {appointment.service}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              with {appointment.doctor}
            </Typography>

            {/* Buttons */}
            {tab === "upcoming" && (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button variant="outlined" onClick={() => handleUpdate()}>
                  Update
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleCancel(appointment)}
                >
                  Cancel
                </Button>
              </Box>
            )}

            {tab === "past" && (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => handleReview(appointment)}
                >
                  Give Review
                </Button>
              </Box>
            )}
          </Box>
        ))}

        {/* Pagination */}
        {filteredAppointments.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={Math.ceil(
                filteredAppointments.length / appointmentsPerPage
              )}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}

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
                  <strong>Service:</strong> {appointmentToCancel.service}
                </Typography>
                <Typography>
                  <strong>Doctor:</strong> {appointmentToCancel.doctor}
                </Typography>
                <Typography>
                  <strong>Date:</strong>{" "}
                  {new Date(
                    `${appointmentToCancel.date}T${appointmentToCancel.time}`
                  ).toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCancelDialog(false)}>No</Button>
            <Button onClick={confirmCancel} color="error">
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
            <Button onClick={() => setOpenReviewDialog(false)}>Cancel</Button>
            <Button onClick={submitReview} variant="contained">
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        {/* Toast for cancellation and review */}
        <CommonToast
          open={showToast}
          message={toastMessage}
          severity="success"
          onClose={() => setShowToast(false)}
        />
      </Box>
    </Box>
  );
};

export default MyAppointments;
