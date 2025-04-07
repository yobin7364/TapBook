import dotenv from "dotenv";
dotenv.config();

export const keysDev = {
  mongoURI: process.env.MONGO_URI,
  secretOrKey: process.env.SECRET_OR_KEY,
};
