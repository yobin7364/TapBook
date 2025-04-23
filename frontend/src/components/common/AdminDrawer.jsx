import React, { useState } from "react";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import RateReviewIcon from "@mui/icons-material/RateReview";
import InsightsIcon from "@mui/icons-material/Insights";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";

import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BuildIcon from "@mui/icons-material/Build";

export const AdminDrawer = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const drawerItems = [
    { text: "Dashboard", icon: <DashboardIcon />, toGo: "/dashboardPage" },
    {
      text: "Manage Appointment",
      icon: <EventAvailableIcon />,
      toGo: "/manageAppointment",
    },
    { text: "Service Setting", icon: <BuildIcon />, toGo: "/serviceSetting" },
    {
      text: "Ratings & Reviews",
      icon: <RateReviewIcon />,
      toGo: "/ratingPage",
    },
    {
      text: "Generate Report",
      icon: <AssessmentIcon />,
      toGo: "/generateReport",
    },
    { text: "Profile", icon: <AccountCircleIcon />, toGo: "/profilePage" },
    { text: "Logout", icon: <LogoutIcon />, toGo: "/logout" }, // Mark logout specially
  ];

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {drawerItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              onClick={() => {
                if (item.text === "Logout") {
                  handleLogout();
                } else {
                  navigate(item.toGo);
                }
              }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <div>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="open drawer"
        sx={{ mr: 2 }}
        onClick={toggleDrawer(true)}
      >
        <MenuIcon />
      </IconButton>

      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
};
