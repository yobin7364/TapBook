import React, { useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getAppointmentsByStatus } from "../../../../action/admin/manageAppointment";

const CancelledAppointments = () => {
  const dispatch = useDispatch();

  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const {
    appointmentsByStatus: { appointments },
    loadingAppointmentByStatus,
  } = useSelector((state) => state.manageAppointment);

  useEffect(() => {
    dispatch(getAppointmentsByStatus("cancelled"));
  }, [dispatch]);

  const handleView = (row) => {
    setSelected(row);
    setViewOpen(true);
  };

  const handleClose = () => {
    setViewOpen(false);
    setSelected(null);
  };

  return (
    <Box maxWidth="1280px" minWidth="768px" mx="auto">
      {loadingAppointmentByStatus ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#424242" }}>
              <TableRow>
                <TableCell sx={{ color: "#fff" }}>Client</TableCell>
                <TableCell sx={{ color: "#fff" }}>Date</TableCell>
                <TableCell sx={{ color: "#fff" }}>Time</TableCell>
                <TableCell sx={{ color: "#fff" }}>Reason</TableCell>
                <TableCell sx={{ color: "#fff" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No cancelled appointments.
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((row) => {
                  const dateObj = new Date(row.date);
                  const formattedDate = dateObj.toLocaleDateString();
                  const formattedTime = dateObj.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <TableRow key={row.id}>
                      <TableCell>{row.client.name}</TableCell>
                      <TableCell>{formattedDate}</TableCell>
                      <TableCell>{formattedTime}</TableCell>
                      <TableCell>{row.cancelReason || "N/A"}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleView(row)}>View</Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={handleClose}>
        <DialogTitle sx={{ backgroundColor: "#424242", color: "#fff", mb: 1 }}>
          Appointment Details
        </DialogTitle>
        <DialogContent>
          {selected && (
            <>
              <Typography>
                <strong>Client:</strong> {selected.client.name}
              </Typography>
              <Typography>
                <strong>Email:</strong> {selected.client.email}
              </Typography>
              <Typography>
                <strong>Date:</strong>{" "}
                {new Date(selected.date).toLocaleString()}
              </Typography>
              <Typography>
                <strong>Phone:</strong> {selected.client.phone || "N/A"}
              </Typography>
              <Typography>
                <strong>Special Request:</strong>{" "}
                {selected.specialRequest || "None"}
              </Typography>
              <Typography>
                <strong>Cancel Reason:</strong> {selected.cancelReason || "N/A"}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CancelledAppointments;
