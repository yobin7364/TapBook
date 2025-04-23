// CustomerReviewsPage.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Pagination,
  Rating,
} from "@mui/material";

const sampleReviews = [
  {
    name: "Alice Brown",
    rating: 5,
    review: "Excellent performance and battery life.",
  },
  {
    name: "John Miller",
    rating: 4,
    review: "Very comfortable, but runs a bit small.",
  },
  {
    name: "Emma Davis",
    rating: 3.5,
    review: "Average quality, not as expected.",
  },
  {
    name: "Michael Wilson",
    rating: 4,
    review: "Works well, good value for money.",
  },
  {
    name: "Sarah Lee",
    rating: 5,
    review: "Fantastic service and fast delivery!",
  },
  { name: "James Moore", rating: 3, review: "Item was okay but arrived late." },
  {
    name: "Olivia Clark",
    rating: 4.5,
    review: "Very intuitive and well-built.",
  },
  { name: "David Turner", rating: 2.5, review: "Had issues with setup." },
];

const reviewsPerPage = 4;

const CustomerReviewsPage = () => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(sampleReviews.length / reviewsPerPage);
  const displayedReviews = sampleReviews.slice(
    (page - 1) * reviewsPerPage,
    page * reviewsPerPage
  );

  return (
    <Box p={4} maxWidth="800px" mx="auto">
      <Paper elevation={3} sx={{ p: 4, backgroundColor: "#f9f9f9" }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Customer Reviews
        </Typography>

        <Grid container spacing={2}>
          {displayedReviews.map((review, index) => (
            <Grid item xs={12} key={index}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography fontWeight="bold">{review.name}</Typography>
                <Rating
                  value={review.rating}
                  precision={0.5}
                  readOnly
                  sx={{ mb: 0.5 }}
                />
                <Typography variant="body2">{review.review}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box mt={4} display="flex" justifyContent="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default CustomerReviewsPage;
