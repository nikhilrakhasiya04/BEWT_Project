const mongoose = require("mongoose");

const barberSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Associated user is required"],
            unique: true
        },
        specialization: {
            type: String,
            trim: true,
            maxlength: [255, "Specialization cannot exceed 255 characters"],
            default: null
        },
        commission_percentage: {
            type: Number,
            required: [true, "Commission percentage is required"],
            min: [0, "Commission cannot be less than 0%"],
            max: [100, "Commission cannot exceed 100%"]
        },
        joining_date: {
            type: Date,
            required: [true, "Joining date is required"],
            default: Date.now
        },
        shift_start: {
            type: String,
            default: "09:00", // HH:mm format
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid shift start time format (HH:mm)"]
        },
        shift_end: {
            type: String,
            default: "19:00", // HH:mm format
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid shift end time format (HH:mm)"]
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        }
    },
    {
        timestamps: false,
        versionKey: false
    }
);

barberSchema.index({ status: 1 });

module.exports = mongoose.model("Barber", barberSchema);