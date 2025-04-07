import React from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Link,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../action/authAction"; // your login thunk
// import { setError } from "../../slice/authSlice"; // optional: clear or set errors

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    control,
    setError: setFieldError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: "user",
    },
  });

  const onSubmit = async (data) => {
    try {
      // Attempt to login and unwrap the result (this will throw an error if rejected)
      await dispatch(loginUser(data)).unwrap();

      // Navigate to dashboard if login is successful
      //navigate("/dashboard");
    } catch (err) {
      // Handle known validation errors from API (i.e., errors returned from your API)
      if (err) {
        if (err.email) {
          setFieldError("email", {
            type: "manual",
            message: err.email,
          });
        }
        if (err.password) {
          setFieldError("password", {
            type: "manual",
            message: err.password,
          });
        }
      } else {
        // Unexpected error (network issues, server issues, etc.)
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
            backgroundColor: "#f9f9f9", // off-white
          }}
        >
          <Typography variant="h5" component="h2">
            Login
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 2, width: "100%" }}
          >
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Invalid email format",
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
              {...register("password", {
                required: "Password is required",
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            {/* Role selection */}
            <FormLabel sx={{ mt: 2 }}>Role</FormLabel>
            <Controller
              name="role"
              control={control}
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
              <Alert severity="error">{errors.role.message}</Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "#fff" }} />
              ) : (
                "Login"
              )}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
            Don’t have an account?{" "}
            <Link
              href="#"
              onClick={() => navigate("/registerForm")}
              sx={{ cursor: "pointer", fontWeight: 500 }}
            >
              Register here
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
