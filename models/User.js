const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },

    role: {
        type: String,
        enum: ["Administrator", "Receptionist", "Barber"],
        required: true
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
});

module.exports = mongoose.model("User", userSchema);