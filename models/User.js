const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [255, "Name cannot exceed 255 characters"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: [255, "Email cannot exceed 255 characters"]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false
        },
        role: {
            type: String,
            enum: {
                values: ["Administrator", "Receptionist", "Barber"],
                message: "{VALUE} is not a valid role"
            },
            required: [true, "Role is required"]
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
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

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

module.exports = mongoose.model("User", userSchema);