// BookingPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getServiceById,
  getAvailableSlotsByDate,
} from "../../../../action/admin/serviceSettingAction";
import { getMembership } from "../../../../action/customer/membershipAction";

import { bookAppointment } from "../../../../action/customer/servicesListAction";
import { resetAppointmentState } from "../../../../redux/serviceSlice";
import CommonToast from "../../../common/CommonToast";

const getNext7Days = () => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });
};

const BookingPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [membershipDiscount, setMembershipDiscount] = useState(0);
  const [totalDue, setTotalDue] = useState(0);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const {
    // availableSlots: slotsFromAPI,
    // loadingAvailableSlots,
    appointment,
    loadingAppointment,
  } = useSelector((state) => state.service);
  const { service, loadingSingleService } = useSelector(
    (state) => state.service.singleService || {}
  );
  const { currentMembership } = useSelector((state) => state.membership || {});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const location = useLocation();
  const serviceCost = location.state?.price;

  const dates = getNext7Days();

  useEffect(() => {
    dispatch(getMembership());
    if (serviceId) {
      dispatch(getServiceById({ serviceId }));
      dispatch(
        getAvailableSlotsByDate({
          serviceId,
          date: selectedDate.toLocaleDateString("en-CA"),
        })
      ).then((res) => {
        const slotsWithFormattedTime = res.payload.slots.map((slot) => {
          const utcDate = new Date(slot.start);
          const time = utcDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
          return {
            time,
            available: slot.available,
          };
        });

        setAvailableSlots(slotsWithFormattedTime);
      });
    }
  }, [dispatch, serviceId, selectedDate]);

  useEffect(() => {
    if (
      isAuthenticated &&
      currentMembership?.success &&
      new Date(currentMembership?.membership?.expiryDate) > new Date()
    ) {
      const plan = currentMembership.membership.plan;
      const discount = plan === "yearly" ? 10 : plan === "monthly" ? 5 : 0;
      const calculatedDiscount = (serviceCost * discount) / 100;
      setMembershipDiscount(calculatedDiscount);
      setTotalDue(serviceCost - calculatedDiscount);
    } else {
      setMembershipDiscount(0);
      setTotalDue(serviceCost || 0);
    }
  }, [isAuthenticated, currentMembership, serviceCost]);

 const handlePayment = () => {
   if (!selectedTime || !/^[0-9]{10}$/.test(mobile)) return

   // 1) Parse “9:00 AM” / “12:30 PM” into (hour, minute) in 24h
   const [timeString, period] = selectedTime.split(' ') // e.g. ["12:00","PM"]
   let [hour, minute] = timeString.split(':').map(Number)
   if (period === 'PM' && hour !== 12) hour += 12
   if (period === 'AM' && hour === 12) hour = 0

   // 2) Build a Date in the LOCAL timezone (e.g. Sydney)
   const bookingDateTime = new Date(selectedDate)
   bookingDateTime.setHours(hour, minute, 0, 0)
   // Now bookingDateTime is e.g. 2025-06-04T12:00:00+10:00 (internally)

   // 3) Convert that local Date → TRUE UTC ISO string
   function toUTCISOString(dateObj) {
     const year = dateObj.getUTCFullYear()
     const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
     const day = String(dateObj.getUTCDate()).padStart(2, '0')
     const hours = String(dateObj.getUTCHours()).padStart(2, '0')
     const mins = String(dateObj.getUTCMinutes()).padStart(2, '0')
     const secs = String(dateObj.getUTCSeconds()).padStart(2, '0')
     return `${year}-${month}-${day}T${hours}:${mins}:${secs}.000Z`
   }

   const finalDateString = toUTCISOString(bookingDateTime)
   // e.g. if bookingDateTime was “2025-06-04T12:00:00+10:00”,
   // finalDateString becomes “2025-06-04T02:00:00.000Z”

   const appointmentData = {
     service: serviceId,
     start: finalDateString,
     name: name,
     mobile: mobile,
     note: note || '',
   }

   dispatch(bookAppointment(appointmentData))
 }

  useEffect(() => {
    if (appointment?.success) {
      dispatch(resetAppointmentState());

      setToastMessage("Payment Successful!");
      setToastSeverity("success");
      setShowToast(true);

      setTimeout(() => navigate("/"), 2000);
    }
  }, [appointment, navigate]);

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
            <Typography variant="h5" fontWeight="bold">
              Book Appointment
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: "primary.main", fontWeight: "bold" }}
            >
              {service?.category}
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ color: "secondary.main", fontWeight: "bold" }}
            >
              {service?.admin?.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Typography sx={{ color: "orange", mr: 1, fontWeight: "bold" }}>
                ⭐ {service?.avgRating}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {service?.address}
              </Typography>
            </Box>
          </>
        )}

        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
          {dates.map((date, idx) => (
            <Button
              key={idx}
              onClick={() => {
                setSelectedTime("");
                setSelectedDate(date);
              }}
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

        <Grid container spacing={2} mt={4}>
          {availableSlots.length > 0 ? (
            availableSlots.map((eachSlot, idx) => (
              <Grid item xs={4} sm={3} md={2} key={idx}>
                <Button
                  fullWidth
                  disabled={!eachSlot?.available}
                  variant={
                    selectedTime === eachSlot?.time ? "contained" : "outlined"
                  }
                  onClick={() => setSelectedTime(eachSlot?.time)}
                >
                  {eachSlot?.time}
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
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Mobile Number"
              fullWidth
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              error={mobile !== "" && !/^[0-9]{10}$/.test(mobile)}
              helperText={
                mobile !== "" && !/^[0-9]{10}$/.test(mobile)
                  ? "Enter valid 10-digit number"
                  : ""
              }
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Note (optional)"
              fullWidth
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Grid>
        </Grid>

        <Box mt={4}>
          <Typography>Total Cost: ${serviceCost}</Typography>
          <Typography>Membership Discount: ${membershipDiscount}</Typography>
          <Typography variant="h6">Amount Due: ${totalDue}</Typography>
        </Box>

        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePayment}
            disabled={
              loadingAppointment ||
              appointment?.success ||
              !selectedTime ||
              !name.trim() ||
              !/^[0-9]{10}$/.test(mobile)
            }
          >
            {loadingAppointment ? (
              <CircularProgress size={24} color="inherit" />
            ) : appointment?.success ? (
              "Payment Successful"
            ) : (
              "Proceed to Pay"
            )}
          </Button>
        </Box>
      </Box>
      {/* Toast Notifications */}
      <CommonToast
        open={showToast}
        message={toastMessage}
        severity={toastSeverity}
        onClose={() => setShowToast(false)}
      />
    </Box>
  );
};

export default BookingPage;
