// Required dependencies
import React from "react";
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
} from "@mui/material";
import { Bar, Doughnut } from "react-chartjs-2";
import "chart.js/auto";

const Dashboard = () => {
  // Mock data
  const bookingStats = [80, 60, 90, 120, 140, 100, 160];
  const recentActivities = [
    {
      name: "Jacob Williams",
      date: "April 22, 2024",
      time: "10:00 AM",
      status: "Confirmed",
      rating: "4.5★",
    },
    {
      name: "Emma Johnson",
      date: "April 21, 2024",
      time: "2:00 PM",
      status: "Completed",
      rating: "5★",
    },
    {
      name: "Olivia Brown",
      date: "April 20, 2024",
      time: "11:00 AM",
      status: "Scheduled",
      rating: "-",
    },
    {
      name: "Daniel Lee",
      date: "April 20, 2024",
      time: "1:30 PM",
      status: "Cancelled",
      rating: "-",
    },
  ];

  const chartData = {
    labels: ["S", "M", "T", "W", "T", "F", "S"],
    datasets: [
      {
        data: bookingStats,
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
    labels: ["Confirmed", "Completed", "Cancelled"],
    datasets: [
      {
        label: "Status",
        data: [820, 240, 180],
        backgroundColor: [
          "rgba(76, 175, 80, 0.7)",
          "rgba(255, 193, 7, 0.7)",
          "rgba(244, 67, 54, 0.7)",
        ],
      },
    ],
  };

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
                <Typography variant="h5">1240</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: "#ffffff" }}>
              <CardContent>
                <Typography variant="subtitle2">Active Users</Typography>
                <Typography variant="h5">350</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: "#ffffff" }}>
              <CardContent>
                <Typography variant="subtitle2">Total Revenue</Typography>
                <Typography variant="h5">$65,400</Typography>
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
                  {recentActivities.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.name}</TableCell>
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
