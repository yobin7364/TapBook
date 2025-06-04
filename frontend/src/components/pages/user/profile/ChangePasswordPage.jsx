import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Stack,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { changeUserPassword } from "../../../../action/admin/dashboardAction";
import CommonToast from "../../../common/CommonToast";

const ChangePasswordPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const showToast = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await dispatch(
        changeUserPassword({
          oldPassword: data.currentPassword,
          newPassword: data.newPassword,
        })
      ).unwrap();

      showToast("Password changed successfully!", "success");
      navigate("/profilePage");
    } catch (err) {
      if (typeof err === "object") {
        if (err.oldPassword) {
          setError("currentPassword", {
            type: "server",
            message: err.oldPassword,
          });
        }
        if (err.newPassword) {
          setError("newPassword", {
            type: "server",
            message: err.newPassword,
          });
        }
        if (err.confirmNewPassword) {
          setError("confirmPassword", {
            type: "server",
            message: err.confirmNewPassword,
          });
        }
      } else {
        showToast("Something went wrong", "error");
      }
    } finally {
      setLoading(false);
    }
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
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={4}>
          Change Password
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
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

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

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
