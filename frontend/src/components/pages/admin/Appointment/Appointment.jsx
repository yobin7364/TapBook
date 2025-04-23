// This is the entry file where all appointment views are loaded as tabs
import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import CompletedAppointments from "./CompletedAppointments";
import UpcomingAppointments from "./UpcomingAppointments.jsx";
import ConfirmedAppointments from "./ConfirmedAppointments";
import CancelledAppointments from "./CancelledAppointments";

const AppointmentTabs = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      p={3}
      display="flex"
      justifyContent="center"
      sx={{ backgroundColor: "#f0f2f5", minHeight: "83vh" }}
    >
      <Box width="100%" maxWidth="1280px" minWidth="768px">
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{ backgroundColor: "white" }}
        >
          <Tab label="Upcoming" />
          <Tab label="Confirmed" />
          <Tab label="Completed" />
          <Tab label="Cancelled" />
        </Tabs>

        <Box mt={2}>
          {value === 0 && <UpcomingAppointments />}
          {value === 1 && <ConfirmedAppointments />}
          {value === 2 && <CompletedAppointments />}
          {value === 3 && <CancelledAppointments />}
        </Box>
      </Box>
    </Box>
  );
};

export default AppointmentTabs;
