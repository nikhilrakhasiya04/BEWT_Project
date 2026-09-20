const mongoose = require("mongoose");

const wageSchema = new mongoose.Schema(
    {
        barber_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Barber",
            required: [true, "Barber reference is required"]
        },
        month: {
            type: String,
            required: [true, "Month is required in YYYY-MM format"],
            match: [/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format"]
        },
        salary: {
            type: Number,
            default: 0.00,
            min: [0, "Salary cannot be negative"]
        },
        commission: {
            type: Number,
            default: 0.00,
            min: [0, "Commission cannot be negative"]
        },
        total_amount: {
            type: Number,
            required: [true, "Total amount is required"],
            min: [0, "Total amount cannot be negative"]
        },
        completed_appointments_count: {
            type: Number,
            default: 0
        },
        payment_status: {
            type: String,
            enum: ["Pending", "Paid"],
            default: "Pending"
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

wageSchema.index({ barber_id: 1, month: 1 }, { unique: true });
wageSchema.index({ month: 1 });

module.exports = mongoose.model("Wage", wageSchema);