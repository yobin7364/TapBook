import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Card, CardContent, Typography, Box, Link } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Sample eBooks data
const ebooks = [
  {
    title: "Buchanan's Express",
    author: "John Parker",
    price: "$2.99",
    oldPrice: "$2.99",
    image:
      "https://plus.unsplash.com/premium_photo-1682125773446-259ce64f9dd7?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Blackstone",
    author: "Jesse Storm",
    price: "$0.99",
    oldPrice: "$12.99",
    image:
      "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?q=80&w=2112&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Gitel’s Freedom",
    author: "Iris Mitlin Lav",
    price: "$0.99",
    oldPrice: "$12.99",
    image:
      "https://images.unsplash.com/photo-1641154748135-8032a61a3f80?q=80&w=2030&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Ice Age",
    author: "U.C. Ringuer",
    price: "Free",
    oldPrice: "$3.99",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "The Fondling of Details",
    author: "Panayotis Cacoyannis",
    price: "$0.99",
    oldPrice: "$3.99",
    image:
      "https://images.unsplash.com/photo-1629992101753-56d196c8aabb?q=80&w=1980&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Granny Goes to Egypt",
    author: "Anna Kay",
    price: "$1.99",
    oldPrice: "$4.99",
    image:
      "https://images.unsplash.com/photo-1511108690759-009324a90311?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "The Fondling of Details",
    author: "Panayotis Cacoyannis",
    price: "$0.99",
    oldPrice: "$3.99",
    image:
      "https://images.unsplash.com/photo-1629992101753-56d196c8aabb?q=80&w=1980&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Granny Goes to Egypt",
    author: "Anna Kay",
    price: "$1.99",
    oldPrice: "$4.99",
    image:
      "https://images.unsplash.com/photo-1511108690759-009324a90311?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

// Custom arrow components
const NextArrow = ({ onClick, isDisabled }) => (
  <ArrowForwardIos
    onClick={onClick}
    sx={{
      position: "absolute",
      right: -55,
      top: "50%",
      transform: "translateY(-50%)",
      cursor: isDisabled ? "not-allowed" : "pointer",
      fontSize: "2rem",
      color: isDisabled ? "#ccc" : "#69a69e", // Disabled color
      visibility: isDisabled ? "hidden" : "visible",
      backgroundColor: "white",
      borderRadius: "50%",
      padding: "5px",
      zIndex: 1,
    }}
  />
);

const PrevArrow = ({ onClick, isDisabled }) => (
  <ArrowBackIos
    onClick={onClick}
    sx={{
      position: "absolute",
      left: -55,
      top: "50%",
      transform: "translateY(-50%)",
      cursor: isDisabled ? "not-allowed" : "pointer",
      fontSize: "2rem",
      color: isDisabled ? "#ccc" : "#69a69e", // Disabled color
      visibility: isDisabled ? "hidden" : "visible",
      backgroundColor: "white",
      borderRadius: "50%",
      padding: "5px",
      zIndex: 1,
    }}
  />
);

const FreeEbookCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5, // Show 5 books at a time
    slidesToScroll: 1,
    arrows: true,
    afterChange: (current) => setCurrentSlide(current),
    nextArrow: <NextArrow isDisabled={currentSlide === ebooks.length - 5} />,
    prevArrow: <PrevArrow isDisabled={currentSlide === 0} />,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 4 }, // Adjust for smaller screens
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 2 },
      },
    ],
  };

  return (
    <Box
      sx={{
        maxWidth: "1200px", // Your max width
        minWidth: "800px", // Your min width
        margin: "auto",
        padding: "20px 0",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          FREE EBOOKS AND DEALS
        </Typography>
        <Link
          href="#"
          sx={{
            color: "#008000", // Green color
            fontSize: "14px",
            fontWeight: "bold",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          (view all)
        </Link>
      </Box>
      <Slider {...settings}>
        {ebooks.map((book, index) => (
          <Box key={index} sx={{ pr: 1 }}>
            <Card
              sx={{
                margin: "0 10px",
                textAlign: "center",
                cursor: "pointer", // hand cursor
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate("/bookDetail")}
            >
              <img
                src={book.image}
                alt={book.title}
                style={{ width: "100%", height: "250px", objectFit: "cover" }}
              />
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {book.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {book.author}
                </Typography>
                <Typography
                  variant="body1"
                  color="primary"
                  sx={{ fontWeight: "bold" }}
                >
                  {book.price}
                  {book.oldPrice && (
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{
                        textDecoration: "line-through",
                        color: "gray",
                        marginLeft: "8px",
                      }}
                    >
                      {book.oldPrice}
                    </Typography>
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default FreeEbookCarousel;
