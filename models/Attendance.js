const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        barber_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Barber",
            required: [true, "Barber is required"]
        },
        check_in: {
            type: Date,
            required: [true, "Check-in time is required"]
        },
        check_out: {
            type: Date,
            default: null
        },
        date: {
            type: String, // YYYY-MM-DD
            required: [true, "Date is required"],
            match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"]
        },
        total_hours: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ["Checked In", "Checked Out"],
            default: "Checked In"
        }
    },
    {
        timestamps: false,
        versionKey: false
    }
);

attendanceSchema.index({ barber_id: 1, date: 1 });
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);