const mongoose = require("mongoose");

const slotExceptionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required (e.g. Official Holiday, Renovation, Staff Meeting)"],
            trim: true
        },
        type: {
            type: String,
            enum: ["Holiday", "Blocked_Window", "Barber_Leave"],
            default: "Holiday"
        },
        barber_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Barber",
            default: null // null means salon-wide exception
        },
        start_time: {
            type: Date,
            required: [true, "Start time is required"]
        },
        end_time: {
            type: Date,
            required: [true, "End time is required"]
        },
        remarks: {
            type: String,
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

slotExceptionSchema.index({ start_time: 1, end_time: 1 });
slotExceptionSchema.index({ barber_id: 1 });

module.exports = mongoose.model("SlotException", slotExceptionSchema);
