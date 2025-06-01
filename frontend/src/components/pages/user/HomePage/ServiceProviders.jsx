import React, { useEffect, useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSerivesList } from "../../../../action/customer/servicesListAction";

const ServiceProviders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);

  const { servicesList, loadingServicesList, errorServicesList } = useSelector(
    (state) => state.service
  );

  useEffect(() => {
    dispatch(getSerivesList({ page }));
  }, [dispatch, page]);

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const services = servicesList?.services || [];
  const pagination = servicesList?.pagination || { pages: 1, total: 0 };

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
        {loadingServicesList ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : errorServicesList ? (
          <Typography color="error" align="center">
            {Array.isArray(errorServicesList)
              ? errorServicesList.join(", ")
              : errorServicesList}
          </Typography>
        ) : (
          <>
            <Grid container spacing={3}>
              {services.map((provider) => (
                <Grid item xs={12} sm={6} md={4} key={provider._id}>
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                          <PersonIcon />
                        </Avatar>
                        <Typography variant="h6">
                          {provider.admin?.name || "No Name"}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Category: {provider.category || "N/A"}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 1,
                        }}
                      >
                        <Rating
                          value={provider.avgRating || 0}
                          readOnly
                          precision={0.5}
                        />
                        <Typography variant="body2" color="text.secondary">
                          ({provider.reviewCount || 0} reviews)
                        </Typography>
                      </Box>
                    </CardContent>
                    <Box sx={{ p: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() =>
                          navigate(`/bookingPage/${provider._id}`, {
                            state: { price: provider.price },
                          })
                        }
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
                count={pagination.pages}
                page={page}
                onChange={handleChangePage}
                color="primary"
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ServiceProviders;
