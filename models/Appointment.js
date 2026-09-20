const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        customer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: [true, "Customer is required"]
        },
        barber_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Barber",
            required: [true, "Barber is required"]
        },
        service_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: [true, "Service is required"]
        },
        appointment_date: {
            type: Date,
            required: [true, "Appointment date and time is required"]
        },
        end_time: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: {
                values: ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"],
                message: "{VALUE} is not a valid appointment status"
            },
            default: "Pending"
        },
        remarks: {
            type: String,
            trim: true,
            default: null
        },
        created_at: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: false,
        versionKey: false
    }
);

appointmentSchema.index({ barber_id: 1, appointment_date: 1 });
appointmentSchema.index({ customer_id: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointment_date: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);