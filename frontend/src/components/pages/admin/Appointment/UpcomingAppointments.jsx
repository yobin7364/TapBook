import React, { useEffect, useState } from "react";
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
import {
  getAppointmentsByStatus,
  updateAppointmentStatus,
} from "../../../../action/admin/manageAppointment";

const UpcomingAppointments = () => {
  const dispatch = useDispatch();

  const [viewOpen, setViewOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selected, setSelected] = useState(null);
  const [cancelNote, setCancelNote] = useState("");

  const {
    appointmentsByStatus: { appointments },
    loadingAppointmentByStatus,
    loadingUpdateAppointment,
  } = useSelector((state) => state.manageAppointment);

  useEffect(() => {
    dispatch(getAppointmentsByStatus("pending"));
  }, [dispatch]);

  const handleView = (row) => {
    setSelected(row);
    setViewOpen(true);
  };

  const handleAction = (row, type) => {
    setSelected(row);
    setActionType(type);
    setCancelNote(""); // Reset on open
    setActionOpen(true);
  };

  const handleConfirmAction = async () => {
    let payload;

    if (actionType === "Accept") {
      payload = {
        appointmentId: selected.id,
        newStatus: {
          status: "confirmed",
        },
      };
    } else {
      payload = {
        appointmentId: selected.id,
        newStatus: {
          status: "cancelled",
          cancelNote: cancelNote || "No note provided",
        },
      };
    }

    await dispatch(updateAppointmentStatus(payload));
    setActionOpen(false);
    setSelected(null);
    setCancelNote("");
    dispatch(getAppointmentsByStatus("pending"));
  };

  const handleClose = () => {
    setViewOpen(false);
    setActionOpen(false);
    setSelected(null);
    setCancelNote("");
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
                    No upcoming appointments.
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
              {/* <Typography>
                <strong>Category:</strong> {selected.service.category}
              </Typography> */}
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

      {/* Action Confirm Dialog */}
      <Dialog open={actionOpen} onClose={handleClose}>
        <DialogTitle
          sx={{
            backgroundColor: actionType === "Decline" ? "#c62828" : "#424242",
            color: "#fff",
            mb: 1,
          }}
        >
          {actionType} Confirmation
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to <strong>{actionType.toLowerCase()}</strong>{" "}
            this appointment with <strong>{selected?.client.name}</strong> on{" "}
            <strong>{new Date(selected?.date).toLocaleDateString()}</strong> at{" "}
            <strong>
              {new Date(selected?.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </strong>
            ?
          </Typography>

          {actionType === "Decline" && (
            <Box mt={2}>
              <Typography mb={1}>Cancellation Note</Typography>
              <textarea
                style={{
                  width: "100%",
                  minHeight: "80px",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
                placeholder="Reason for cancellation"
                value={cancelNote}
                onChange={(e) => setCancelNote(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            disabled={loadingUpdateAppointment}
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
