import React, { useState } from "react";
import { Box, Typography, Divider, Grid, Pagination } from "@mui/material";

const Notifications = () => {
  // Mock notifications
  const notifications = [
    {
      id: 1,
      service: "Therapy Session",
      date: "2025-04-30",
      time: "09:00",
      status: "Upcoming",
    },
    {
      id: 2,
      service: "Therapy Session",
      date: "2025-05-03",
      time: "11:00",
      status: "Upcoming",
    },
    {
      id: 3,
      service: "Therapy Session",
      date: "2025-05-06",
      time: "14:00",
      status: "Upcoming",
    },
    {
      id: 4,
      service: "Dental Cleaning",
      date: "2025-05-10",
      time: "10:00",
      status: "Upcoming",
    },
    {
      id: 5,
      service: "Yoga Class",
      date: "2025-05-11",
      time: "08:00",
      status: "Upcoming",
    },
    {
      id: 6,
      service: "Nutrition Consultation",
      date: "2025-05-12",
      time: "13:00",
      status: "Upcoming",
    },
    {
      id: 7,
      service: "Physiotherapy",
      date: "2025-05-15",
      time: "09:30",
      status: "Upcoming",
    },
  ];

  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const startIndex = (page - 1) * itemsPerPage;
  const paginatedNotifications = notifications.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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

        {/* Notifications List */}
        <Grid container spacing={2}>
          {paginatedNotifications.map((notif) => (
            <Grid item xs={12} key={notif.id}>
              <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
                <Typography fontWeight="bold">{notif.service}</Typography>
                <Typography color="text.secondary">
                  {new Date(`${notif.date}T${notif.time}`).toLocaleString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }
                  )}
                </Typography>
                <Typography color="primary" fontWeight="bold" mt={1}>
                  {notif.status}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        {notifications.length > itemsPerPage && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={Math.ceil(notifications.length / itemsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Notifications;
