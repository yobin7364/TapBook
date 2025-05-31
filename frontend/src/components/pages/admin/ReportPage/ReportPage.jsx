import React, { useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { getExportAppointments } from "../../../../action/admin/dashboardAction";

const ReportPage = () => {
  const dispatch = useDispatch();

  const {
    exportedAppointments: { report },
    loadingExportedAppointment,
    errorExportedAppointments,
  } = useSelector((state) => state.dashboard);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState("all");

  const handleGenerate = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const from = dayjs(startDate).format("YYYY-MM-DD");
    const to = dayjs(endDate).format("YYYY-MM-DD");

    dispatch(getExportAppointments({ from, to, status }));
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Appointment Report", 14, 20);

    const tableColumn = [
      "Appointment ID",
      "Customer",
      "Email",
      "Service",
      "Amount",
      "Status",
      "Booked At",
      "Scheduled At",
    ];

    const tableRows = report?.map((item) => [
      item.AppointmentID,
      item.CustomerName,
      item.CustomerEmail,
      item.ServiceTitle,
      `$${item.PaymentAmount.toFixed(2)}`,
      item.Status,
      dayjs(item.BookedAt).format("YYYY-MM-DD HH:mm"),
      dayjs(item.ScheduledAt).format("YYYY-MM-DD HH:mm"),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      headStyles: { fillColor: [44, 44, 44], textColor: 255 },
    });

    doc.save("appointment_report.pdf");
  };

  const handleEndDateChange = (newValue) => {
    if (startDate && newValue && dayjs(newValue).isBefore(dayjs(startDate))) {
      alert("End date cannot be before start date");
      return;
    }
    setEndDate(newValue);
  };

  return (
    <Box p={4} maxWidth="1200px" minWidth="600px" mx="auto">
      <h2>Generate Report</h2>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box display="flex" flexWrap="wrap" gap={2} mb={3} alignItems="center">
          <DatePicker
            label="From"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => (
              <TextField {...params} sx={{ minWidth: 200 }} />
            )}
          />
          <DatePicker
            label="To"
            value={endDate}
            onChange={handleEndDateChange}
            renderInput={(params) => (
              <TextField {...params} sx={{ minWidth: 200 }} />
            )}
          />
          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerate}
            disabled={
              loadingExportedAppointment || !startDate || !endDate || !status
            }
          >
            Generate
          </Button>
        </Box>
      </LocalizationProvider>

      {errorExportedAppointments && (
        <p style={{ color: "red" }}>{errorExportedAppointments}</p>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#2c2c2c" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>
                <strong>ID</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Name</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Email</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Service</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Amount</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Status</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Booked</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Scheduled</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report?.map((row) => (
              <TableRow key={row.AppointmentID}>
                <TableCell>{row.AppointmentID}</TableCell>
                <TableCell>{row.CustomerName}</TableCell>
                <TableCell>{row.CustomerEmail}</TableCell>
                <TableCell>{row.ServiceTitle}</TableCell>
                <TableCell>${row.PaymentAmount.toFixed(2)}</TableCell>
                <TableCell>{row.Status}</TableCell>
                <TableCell>
                  {dayjs(row.BookedAt).format("YYYY-MM-DD HH:mm")}
                </TableCell>
                <TableCell>
                  {dayjs(row.ScheduledAt).format("YYYY-MM-DD HH:mm")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {report?.length > 0 && (
        <Box mt={3}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ReportPage;
