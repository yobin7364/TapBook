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

const ConfirmedAppointments = () => {
  const dispatch = useDispatch();

  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const {
    appointmentsByStatus: { appointments },
    loadingAppointmentByStatus,
  } = useSelector((state) => state.manageAppointment);

  // Auto-fetch confirmed appointments on mount
  useEffect(() => {
    dispatch(getAppointmentsByStatus("confirmed"));
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
                <TableCell sx={{ color: "#fff" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No confirmed appointments.
                  </TableCell>
                </TableRow>
              ) : (
                appointments?.map((row) => {
                  const localDate = new Date(row.date);
                  const formattedDate = localDate.toLocaleDateString();
                  const formattedTime = localDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <TableRow key={row.id}>
                      <TableCell>{row.client.name}</TableCell>
                      <TableCell>{formattedDate}</TableCell>
                      <TableCell>{formattedTime}</TableCell>
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
                <strong>Service:</strong> {selected.service.serviceName}
              </Typography>
              <Typography>
                <strong>Date:</strong>{" "}
                {new Date(selected.date).toLocaleString()}
              </Typography>
              <Typography>
                <strong>Status:</strong> {selected.status}
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

export default ConfirmedAppointments;
