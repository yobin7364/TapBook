import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import colors from "./colors";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

import { AdminDrawer } from "./AdminDrawer";

export default function AdminNavBar() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        flexGrow: 1,
        //marginBottom: "40px"
      }}
    >
      <AppBar position="static" sx={{ backgroundColor: colors.subPrimary }}>
        <Toolbar
          sx={{
            backgroundColor: colors.subPrimary,
            maxWidth: "1200px", // Set max width
            minWidth: "800px", // Set min width
            width: "100%",
            margin: "0 auto", // Center the toolbar
            px: 2, // Padding on both sides to prevent elements from touching edges
          }}
        >
          <AdminDrawer />

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: "none", sm: "block", cursor: "pointer" } }}
            onClick={() => navigate("/dashboardPage")}
          >
            Tap Book
          </Typography>

          <Box sx={{ flexGrow: 1 }} />
        </Toolbar>
      </AppBar>
    </Box>
  );
}
