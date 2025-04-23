// BookingPage.jsx
import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Grid, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

const getNext7Days = () => {
  const today = new Date();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);
    days.push(futureDate);
  }
  return days;
};

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 20; hour++) {
    slots.push(`${hour}:00`);
    slots.push(`${hour}:30`);
  }
  return slots;
};

const BookingPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [mobile, setMobile] = useState("");
  const [note, setNote] = useState("");
  const navigator = useNavigate();

  const dates = getNext7Days();

  useEffect(() => {
    const now = new Date();
    const todaySlots = generateTimeSlots().filter((slot) => {
      if (selectedDate.toDateString() !== now.toDateString()) return true;
      const [slotHour, slotMin] = slot.split(":").map(Number);
      if (slotHour > now.getHours()) return true;
      if (slotHour === now.getHours() && slotMin > now.getMinutes())
        return true;
      return false;
    });
    setAvailableSlots(todaySlots);
    setSelectedTime("");
  }, [selectedDate]);

  const handleContinue = () => {
    if (!selectedTime || !/^\d{10}$/.test(mobile)) {
      console.log("Time or mobile not valid");
      return;
    }

    const [hour, minute] = selectedTime.split(":");
    const bookingDateTime = new Date(selectedDate);
    bookingDateTime.setHours(Number(hour));
    bookingDateTime.setMinutes(Number(minute));
    bookingDateTime.setSeconds(0);
    bookingDateTime.setMilliseconds(0);

    console.log("Booking ISO Time:", bookingDateTime.toISOString());
    console.log("Mobile:", mobile);
    console.log("Note:", note);
    navigator("/appointmentSummary");
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
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Book Appointment
        </Typography>
        <Typography variant="subtitle1" color="text.primary" fontWeight="bold">
          General Consultation
        </Typography>
        <Typography variant="subtitle2" color="text.primary" fontWeight="bold">
          Dr. Emily Carter
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
          <Typography sx={{ color: "orange", mr: 1, fontWeight: "bold" }}>
            ⭐ 4.8
          </Typography>
          <Typography variant="body2" color="text.primary" fontWeight="bold">
            123 Health Street, Wellness City
          </Typography>
        </Box>
        <Box sx={{ height: "1px", backgroundColor: "#ccc", mt: 2 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          {dates.map((date, idx) => (
            <Button
              key={idx}
              onClick={() => setSelectedDate(date)}
              variant={
                selectedDate.toDateString() === date.toDateString()
                  ? "contained"
                  : "text"
              }
              sx={{ flex: 1, mx: 0.5 }}
            >
              <Box>
                <Typography variant="body2">
                  {date.toLocaleString("default", { month: "short" })}
                </Typography>
                <Typography variant="h6">{date.getDate()}</Typography>
                <Typography variant="body2">
                  {date.toLocaleString("default", { weekday: "short" })}
                </Typography>
              </Box>
            </Button>
          ))}
        </Box>

        <Box sx={{ height: "1px", backgroundColor: "#ccc", mt: 2 }} />

        <Grid container spacing={2} mt={4}>
          {availableSlots.length > 0 ? (
            availableSlots.map((time, idx) => (
              <Grid item xs={4} sm={3} md={2} key={idx}>
                <Button
                  fullWidth
                  variant={selectedTime === time ? "contained" : "outlined"}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              </Grid>
            ))
          ) : (
            <Typography mt={2}>No slots available for today.</Typography>
          )}
        </Grid>

        <Grid container spacing={2} mt={4}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Mobile Number"
              fullWidth
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              error={mobile !== "" && !/^\d{10}$/.test(mobile)}
              helperText={
                mobile !== "" && !/^\d{10}$/.test(mobile)
                  ? "Enter a valid 10-digit mobile number"
                  : ""
              }
              sx={{ maxWidth: "300px" }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Special Note (Optional)"
              fullWidth
              value={note}
              onChange={(e) => setNote(e.target.value)}
              multiline
              minRows={4}
            />
          </Grid>
        </Grid>

        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            sx={{ px: 4 }}
            onClick={handleContinue}
            disabled={!selectedTime || !/^\d{10}$/.test(mobile)}
          >
            Continue
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default BookingPage;
