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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

const mockData = [
  { id: "#BK00123", customer: "John Doe", date: "2025-04-26", payment: 80 },
  { id: "#BK00124", customer: "Jane Smith", date: "2025-04-26", payment: 120 },
  { id: "#BK00125", customer: "Alex Chan", date: "2025-04-27", payment: 50 },
];

const ReportPage = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const filteredData = mockData.filter((item) => {
    if (!startDate || !endDate) return true;
    const bookingDate = dayjs(item.date);
    return (
      bookingDate.isAfter(startDate.subtract(1, "day")) &&
      bookingDate.isBefore(endDate.add(1, "day"))
    );
  });

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Booking Report", 14, 20);

    const tableColumn = [
      "Booking ID",
      "Customer Name",
      "Booking Date",
      "Payment Amount",
    ];
    const tableRows = [];

    filteredData.forEach((item) => {
      const rowData = [
        item.id,
        item.customer,
        item.date,
        `$${item.payment.toFixed(2)}`,
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      headStyles: { fillColor: [44, 44, 44], textColor: 255 }, // Dark header, white text
    });

    doc.save("booking_report.pdf");
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
        <Box display="flex" gap={2} mb={3}>
          <DatePicker
            label="From"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => <TextField {...params} />}
          />
          <DatePicker
            label="To"
            value={endDate}
            onChange={handleEndDateChange}
            renderInput={(params) => <TextField {...params} />}
          />
        </Box>
      </LocalizationProvider>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#2c2c2c" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>
                <strong>Booking ID</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Customer Name</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Booking Date</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Payment Amount</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.customer}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>${row.payment.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={3}>
        <Button variant="contained" color="primary" onClick={handleDownloadPDF}>
          Download PDF
        </Button>
      </Box>
    </Box>
  );
};

export default ReportPage;
