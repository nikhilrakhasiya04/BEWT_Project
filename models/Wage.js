const mongoose = require("mongoose");

const wageSchema = new mongoose.Schema({
    barber_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Barber",
        required: true
    },
    month: {
        type: String,
        required: true
    },
    salary: {
        type: Number,
        default: 0
    },
    commission: {
        type: Number,
        default: 0
    },
    total_amount: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("Wage", wageSchema);