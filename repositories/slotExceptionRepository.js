const SlotException = require("../models/SlotException");

exports.findAll = (filter = {}) => {
    return SlotException.find(filter).populate("barber_id").sort({ start_time: 1 });
};

exports.findById = (id) => {
    return SlotException.findById(id).populate("barber_id");
};

exports.findOverlapping = (startTime, endTime, barberId = null) => {
    const query = {
        start_time: { $lt: new Date(endTime) },
        end_time: { $gt: new Date(startTime) },
        $or: [
            { barber_id: null }, // Global salon holiday/closure
            ...(barberId ? [{ barber_id: barberId }] : [])
        ]
    };
    return SlotException.find(query);
};

exports.create = (data) => {
    return SlotException.create(data);
};

exports.update = (id, data) => {
    return SlotException.findByIdAndUpdate(id, data, {
        returnDocument: "after",
        runValidators: true
    }).populate("barber_id");
};

exports.remove = (id) => {
    return SlotException.findByIdAndDelete(id);
};
