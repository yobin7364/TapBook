// backend/config/keys_dev.config.js
import dotenv from 'dotenv'
dotenv.config()

export const keysDev = {
  mongoURI: process.env.MONGO_URI_SEED,
  secretOrKey: process.env.SECRET_OR_KEY,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
}
