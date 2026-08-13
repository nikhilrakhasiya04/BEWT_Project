const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    barber_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Barber",
        required: true
    },
    check_in: {
        type: Date,
        required: true
    },
    check_out: {
        type: Date
    },
    date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model("Attendance", attendanceSchema);