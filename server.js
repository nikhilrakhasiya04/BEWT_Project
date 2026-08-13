require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");


// ROUTES
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const customerRoutes = require("./routes/customerRoutes");
const barberRoutes = require("./routes/barberRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const wageRoutes = require("./routes/wageRoutes");


// APP
const app = express();


// DATABASE CONNECTION
connectDB();

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// AUTH ROUTES
app.use("/auth", authRoutes);



// CRUD ROUTES
app.use("/users", userRoutes);

app.use("/customers", customerRoutes);

app.use("/barbers", barberRoutes);

app.use("/services", serviceRoutes);

app.use("/appointments", appointmentRoutes);

app.use("/attendance", attendanceRoutes);

app.use("/wage-records", wageRoutes);



// HOME ROUTE
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Salon Management API Running..."
    });
});



// 404 ROUTE
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});



// ERROR HANDLER
app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message
    });
});



// SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});