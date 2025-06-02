// ServiceSettingsPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Paper,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CommonToast from "../../../common/CommonToast";
import { useSelector, useDispatch } from "react-redux";
import {
  getMyService,
  updateServiceById,
} from "../../../../action/admin/serviceSettingAction";
import { useNavigate } from "react-router-dom";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const defaultHours = daysOfWeek.reduce((acc, day) => {
  acc[day] = {
    from: new Date(0, 0, 0, 9, 0),
    to: new Date(0, 0, 0, 17, 0),
    closed: ["Friday", "Saturday", "Sunday"].includes(day),
  };
  return acc;
}, {});

const ServiceSettingsPage = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [businessHours, setBusinessHours] = useState(defaultHours);
  const [tempHours, setTempHours] = useState(defaultHours);
  const [toastOpen, setToastOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { myService, loadingMyService } = useSelector((state) => state.service);

  useEffect(() => {
    dispatch(getMyService());
  }, [dispatch]);

  const parseBusinessHours = (rawHours) => {
    const parsed = {};
    for (const day in rawHours) {
      const { from, to, closed } = rawHours[day];

      parsed[day] = {
        from: new Date(`1970-01-01T${from}`),
        to: new Date(`1970-01-01T${to}`),
        closed: closed || false,
      };
    }
    return parsed;
  };

  useEffect(() => {
    if (myService?.service) {
      const { serviceName, category, duration, address, price, businessHours } =
        myService.service;
      setName(serviceName || "");
      setCategory(category || "");
      setDuration(duration || "");
      setAddress(address || "");
      setPrice(price?.toString() || "");

      if (businessHours) {
        const parsedHours = parseBusinessHours(businessHours);
        setBusinessHours(parsedHours);
        setTempHours(parsedHours); // Pre-fill edit form
      }
    }
  }, [myService]);

  const isFormValid =
    name.trim() !== "" &&
    category.trim() !== "" &&
    duration !== "" &&
    address.trim() !== "" &&
    price !== "" &&
    !isNaN(Number(price)) &&
    Object.values(businessHours).every((day) => {
      if (day.closed) return true;
      return day.from && day.to;
    });

  const isValidPrice = (value) => {
    return /^\d*\.?\d*$/.test(value);
  };

  const handleSave = () => {
    // if (!name || hasInvalidTimes() || !isValidPrice(price)) return;

    const formatTime = (date) =>
      new Date(date).toLocaleTimeString("en-GB", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

    const businessHours = {};
    Object.entries(tempHours).forEach(([day, { from, to, closed }]) => {
      businessHours[day] = {
        from: formatTime(from),
        to: formatTime(to),
        closed,
      };
    });

    const serviceData = {
      serviceName: name,
      category: category,
      price: Number(price),
      duration: Number(duration),
      address: address,
      businessHours,
    };

    dispatch(
      updateServiceById({
        serviceId: myService?.service?._id,
        updatedData: serviceData,
      })
    ).then(() => dispatch(getMyService()));

    setBusinessHours(tempHours);
    setIsEditMode(false);
    setToastOpen(true);
  };

  const toggleClosed = (day) => {
    setTempHours({
      ...tempHours,
      [day]: {
        ...tempHours[day],
        closed: !tempHours[day].closed,
      },
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={4} maxWidth="900px" mx="auto" minHeight="85vh">
        <Paper elevation={3} sx={{ backgroundColor: "#f9f9f9", p: 0 }}>
          <Box
            sx={{
              backgroundColor: "#e3f2fd",
              px: 4,
              py: 3,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              color: "#0d47a1",
              marginBottom: 4,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              Service Settings
            </Typography>
          </Box>

          <Box px={4} pb={4}>
            {!isEditMode ? (
              <Box>
                {myService?.service === null ? (
                  <Button
                    variant="contained"
                    onClick={() => {
                      navigate("/addServiceForm");
                    }}
                  >
                    Add Service
                  </Button>
                ) : (
                  <Box>
                    <Typography>
                      <strong>Name:</strong> {name}
                    </Typography>
                    <Typography>
                      <strong>Category:</strong> {category}
                    </Typography>
                    <Typography>
                      <strong>Appointment Duration:</strong> {duration} minutes
                    </Typography>
                    <Typography>
                      <strong>Address:</strong> {address}
                    </Typography>
                    <Typography>
                      <strong>Price:</strong> ${price}
                    </Typography>
                    <Box
                      mt={3}
                      sx={{ backgroundColor: "#f5f5f5", p: 2, borderRadius: 1 }}
                    >
                      <Typography variant="h6" fontWeight="bold" mb={1}>
                        Business Hours
                      </Typography>
                      {daysOfWeek.map((day) => (
                        <Typography key={day}>
                          <strong>{day}:</strong>{" "}
                          {businessHours[day].closed
                            ? "Closed"
                            : `${businessHours[day].from.toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )} – ${businessHours[day].to.toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}`}
                        </Typography>
                      ))}
                    </Box>
                    <Button
                      variant="contained"
                      sx={{ mt: 3 }}
                      onClick={() => setIsEditMode(true)}
                    >
                      Edit
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Typography fontWeight="bold">Name *</Typography>
                    <TextField
                      fullWidth
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography fontWeight="bold">Category</Typography>
                    <Select
                      fullWidth
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <MenuItem value="haircut">Haircut</MenuItem>
                      <MenuItem value="massage">Massage</MenuItem>
                      <MenuItem value="yoga">Yoga</MenuItem>
                      <MenuItem value="dentist">Dentist</MenuItem>
                      <MenuItem value="gym">Gym</MenuItem>
                      <MenuItem value="consultation">Consultation</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography fontWeight="bold">
                      Appointment Duration
                    </Typography>
                    <Select
                      fullWidth
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    >
                      <MenuItem value="15">15 minutes</MenuItem>
                      <MenuItem value="30">30 minutes</MenuItem>
                      <MenuItem value="60">1 hour</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography fontWeight="bold">Address</Typography>
                    <TextField
                      fullWidth
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography fontWeight="bold">Price ($)</Typography>
                    <TextField
                      fullWidth
                      value={price}
                      onChange={(e) => {
                        if (isValidPrice(e.target.value)) {
                          setPrice(e.target.value);
                        }
                      }}
                      inputProps={{ inputMode: "decimal", pattern: "\\d*" }}
                    />
                  </Grid>
                </Grid>

                <Typography mt={4} mb={1} fontWeight="bold">
                  Business Hours
                </Typography>
                {daysOfWeek.map((day) => (
                  <Box
                    key={day}
                    mb={2}
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <Typography sx={{ width: 100 }} fontWeight="bold">
                      {day}
                    </Typography>
                    <TimePicker
                      label="From"
                      value={tempHours[day].from}
                      onChange={(newVal) =>
                        setTempHours({
                          ...tempHours,
                          [day]: { ...tempHours[day], from: newVal },
                        })
                      }
                      disabled={tempHours[day].closed}
                      minutesStep={5}
                    />
                    <TimePicker
                      label="To"
                      value={tempHours[day].to}
                      onChange={(newVal) =>
                        setTempHours({
                          ...tempHours,
                          [day]: { ...tempHours[day], to: newVal },
                        })
                      }
                      disabled={tempHours[day].closed}
                      minTime={tempHours[day].from}
                      minutesStep={5}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={tempHours[day].closed}
                          onChange={() => toggleClosed(day)}
                        />
                      }
                      label="Closed"
                    />
                  </Box>
                ))}

                <Box mt={3}>
                  <Button
                    variant="outlined"
                    sx={{ mr: 2 }}
                    onClick={() => {
                      setTempHours(businessHours); // Reset form
                      setIsEditMode(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    disabled={!isFormValid}
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>

        <CommonToast
          open={toastOpen}
          onClose={() => setToastOpen(false)}
          severity="success"
          message="Service details updated successfully!"
        />
      </Box>
    </LocalizationProvider>
  );
};

export default ServiceSettingsPage;
