import React from "react";
import { Box, Typography } from "@mui/material";

const UserFooter = () => {
  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "primary.main", // Same background color as AppBar
        color: "white",
        py: 2, // padding y-axis (top and bottom)
        mt: "auto", // Push footer to bottom if needed
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          minWidth: "800px",
          margin: "0 auto", // center horizontally
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" align="center">
          © 2025 Booking System. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default UserFooter;
