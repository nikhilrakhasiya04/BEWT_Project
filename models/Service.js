const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
    {
        service_name: {
            type: String,
            required: [true, "Service name is required"],
            trim: true,
            unique: true,
            maxlength: [255, "Service name cannot exceed 255 characters"]
        },
        duration: {
            type: Number,
            required: [true, "Duration (in minutes) is required"],
            min: [1, "Duration must be at least 1 minute"]
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"]
        },
        description: {
            type: String,
            trim: true,
            default: null
        }
    },
    {
        timestamps: false,
        versionKey: false
    }
);

module.exports = mongoose.model("Service", serviceSchema);