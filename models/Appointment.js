const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },
    barber_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Barber",
        required: true
    },
    service_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true
    },
    appointment_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: [
            "Pending",
            "Confirmed",
            "In Progress",
            "Completed",
            "Cancelled"
        ],
        default: "Pending"
    },
    remarks: {
        type: String
    }
});

module.exports = mongoose.model("Appointment", appointmentSchema);