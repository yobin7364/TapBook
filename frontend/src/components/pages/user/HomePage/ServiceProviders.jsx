import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Rating,
  Pagination,
  Avatar,
  Button,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";

// Mock data: List of Service Providers
const serviceProviders = [
  { name: "John Doe", category: "Haircut", rating: 4, reviews: 120 },
  { name: "Sarah Smith", category: "Massage", rating: 5, reviews: 85 },
  { name: "Mike Johnson", category: "Yoga", rating: 3, reviews: 45 },
  { name: "Emily Davis", category: "Dentist", rating: 4, reviews: 200 },
  { name: "Chris Brown", category: "Gym", rating: 5, reviews: 150 },
  { name: "Anna Wilson", category: "Consultation", rating: 2, reviews: 30 },
  { name: "David Miller", category: "Massage", rating: 4, reviews: 90 },
  { name: "Sophia Anderson", category: "Yoga", rating: 5, reviews: 110 },
  { name: "Daniel Taylor", category: "Dentist", rating: 3, reviews: 50 },
  { name: "Olivia Moore", category: "Consultation", rating: 5, reviews: 75 },
  { name: "James Martin", category: "Gym", rating: 4, reviews: 95 },
  { name: "Grace Thomas", category: "Haircut", rating: 5, reviews: 130 },
];

const ServiceProviders = () => {
  const [page, setPage] = useState(1);
  const providersPerPage = 6;

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const navigator = useNavigate();

  const startIndex = (page - 1) * providersPerPage;
  const paginatedProviders = serviceProviders.slice(
    startIndex,
    startIndex + providersPerPage
  );

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        justifyContent: "center",
        minHeight: "71vh",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "1200px", minWidth: "800px" }}>
        <Grid container spacing={3}>
          {paginatedProviders.map((provider, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  backgroundColor: "white",
                  borderRadius: 2,
                  boxShadow: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Typography variant="h6">{provider.name}</Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Category: {provider.category}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    <Rating value={provider.rating} readOnly precision={0.5} />
                    <Typography variant="body2" color="text.secondary">
                      ({provider.reviews} reviews)
                    </Typography>
                  </Box>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigator("/bookingPage")}
                  >
                    Book Now
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={Math.ceil(serviceProviders.length / providersPerPage)}
            page={page}
            onChange={handleChangePage}
            color="primary"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ServiceProviders;
