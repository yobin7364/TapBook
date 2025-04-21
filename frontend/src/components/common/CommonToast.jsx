// src/components/Toast.js
import React from "react";
import { Snackbar, Alert } from "@mui/material";

const CommonToast = ({ open, message, severity = "success", onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CommonToast;
