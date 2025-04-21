import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";

// Icons
import AccountCircle from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Badge } from "@mui/material";

const UserNavbar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate("/login");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              width: "100%",
              maxWidth: "1200px",
              minWidth: "800px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                cursor: "pointer",
                userSelect: "none",
                mr: 2,
              }}
              onClick={() => navigate("/")}
            >
              Booking System
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            {/* If user is NOT authenticated */}
            {!isAuthenticated && (
              <>
                <Tooltip title="Login">
                  <IconButton
                    color="inherit"
                    onClick={() => navigate("/login")}
                  >
                    <LoginIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Register">
                  <IconButton
                    color="inherit"
                    onClick={() => navigate("/registerForm")}
                  >
                    <AppRegistrationIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {/* If user IS authenticated */}
            {isAuthenticated && (
              <>
                <Tooltip title="My Appointments">
                  <IconButton
                    color="inherit"
                    onClick={() => navigate("/myAppointments")}
                  >
                    <CalendarMonthIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="My Membership">
                  <IconButton
                    color="inherit"
                    onClick={() => navigate("/myMembership")}
                  >
                    <CardMembershipIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Notifications">
                  <IconButton
                    color="inherit"
                    onClick={() => navigate("/notifications")}
                  >
                    <Badge badgeContent={3} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* Profile Dropdown */}
                <Box>
                  <Tooltip title="Profile">
                    <IconButton onClick={handleMenu} color="inherit">
                      <AccountCircle />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                  >
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        navigate("/profilePage");
                      }}
                    >
                      Account
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </Box>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default UserNavbar;
