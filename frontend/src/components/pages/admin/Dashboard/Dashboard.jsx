import React, { useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Bar, Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { useDispatch, useSelector } from "react-redux";
import { getDashboardData } from "../../../../action/admin/dashboardAction";

const Dashboard = () => {
  const dispatch = useDispatch();

  const { dashboardData, loadingDashboardData, errorDashboardData } =
    useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(getDashboardData());
  }, [dispatch]);

  const stats = dashboardData?.stats || {};
  const bookingsByWeek = stats?.bookingsByWeek || [];
  const statusCounts = stats?.statusCounts || {};
  const recentActivity = stats?.recentActivity || [];

  const chartData = {
    labels: ["S", "M", "T", "W", "T", "F", "S"],
    datasets: [
      {
        data: bookingsByWeek,
        backgroundColor: "rgba(25, 118, 210, 0.7)",
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const statusData = {
    labels: ["Confirmed", "Completed", "Cancelled", "Pending", "Scheduled"],
    datasets: [
      {
        label: "Status",
        data: [
          statusCounts.confirmed || 0,
          statusCounts.completed || 0,
          statusCounts.cancelled || 0,
          statusCounts.pending || 0,
          statusCounts.scheduled || 0,
        ],
        backgroundColor: [
          "rgba(76, 175, 80, 0.7)",
          "rgba(255, 193, 7, 0.7)",
          "rgba(244, 67, 54, 0.7)",
          "rgba(33, 150, 243, 0.7)",
          "rgba(156, 39, 176, 0.7)",
        ],
      },
    ],
  };

  if (loadingDashboardData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (errorDashboardData) {
    return (
      <Box p={3}>
        <Alert severity="error">{errorDashboardData}</Alert>
      </Box>
    );
  }

  return (
    <Box
      p={3}
      display="flex"
      justifyContent="center"
      sx={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}
    >
      <Box width="100%" maxWidth="1280px" minWidth="768px">
        {/* Top Cards */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: "#ffffff" }}>
              <CardContent>
                <Typography variant="subtitle2">Total Bookings</Typography>
                <Typography variant="h5">{stats.bookingCount || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: "#ffffff" }}>
              <CardContent>
                <Typography variant="subtitle2">Active Users</Typography>
                <Typography variant="h5">
                  {stats.activeUserCount || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: "#ffffff" }}>
              <CardContent>
                <Typography variant="subtitle2">Total Revenue</Typography>
                <Typography variant="h5">${stats.totalRevenue || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Chart & Status Summary */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ backgroundColor: "#ffffff" }}>
              <CardContent>
                <Typography variant="subtitle2" mb={2}>
                  Bookings by Week
                </Typography>
                <Bar data={chartData} options={chartOptions} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: "#ffffff" }}>
              <CardContent>
                <Typography variant="subtitle2" mb={2}>
                  Booking Status
                </Typography>
                <Doughnut data={statusData} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity Table */}
        <Card sx={{ backgroundColor: "#ffffff" }}>
          <CardContent>
            <Typography variant="subtitle2" mb={2}>
              Recent Activity
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#e3e3e3" }}>
                    <TableCell>Customer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Rating</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivity.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.customer}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.time}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.rating}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
