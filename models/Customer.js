const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Customer name is required"],
            trim: true,
            maxlength: [255, "Name cannot exceed 255 characters"]
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            maxlength: [20, "Phone number cannot exceed 20 characters"]
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            maxlength: [255, "Email cannot exceed 255 characters"],
            default: null
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
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

customerSchema.index({ phone: 1 });
customerSchema.index({ name: "text", phone: "text", email: "text" });

module.exports = mongoose.model("Customer", customerSchema);