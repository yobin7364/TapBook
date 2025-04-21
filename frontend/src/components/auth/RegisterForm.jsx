import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Paper,
  Link,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { registerUser } from "../../action/authAction";
import { useNavigate } from "react-router-dom";
import CommonToast from "../common/CommonToast";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // For navigation

  // Get the loading and error state from Redux
  const { loading, error } = useSelector((state) => state.auth);

  // Set up React Hook Form with default values
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    setError,
  } = useForm({
    defaultValues: {
      role: "user",
    },
  });

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

  const onSubmit = async (data) => {
    try {
      await dispatch(registerUser(data)).unwrap(); // use unwrap if using createAsyncThunk

      showSnackbar("Registration successful!", "success"); // 👈 show Toast first

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      // Handle known validation errors from API

      if (err) {
        if (err.email) {
          setError("email", {
            type: "manual",
            message: err.email,
          });
        }
        if (err.password) {
          setError("password", {
            type: "manual",
            message: err.password,
          });
        }
        if (err.password2) {
          setError("password2", {
            type: "manual",
            message: err.password2,
          });
        }
      } else {
        // Unexpected error (network, server down, etc.)
        console.error("Unexpected error:", err);
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "76vh",
          pb: 2,
        }}
      >
        <Paper
          sx={{
            padding: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            boxShadow: 3,
            borderRadius: 2,
            backgroundColor: "#f9f9f9",
          }}
        >
          <Typography variant="h5" component="h2">
            Register
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 2, width: "100%" }}
          >
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              margin="normal"
              sx={{ backgroundColor: "#ffffff" }}
              {...register("name", { required: "Name is required" })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              type="email"
              sx={{ backgroundColor: "#ffffff" }}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Invalid email address",
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              margin="normal"
              type="password"
              sx={{ backgroundColor: "#ffffff" }}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              variant="outlined"
              margin="normal"
              type="password"
              sx={{ backgroundColor: "#ffffff" }}
              {...register("password2", {
                required: "Confirm Password is required",
                validate: (value) =>
                  value === watch("password") || "Passwords must match",
              })}
              error={!!errors.password2}
              helperText={errors.password2?.message}
            />

            {/* Role selection for user or admin */}
            <FormLabel sx={{ mt: 2 }}>Role</FormLabel>
            <Controller
              name="role"
              control={control}
              defaultValue="user"
              render={({ field }) => (
                <RadioGroup {...field} row>
                  <FormControlLabel
                    value="user"
                    control={<Radio />}
                    label="User"
                  />
                  <FormControlLabel
                    value="admin"
                    control={<Radio />}
                    label="Admin"
                  />
                </RadioGroup>
              )}
            />
            {errors.role && (
              <Alert severity="error">{errors.role?.message}</Alert>
            )}

            {/* Display the loading spinner when the form is submitting */}
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              sx={{ mt: 2 }}
              disabled={loading} // Disable button when loading
            >
              {loading ? (
                <CircularProgress size={24} color="secondary" />
              ) : (
                "Register"
              )}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
            Already have an account?{" "}
            <Link onClick={() => navigate("/login")} sx={{ cursor: "pointer" }}>
              Log in
            </Link>
          </Typography>
        </Paper>
      </Box>

      <CommonToast
        open={openSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleCloseSnackbar}
      />
    </Container>
  );
};

export default Register;
