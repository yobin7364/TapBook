import React from "react";
import {
  Grid,
  Box,
  Typography,
  Card,
  CardActionArea,
  CardMedia,
} from "@mui/material";

const ebooks = [
  {
    title: "Buchanan's Express",
    genre: "Action & Adventure",
    image:
      "https://plus.unsplash.com/premium_photo-1682125773446-259ce64f9dd7?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Blackstone",
    genre: "Mystery & Thriller",
    image:
      "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?q=80&w=2112&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Gitel’s Freedom",
    genre: "Historical Fiction",
    image:
      "https://images.unsplash.com/photo-1641154748135-8032a61a3f80?q=80&w=2030&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Ice Age",
    genre: "Science Fiction",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "The Fondling of Details",
    genre: "Literary Fiction",
    image:
      "https://images.unsplash.com/photo-1629992101753-56d196c8aabb?q=80&w=1980&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Granny Goes to Egypt",
    genre: "Children's",
    image:
      "https://images.unsplash.com/photo-1511108690759-009324a90311?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const GenresEbook = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Browse Genres
      </Typography>
      <Grid container spacing={3}>
        {ebooks.map((book, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 3,
              }}
            >
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="180"
                  image={book.image}
                  alt={book.genre}
                />
                {/* Overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                    color: "white",
                    p: 2,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {book.genre}
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default GenresEbook;
