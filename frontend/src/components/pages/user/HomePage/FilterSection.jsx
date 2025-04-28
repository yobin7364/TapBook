import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Rating,
  Slider,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

// Enums
const CategoriesEnum = [
  "Haircut",
  "Massage",
  "Yoga",
  "Dentist",
  "Gym",
  "Consultation",
];

const FilterSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    return today;
  });

  const [anchorElCategory, setAnchorElCategory] = useState(null);
  const [anchorElTime, setAnchorElTime] = useState(null);
  const [anchorElRating, setAnchorElRating] = useState(null);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState([8, 18]); // Default 8AM-6PM
  const [selectedRating, setSelectedRating] = useState(0);

  const handleCategoryClick = (event) =>
    setAnchorElCategory(event.currentTarget);
  const handleTimeClick = (event) => setAnchorElTime(event.currentTarget);
  const handleRatingClick = (event) => setAnchorElRating(event.currentTarget);

  const handleCategoryClose = () => setAnchorElCategory(null);
  const handleTimeClose = () => setAnchorElTime(null);
  const handleRatingClose = () => setAnchorElRating(null);

  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories((prev) => prev.filter((item) => item !== category));
    } else {
      setSelectedCategories((prev) => [...prev, category]);
    }
  };

  const handleRatingChange = (event, newValue) => {
    setSelectedRating(newValue);
    handleRatingClose();
  };

  const formatHourLabel = (value) => {
    const hour = value % 24;
    const suffix = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}${suffix}`;
  };

  const handleApplyFilters = () => {
    const startHour = selectedTimeSlot[0];
    const endHour = selectedTimeSlot[1];

    const formatTime = (hour) => {
      const suffix = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
      return `${formattedHour}${suffix}`;
    };

    console.log("Filters applied: ", {
      search: searchTerm,
      date: selectedDate,
      categories: selectedCategories,
      timeSlot: `${formatTime(startHour)} - ${formatTime(endHour)}`,
      rating: selectedRating,
    });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedTimeSlot([8, 18]);
    setSelectedRating(0);
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          minWidth: "800px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* Left Side: Search */}
        <TextField
          placeholder="Search for Services"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            backgroundColor: "#e3f2fd",
            borderRadius: 1,
            width: "250px",
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#e3f2fd",
              borderRadius: "8px",
            },
            "& .MuiOutlinedInput-input": {
              padding: "8px 8px 8px 0px",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* Right Side: Date + Filters + Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Date Picker */}
          <TextField
            type="date"
            size="small"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            inputProps={{
              min: new Date().toISOString().split("T")[0],
            }}
            sx={{
              backgroundColor: "#e3f2fd",
              borderRadius: 1,
              width: "180px",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#e3f2fd",
                borderRadius: "8px",
              },
              "& .MuiOutlinedInput-input": {
                padding: "8px",
              },
            }}
          />

          {/* Category Filter */}
          <div>
            <Button
              variant="outlined"
              onClick={handleCategoryClick}
              sx={{
                backgroundColor: "#e3f2fd",
                color: "black",
                borderColor: "black",
                "&:hover": {
                  backgroundColor: "#bbdefb",
                  borderColor: "black",
                },
              }}
            >
              Categories{" "}
              {selectedCategories.length > 0 &&
                `(${selectedCategories.length})`}
            </Button>
            <Menu
              anchorEl={anchorElCategory}
              open={Boolean(anchorElCategory)}
              onClose={handleCategoryClose}
            >
              <MenuItem>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedCategories.length === 0}
                      onChange={() => setSelectedCategories([])}
                    />
                  }
                  label="Any"
                />
              </MenuItem>
              {CategoriesEnum.map((category) => (
                <MenuItem key={category}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                      />
                    }
                    label={category}
                  />
                </MenuItem>
              ))}
            </Menu>
          </div>

          {/* Time Slot Filter */}
          <div>
            <Button
              variant="outlined"
              onClick={handleTimeClick}
              sx={{
                backgroundColor: "#e3f2fd",
                color: "black",
                borderColor: "black",
                "&:hover": {
                  backgroundColor: "#bbdefb",
                  borderColor: "black",
                },
              }}
            >
              Time Slot ({formatHourLabel(selectedTimeSlot[0])} -{" "}
              {formatHourLabel(selectedTimeSlot[1])})
            </Button>
            <Menu
              anchorEl={anchorElTime}
              open={Boolean(anchorElTime)}
              onClose={handleTimeClose}
              MenuListProps={{
                disablePadding: true,
              }}
              PaperProps={{
                sx: { padding: 2, width: 300 },
              }}
            >
              <Box sx={{ width: "100%" }}>
                <div style={{ fontSize: "14px", marginBottom: "12px" }}>
                  Select Time Range
                </div>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={selectedTimeSlot}
                    min={0}
                    max={24}
                    step={1}
                    onChange={(e, newValue) => setSelectedTimeSlot(newValue)}
                    valueLabelDisplay="on"
                    valueLabelFormat={formatHourLabel}
                    marks={[
                      { value: 0, label: "12AM" },
                      { value: 6, label: "6AM" },
                      { value: 12, label: "12PM" },
                      { value: 18, label: "6PM" },
                      { value: 24, label: "12AM" },
                    ]}
                  />
                </Box>
              </Box>
            </Menu>
          </div>

          {/* Rating Filter */}
          <div>
            <Button
              variant="outlined"
              onClick={handleRatingClick}
              sx={{
                backgroundColor: "#e3f2fd",
                color: "black",
                borderColor: "black",
                "&:hover": {
                  backgroundColor: "#bbdefb",
                  borderColor: "black",
                },
              }}
            >
              Rating {selectedRating > 0 && `(${selectedRating}⭐)`}
            </Button>
            <Menu
              anchorEl={anchorElRating}
              open={Boolean(anchorElRating)}
              onClose={handleRatingClose}
            >
              <MenuItem onClick={() => handleRatingChange(null, 0)}>
                Any
              </MenuItem>
              <MenuItem>
                <Rating
                  name="rating-filter"
                  value={selectedRating}
                  onChange={handleRatingChange}
                />
              </MenuItem>
            </Menu>
          </div>

          {/* Apply Filters Button */}
          <Button
            variant="contained"
            onClick={handleApplyFilters}
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
          >
            Apply Filters
          </Button>

          {/* Reset Button */}
          <Button
            variant="outlined"
            onClick={handleResetFilters}
            sx={{
              backgroundColor: "#e3f2fd",
              color: "black",
              borderColor: "black",
              "&:hover": {
                backgroundColor: "#bbdefb",
                borderColor: "black",
              },
            }}
          >
            Reset
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default FilterSection;
