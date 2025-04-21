import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CommonToast from "../../../common/CommonToast";

// Generate next 7 days
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

// Generate time slots (every 30 minutes)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 20; hour++) {
    slots.push(`${hour}:00`);
    slots.push(`${hour}:30`);
  }
  return slots;
};

const UpdateAppointment = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showToast, setShowToast] = useState(false); // ✅ Toast
  const navigate = useNavigate();

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

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleUpdate = () => {
    if (!selectedTime) {
      console.log("No time selected!");
      return;
    }

    const [hour, minute] = selectedTime.split(":");
    const bookingDateTime = new Date(selectedDate);
    bookingDateTime.setHours(Number(hour));
    bookingDateTime.setMinutes(Number(minute));
    bookingDateTime.setSeconds(0);
    bookingDateTime.setMilliseconds(0);

    console.log("Updated Booking ISO Time:", bookingDateTime.toISOString());

    setShowToast(true); // ✅ Show toast

    setTimeout(() => {
      navigate("/myAppointments"); // ✅ Redirect after toast
    }, 1500);
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
        {/* Heading */}
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Update Appointment
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

        {/* Dates */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          {dates.map((date, idx) => (
            <Button
              key={idx}
              onClick={() => handleDateSelect(date)}
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

        {/* Time Slots */}
        <Grid container spacing={2} mt={4}>
          {availableSlots.length > 0 ? (
            availableSlots.map((time, idx) => (
              <Grid item xs={4} sm={3} md={2} key={idx}>
                <Button
                  fullWidth
                  variant={selectedTime === time ? "contained" : "outlined"}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </Button>
              </Grid>
            ))
          ) : (
            <Typography mt={2}>No slots available for today.</Typography>
          )}
        </Grid>

        {/* Update Button */}
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            sx={{ px: 4 }}
            onClick={handleUpdate}
            disabled={!selectedTime}
          >
            Update
          </Button>
        </Box>
      </Box>

      {/* Toast for successful update */}
      <CommonToast
        open={showToast}
        message="Appointment updated successfully!"
        severity="success"
        onClose={() => setShowToast(false)}
      />
    </Box>
  );
};

export default UpdateAppointment;
