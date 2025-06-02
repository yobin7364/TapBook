// BookingPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getServiceById } from "../../../../action/admin/serviceSettingAction";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { getMembership } from "../../../../action/customer/membershipAction";

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

// Mock booking data
const bookingData = {
  providerName: "Dr. Emily Carter",
  providerSpecialization: "General Consultation",
  address: "123 Health Street, Wellness City",
  rating: 4.8,
  appointmentDate: "2025-04-27",
  appointmentTime: "15:30",
  serviceCost: 100,
  membershipDiscount: 20,
};

const BookingPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const { service, loadingSingleService } = useSelector(
    (state) => state.service.singleService || {}
  );

  const { currentMembership, loadingMembership } = useSelector(
    (state) => state.membership || {}
  );

  const location = useLocation();
  const serviceCost = location.state?.price;

  const [isPaying, setIsPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const dispatch = useDispatch();

  const [note, setNote] = useState("");
  const navigate = useNavigate();

  const { serviceId } = useParams(); // this grabs the serviceId from the URL

  const [membershipDiscount, setMembershipDiscount] = useState(0);
  const [totalDue, setTotalDue] = useState(0);

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

  useEffect(() => {
    dispatch(getMembership());
    if (serviceId) {
      dispatch(getServiceById({ serviceId }));
    }
  }, [dispatch, serviceId]);

  useEffect(() => {
    if (
      isAuthenticated &&
      currentMembership?.success &&
      new Date(currentMembership?.membership?.expiryDate) > new Date()
    ) {
      const plan = currentMembership.membership.plan;

      let discount = 0;

      if (plan === "yearly") {
        discount = 10; // 10% for yearly
      } else if (plan === "monthly") {
        discount = 5; // 5% for monthly
      }

      setMembershipDiscount(discount);

      if (serviceCost) {
        const calculatedDiscount = (serviceCost * discount) / 100;
        const finalAmount = serviceCost - calculatedDiscount;

        setMembershipDiscount(calculatedDiscount);
        setTotalDue(finalAmount);
      }
    } else {
      // If not authenticated or membership inactive
      setMembershipDiscount(0);
      setTotalDue(serviceCost || 0);
    }
  }, [isAuthenticated, currentMembership, serviceCost]);

  const handlePayment = () => {
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

    setIsPaying(true);

    setTimeout(() => {
      setIsPaying(false);
      setPaymentDone(true);

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }, 2000); // Simulate 2 seconds payment processing
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
        {!loadingSingleService && (
          <>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Book Appointment
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: "primary.main", fontWeight: "bold" }}
            >
              {service?.category?.charAt(0).toUpperCase() +
                service?.category?.slice(1)}
            </Typography>

            <Typography
              variant="subtitle2"
              sx={{ color: "secondary.main", fontWeight: "bold" }}
            >
              {service?.admin?.name.charAt(0).toUpperCase() +
                service?.admin?.name.slice(1)}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Typography sx={{ color: "orange", mr: 1, fontWeight: "bold" }}>
                ⭐ {service?.avgRating}
              </Typography>
              <Typography
                variant="body2"
                color="text.primary"
                fontWeight="bold"
              >
                {service?.address}
              </Typography>
            </Box>
          </>
        )}
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
          <Grid item xs={12} sm={4}>
            <TextField
              label="Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={name !== "" && name.trim() === ""}
              helperText={
                name !== "" && name.trim() === "" ? "Name is required" : ""
              }
              sx={{ maxWidth: "300px" }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
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
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
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

        {/* <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            sx={{ px: 4 }}
            onClick={handleContinue}
            disabled={!selectedTime || !/^\d{10}$/.test(mobile)}
          >
            Continue
          </Button>
        </Box> */}
        <Box sx={{ margin: 10 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography>Service Cost</Typography>
            <Typography>${serviceCost?.toFixed(2)}</Typography>
          </Box>

          {/* Only show Membership Discount if authenticated */}
          {isAuthenticated && membershipDiscount > 0 && (
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>
                Membership Discount
                {currentMembership?.membership?.plan === "yearly" &&
                  " (10% - Yearly Plan)"}
                {currentMembership?.membership?.plan === "monthly" &&
                  " (5% - Monthly Plan)"}
              </Typography>
              <Typography sx={{ color: "green" }}>
                -${membershipDiscount.toFixed(2)}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography fontWeight="bold">Total Due</Typography>
            <Typography fontWeight="bold">${totalDue.toFixed(2)}</Typography>
          </Box>

          {/* Payment Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {!paymentDone ? (
              <>
                <Button
                  variant="contained"
                  sx={{ px: 5, py: 1.2, borderRadius: 2 }}
                  onClick={handlePayment}
                  disabled={
                    isPaying ||
                    !isAuthenticated ||
                    !selectedTime ||
                    !/^\d{10}$/.test(mobile) ||
                    name.trim() === ""
                  }
                >
                  {isPaying ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Make Payment"
                  )}
                </Button>

                {/* Show message if user is not logged in */}
                {!isAuthenticated && (
                  <Typography variant="body2" color="error" mt={2}>
                    Please login to make a payment.
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="h6" color="green" fontWeight="bold">
                Payment Successful! Redirecting...
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BookingPage;
