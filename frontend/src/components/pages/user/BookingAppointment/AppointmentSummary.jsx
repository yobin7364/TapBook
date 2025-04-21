import React, { useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // Using Redux to check authentication

const AppointmentSummary = () => {
  const navigate = useNavigate();
  const [isPaying, setIsPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

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

  const {
    providerName,
    providerSpecialization,
    address,
    rating,
    appointmentDate,
    appointmentTime,
    serviceCost,
    membershipDiscount,
  } = bookingData;

  // Only apply discount if authenticated
  const discountToApply = isAuthenticated ? membershipDiscount : 0;
  const totalDue = (serviceCost || 0) - discountToApply;

  const fullDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
  const formattedDateTime = fullDateTime.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const handlePayment = () => {
    setIsPaying(true);

    setTimeout(() => {
      setIsPaying(false);
      setPaymentDone(true);
      console.log("Payment Done. Amount Paid: $", totalDue.toFixed(2));

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
        minHeight: "100%",
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
          Appointment Summary
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" color="text.primary" fontWeight="bold">
          {providerSpecialization}
        </Typography>

        <Typography variant="subtitle1" color="text.primary" fontWeight="bold">
          {providerName}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
          <Typography sx={{ color: "orange", mr: 1, fontWeight: "bold" }}>
            ⭐ {rating}
          </Typography>
          <Typography variant="body2" color="text.primary" fontWeight="bold">
            {address}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" color="text.primary" gutterBottom>
          {formattedDateTime}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography>Service Cost</Typography>
          <Typography>${serviceCost.toFixed(2)}</Typography>
        </Box>

        {/* Only show Membership Discount if authenticated */}
        {isAuthenticated && membershipDiscount > 0 && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography>Membership Discount</Typography>
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
                disabled={isPaying || !isAuthenticated}
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
  );
};

export default AppointmentSummary;
