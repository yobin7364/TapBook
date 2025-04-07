import * as React from "react";
import FreeEbookCarousel from "./FreeEbookCarousel";
import GenresEbook from "./GenresEbook";
import EditorsChoiceEbooks from "./EditorsChoiceEbooks";

const HomePage = () => {
  return (
    <>
      <FreeEbookCarousel />
      <GenresEbook />
      <EditorsChoiceEbooks />
    </>
  );
};

export default HomePage;
