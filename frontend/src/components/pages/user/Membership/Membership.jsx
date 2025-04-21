import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import CommonToast from "../../../common/CommonToast";

const Membership = () => {
  const [membership, setMembership] = useState(null); // No membership initially
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleBuyMembership = (plan) => {
    const today = new Date();
    const expiryDate = new Date();
    if (plan === "Yearly") {
      expiryDate.setFullYear(today.getFullYear() + 1);
    } else {
      expiryDate.setMonth(today.getMonth() + 1);
    }

    setMembership({
      type: plan,
      discount: plan === "Yearly" ? 10 : 5, // 10% discount for Yearly, 5% for Monthly
      expiryDate: expiryDate.toISOString().split("T")[0],
    });

    setToastMessage(`Membership (${plan}) purchased successfully!`);
    setShowToast(true);
  };

  const handleRenewMembership = () => {
    if (!membership) return;

    const today = new Date();
    const newExpiryDate = new Date();

    if (membership.type === "Yearly") {
      newExpiryDate.setFullYear(today.getFullYear() + 1);
    } else {
      newExpiryDate.setMonth(today.getMonth() + 1);
    }

    setMembership({
      ...membership,
      expiryDate: newExpiryDate.toISOString().split("T")[0],
    });

    setToastMessage(`Membership renewed successfully!`);
    setShowToast(true);
  };

  const handleCancelMembership = () => {
    setMembership(null);
    setShowCancelDialog(false);
    setToastMessage("Membership cancelled successfully!");
    setShowToast(true);
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

        {/* If no membership */}
        {!membership ? (
          <Grid container spacing={3} mt={2}>
            {/* Yearly Plan */}
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
                  <Typography variant="subtitle1" color="text.secondary">
                    $120 per year
                  </Typography>
                  <ul style={{ marginTop: "8px" }}>
                    <li>Priority booking</li>
                    <li>10% discount</li>
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

            {/* Monthly Plan */}
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
                  <Typography variant="subtitle1" color="text.secondary">
                    $12 per month
                  </Typography>
                  <ul style={{ marginTop: "8px" }}>
                    <li>Priority booking</li>
                    <li>5% discount</li>
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
          // If user has membership
          <Box mt={4}>
            <Typography variant="h6" fontWeight="bold">
              Current Membership
            </Typography>
            <Typography mt={2}>
              <strong>Type:</strong> {membership.type} Plan
            </Typography>
            <Typography>
              <strong>Discount:</strong> {membership.discount}% off
            </Typography>
            <Typography>
              <strong>Expiry Date:</strong> {formatDate(membership.expiryDate)}
            </Typography>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
              <Button variant="contained" onClick={handleRenewMembership}>
                Renew Membership
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setShowCancelDialog(true)}
              >
                Cancel Membership
              </Button>
            </Box>
          </Box>
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
              benefits like discounts and priority booking.
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
          severity="success"
          onClose={() => setShowToast(false)}
        />
      </Box>
    </Box>
  );
};

export default Membership;
