// src/pages/CustomerReviewsPage.jsx
import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Rating,
  CircularProgress,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getProviderReviews } from "../../../../action/admin/reviewAction";

const CustomerReviewsPage = () => {
  const dispatch = useDispatch();
  const hardcodedProviderId = "6839086a7c820c655abfe2d6";

  const { loading, reviews, error } = useSelector(
    (state) => state.providerReviews
  );

  useEffect(() => {
    dispatch(getProviderReviews(hardcodedProviderId));
  }, [dispatch]);

  return (
    <Box p={4} maxWidth="800px" mx="auto">
      <Paper elevation={3} sx={{ p: 4, backgroundColor: "#f9f9f9" }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Customer Reviews
        </Typography>

        {loading ? (
          <Box textAlign="center">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : reviews?.length === 0 ? (
          <Typography>No reviews found.</Typography>
        ) : (
          <Grid container spacing={2}>
            {reviews.map((review) => (
              <Grid item xs={12} key={review._id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography fontWeight="bold">
                    {review.reviewer?.name || "Anonymous"}
                  </Typography>
                  <Rating
                    value={review.rating}
                    precision={0.5}
                    readOnly
                    sx={{ mb: 0.5 }}
                  />
                  <Typography variant="body2">{review.comment}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default CustomerReviewsPage;
