// UpcomingAppointments.jsx
import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Pagination,
} from "@mui/material";

const data = [
  {
    client: "John Doe",
    date: "April 25, 2024",
    time: "9:00 AM",
    phone: "0400 123 456",
    request: "Wants to discuss meal plans",
  },
  {
    client: "Jane Smith",
    date: "April 26, 2024",
    time: "11:00 AM",
    phone: "0401 234 567",
    request: "Needs early finish",
  },
];

const UpcomingAppointments = () => {
  const [viewOpen, setViewOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selected, setSelected] = useState(null);

  const handleView = (row) => {
    setSelected(row);
    setViewOpen(true);
  };

  const handleAction = (row, type) => {
    setSelected(row);
    setActionType(type);
    setActionOpen(true);
  };

  const handleClose = () => {
    setViewOpen(false);
    setActionOpen(false);
    setSelected(null);
  };

  return (
    <Box maxWidth="1280px" minWidth="768px" mx="auto">
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#424242" }}>
            <TableRow>
              <TableCell sx={{ color: "#fff" }}>Client</TableCell>
              <TableCell sx={{ color: "#fff" }}>Date</TableCell>
              <TableCell sx={{ color: "#fff" }}>Time</TableCell>
              <TableCell sx={{ color: "#fff" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.client}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.time}</TableCell>
                <TableCell>
                  <Button onClick={() => handleView(row)}>View</Button>
                  <Button
                    color="success"
                    onClick={() => handleAction(row, "Accept")}
                  >
                    Accept
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleAction(row, "Decline")}
                  >
                    Decline
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination count={1} />
      </Box>

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={handleClose}>
        <DialogTitle sx={{ backgroundColor: "#424242", color: "#fff", mb: 1 }}>
          Appointment Details
        </DialogTitle>
        <DialogContent>
          {selected && (
            <>
              <Typography>
                <strong>Client:</strong> {selected.client}
              </Typography>
              <Typography>
                <strong>Date:</strong> {selected.date}
              </Typography>
              <Typography>
                <strong>Time:</strong> {selected.time}
              </Typography>
              <Typography>
                <strong>Phone:</strong> {selected.phone}
              </Typography>
              <Typography>
                <strong>Special Request:</strong> {selected.request}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Action Confirm Dialog */}
      <Dialog open={actionOpen} onClose={handleClose}>
        {actionType === "Decline" ? (
          <DialogTitle
            sx={{ backgroundColor: "#c62828", color: "#fff", mb: 1 }}
          >
            {actionType} Confirmation
          </DialogTitle>
        ) : (
          <DialogTitle
            sx={{ backgroundColor: "#424242", color: "#fff", mb: 1 }}
          >
            {actionType} Confirmation
          </DialogTitle>
        )}
        <DialogContent>
          <Typography>
            Are you sure you want to <strong>{actionType.toLowerCase()}</strong>{" "}
            this appointment with <strong>{selected?.client}</strong> on{" "}
            <strong>{selected?.date}</strong> at{" "}
            <strong>{selected?.time}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleClose}
            color={actionType === "Accept" ? "success" : "error"}
          >
            {actionType}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UpcomingAppointments;
