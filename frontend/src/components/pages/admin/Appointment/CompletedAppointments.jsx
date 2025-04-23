// CompletedAppointments.jsx
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
    client: "Ava Wilson",
    date: "April 20, 2024",
    time: "3:00 PM",
    phone: "0404 321 654",
    request: "N/A",
    rating: "5★",
  },
  {
    client: "Noah Harris",
    date: "April 21, 2024",
    time: "4:30 PM",
    phone: "0405 432 765",
    request: "Bring documents",
    rating: "4★",
  },
];

const CompletedAppointments = () => {
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState(null);

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
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#424242" }}>
            <TableRow>
              <TableCell sx={{ color: "#fff" }}>Client</TableCell>
              <TableCell sx={{ color: "#fff" }}>Date</TableCell>
              <TableCell sx={{ color: "#fff" }}>Time</TableCell>
              <TableCell sx={{ color: "#fff" }}>Rating</TableCell>
              <TableCell sx={{ color: "#fff" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.client}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.time}</TableCell>
                <TableCell>{row.rating}</TableCell>
                <TableCell>
                  <Button onClick={() => handleView(row)}>View</Button>
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
              <Typography>
                <strong>Rating:</strong> {selected.rating}
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

export default CompletedAppointments;
