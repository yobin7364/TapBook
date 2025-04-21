import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Box, Card, Typography, TextField, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CommonToast from "../../../common/CommonToast";

const ChangePasswordPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  // For snack bar Start

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // For snack Bar end

  const onSubmit = (data) => {
    console.log(data);
    showSnackbar("Review submitted successfully!", "success");
    // Dispatch change password action here
  };

  return (
    <Box
      sx={{
        minHeight: "74vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        bgcolor: "#f5f5f5",
        pt: 10,
        px: 2,
      }}
    >
      <Card sx={{ width: 400, p: 4, boxShadow: 3 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          textAlign="center"
          mb={4} // 👈 margin bottom from heading to inputs
        >
          Change Password
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {" "}
            {/* 👈 spacing between fields */}
            <TextField
              label="Current Password"
              type="password"
              {...register("currentPassword", {
                required: "Current Password is required",
              })}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword?.message}
            />
            <TextField
              label="New Password"
              type="password"
              {...register("newPassword", {
                required: "New Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
            />
            <TextField
              label="Confirm Password"
              type="password"
              {...register("confirmPassword", {
                validate: (value) =>
                  value === watch("newPassword") || "Passwords do not match",
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
            <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
              <Button
                variant="outlined"
                type="button"
                onClick={() => navigate("/profilePage")}
              >
                Cancel
              </Button>
              <Button variant="contained" type="submit">
                Save Changes
              </Button>
            </Stack>
          </Stack>
        </form>
      </Card>
      <CommonToast
        open={openSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleCloseSnackbar}
      />
    </Box>
  );
};

export default ChangePasswordPage;
