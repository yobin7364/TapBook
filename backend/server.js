
import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import users from './routes/users.route.js'
import mongoose from 'mongoose'
import keys from './config/keys.config.js'
import passport from 'passport'
import initializePassport from './config/passport.config.js'
import { errorHandler } from './middleware/errorHandler.js'
import adminTimeSlotsRoutes from './routes/adminTimeSlots.route.js'
import adminServicesRoutes from './routes/adminServices.route.js'
import appointmentRoutes from './routes/appointments.route.js'
import reviewRoutes from './routes/reviews.route.js'
import adminReviewsRoutes from './routes/adminReviews.route.js'
import adminDashboardRoutes from './routes/adminDashboard.route.js'
import servicesRoutes from './routes/services.route.js'
import adminAppointmentRoutes from './routes/adminAppointments.route.js'

dotenv.config()

const app = express()

// Initialize Passport strategy
initializePassport()

//body parser middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Initialize Passport middleware
app.use(passport.initialize())
// Mount all your routers
app.use('/api/services', servicesRoutes)
app.use('/api/admin/time-slots', adminTimeSlotsRoutes)
app.use('/api/admin/services', adminServicesRoutes)
app.use('/api/users', users)
app.use('/api/appointments', appointmentRoutes)
app.use(errorHandler)
app.use('/api/reviews', reviewRoutes)
app.use('/api/admin/reviews', adminReviewsRoutes)
app.use('/api/admin/dashboard', adminDashboardRoutes)
app.use('/api/admin/appointments', adminAppointmentRoutes)

import './utils/notificationScheduler.js'
const mongoURI = keys.mongoURI

//connect to mongoDB
mongoose
  .connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Mongoose connection error:', err))

const PORT = process.env.PORT || 4000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
