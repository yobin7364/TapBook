import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Grid,
  Pagination,
  CircularProgress,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getUserNotification } from "../../../../action/customer/appointmentAction";

const Notifications = () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const limit = 5;

  const { loadingNotification, notification, errorNotification } = useSelector(
    (state) => state.userAppointment
  );

  useEffect(() => {
    dispatch(getUserNotification({ page, limit }));
  }, [dispatch, page]);

  const notifications = notification?.notifications || [];
  const pagination = notification?.pagination || {};

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
        {/* Title */}
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Notifications
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {loadingNotification ? (
          <Box display="flex" justifyContent="center" mt={5}>
            <CircularProgress />
          </Box>
        ) : errorNotification ? (
          <Typography color="error">{errorNotification}</Typography>
        ) : (
          <>
            {/* Notifications List */}
            <Grid container spacing={2}>
              {notifications.map((notif) => (
                <Grid item xs={12} key={notif.id}>
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid #ccc",
                      borderRadius: 2,
                      backgroundColor: notif.read ? "#fff" : "#f1faff",
                    }}
                  >
                    <Typography fontWeight="bold">{notif.message}</Typography>
                    <Typography color="text.secondary" mt={1}>
                      Service Provider: <strong>{notif.adminName}</strong>
                    </Typography>
                    <Typography color="text.secondary">
                      Category: <strong>{notif.category}</strong>
                    </Typography>
                    <Typography color="text.secondary" mt={1}>
                      {new Date(notif.date).toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={pagination.pages}
                  page={pagination.page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Notifications;
