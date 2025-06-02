import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import CommonToast from "../../../common/CommonToast";
import { useDispatch, useSelector } from "react-redux";
import {
  getMembership,
  cancelMembership,
  subscribeMembership,
} from "../../../../action/customer/membershipAction";
import { resetMembershipStatus } from "../../../../redux/membershipSlice";

const Membership = () => {
  const dispatch = useDispatch();
  const [membership, setMembership] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");

  const {
    currentMembership,
    loadingMembership,
    subscribing,
    subscriptionSuccess,
    canceling,
    cancelSuccess,
    cancelError,
  } = useSelector((state) => state?.membership);

  // Fetch membership on mount
  useEffect(() => {
    dispatch(getMembership());
  }, [dispatch]);

  // Update local membership state
  useEffect(() => {
    if (currentMembership?.membership?.plan === "none") {
      setMembership(null);
    } else {
      const planType = currentMembership?.membership?.plan;
      const expiryDate = currentMembership?.membership?.expiryDate;
      const discount = planType === "yearly" ? 10 : 5;
      const cancelled = currentMembership?.membership?.cancelled;

      setMembership({
        type: planType
          ? planType.charAt(0).toUpperCase() + planType.slice(1)
          : null,
        discount,
        expiryDate,
        cancelled,
      });
    }
  }, [currentMembership]);

  // Success message for subscription
  useEffect(() => {
    if (subscriptionSuccess) {
      setToastMessage("Membership subscribed successfully!");
      setToastSeverity("success");
      setShowToast(true);
    }
  }, [subscriptionSuccess]);

  // Success message for cancellation
  useEffect(() => {
    if (cancelSuccess) {
      setShowCancelDialog(false);
      setToastMessage("Membership cancelled successfully!");
      setToastSeverity("success");
      setShowToast(true);
      // Reset the cancelSuccess flag to avoid it being true on page revisit
      dispatch(resetMembershipStatus());
      dispatch(getMembership());
    }
  }, [cancelSuccess, dispatch]);

  // Error message for cancellation
  useEffect(() => {
    if (cancelError) {
      setToastMessage("Failed to cancel membership. Try again.");
      setToastSeverity("error");
      setShowToast(true);
    }
  }, [cancelError]);

  // Buy plan handler
  const handleBuyMembership = (plan) => {
    dispatch(subscribeMembership({ plan: plan.toLowerCase() }))
      .unwrap()
      .then(() => {
        dispatch(getMembership());
        setToastMessage(`Membership (${plan}) purchased successfully!`);
        setToastSeverity("success");
        setShowToast(true);
      })
      .catch(() => {
        setToastMessage("Failed to subscribe. Please try again.");
        setToastSeverity("error");
        setShowToast(true);
      });
  };

  // Cancel handler
  const handleCancelMembership = () => {
    dispatch(cancelMembership());
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
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
          Membership Subscription
        </Typography>

        {!loadingMembership &&
        currentMembership?.membership?.plan === "none" ? (
          <Grid container spacing={3} mt={2}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: 3,
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Yearly Plan
                  </Typography>
                  <ul style={{ marginTop: "8px" }}>
                    <li>10% discount on each booking</li>
                  </ul>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleBuyMembership("Yearly")}
                >
                  Buy Yearly Plan
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: 3,
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Monthly Plan
                  </Typography>
                  <ul style={{ marginTop: "8px" }}>
                    <li>5% discount on each booking</li>
                  </ul>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleBuyMembership("Monthly")}
                >
                  Buy Monthly Plan
                </Button>
              </Box>
            </Grid>
          </Grid>
        ) : (
          membership && (
            <Box mt={4}>
              <Typography variant="h6" fontWeight="bold">
                Current Membership
              </Typography>
              {currentMembership?.membership?.cancelled && (
                <Typography
                  variant="body2"
                  color="error"
                  fontStyle="italic"
                  gutterBottom
                >
                  Auto-renewal has been cancelled. Your membership will expire
                  at the end of the current period.
                </Typography>
              )}
              <Typography mt={2}>
                <strong>Type:</strong> {membership?.type} Plan
              </Typography>
              <Typography>
                <strong>Discount:</strong> {membership?.discount}% off
              </Typography>
              <Typography>
                <strong>Expiry Date:</strong>{" "}
                {formatDate(membership?.expiryDate)}
              </Typography>

              {!currentMembership?.membership?.cancelled && (
                <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    Cancel Membership
                  </Button>
                </Box>
              )}
            </Box>
          )
        )}

        {/* Cancel Confirmation Dialog */}
        <Dialog
          open={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
        >
          <DialogTitle sx={{ bgcolor: "red", color: "white" }}>
            Cancel Membership
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography>
              Are you sure you want to cancel your membership? You will lose
              benefits like discounts.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCancelDialog(false)}>No</Button>
            <Button onClick={handleCancelMembership} color="error">
              Yes, Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Toast Notifications */}
        <CommonToast
          open={showToast}
          message={toastMessage}
          severity={toastSeverity}
          onClose={() => setShowToast(false)}
        />

        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={subscribing || canceling}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Box>
    </Box>
  );
};

export default Membership;
