import React from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { currentUserInfo } from "../../../../action/authAction";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const {
    loading,
    error,
    currentUserInfo: currentUserData,
  } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(currentUserInfo());
  }, [dispatch]);

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "74vh",
          display: "flex",
          flexDirection: "column", //  vertical stacking
          alignItems: "center", // center horizontally
          justifyContent: "flex-start", // start from top
          bgcolor: "#f5f5f5", // light background
          paddingTop: 10,
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "74vh",
        display: "flex",
        flexDirection: "column", //  vertical stacking
        alignItems: "center", // center horizontally
        justifyContent: "flex-start", // start from top
        bgcolor: "#f5f5f5", // light background
        paddingTop: 10,
      }}
    >
      {loading ? (
        <CircularProgress />
      ) : (
        <Card sx={{ width: 360, p: 3, boxShadow: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar
              sx={{
                width: 96,
                height: 96,
                bgcolor: "primary.main",
                mb: 2,
                fontSize: 40, // make letter bigger
                textTransform: "uppercase", // force capital letter
              }}
            >
              {currentUserData?.name?.charAt(0)}
            </Avatar>

            <Typography variant="h5" fontWeight="bold" mb={0.5}>
              {currentUserData?.name}
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={3}>
              {currentUserData?.email}
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate("/changePassword")}
              >
                Change Password
              </Button>
            </Stack>
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default ProfilePage;
