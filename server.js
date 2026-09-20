require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// ERROR MIDDLEWARE
const { errorHandler } = require("./middlewares/errorMiddleware");

// ROUTE HANDLERS
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const customerRoutes = require("./routes/customerRoutes");
const barberRoutes = require("./routes/barberRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const slotRoutes = require("./routes/slotRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const wageRoutes = require("./routes/wageRoutes");
const reportRoutes = require("./routes/reportRoutes");

// INITIALIZE APP
const app = express();

// DATABASE CONNECTION
connectDB();

// GLOBAL MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// RESTFUL API ROUTES (PREFIXED WITH /api)
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/barbers", barberRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/wages", wageRoutes);
app.use("/api/wage-records", wageRoutes);
app.use("/api/reports", reportRoutes);

// DIRECT ROUTE MOUNTS FOR CONVENIENCE
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/customers", customerRoutes);
app.use("/barbers", barberRoutes);
app.use("/services", serviceRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/slots", slotRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/wage-records", wageRoutes);

// HOME / STATUS ROUTE
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Salon Management System RESTful API Server Active"
    });
});

// 404 NOT FOUND ROUTE HANDLER
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route '${req.method} ${req.originalUrl}' not found.`
    });
});

// GLOBAL ERROR HANDLER
app.use(errorHandler);

// SERVER BOOTSTRAP
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Salon Management API Server running on port ${PORT}`);
});

module.exports = app;