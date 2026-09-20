const User = require("../models/User");

exports.findAll = (filter = {}) => {
    return User.find(filter).select("-password").sort({ created_at: -1 });
};

exports.findById = (id) => {
    return User.findById(id).select("-password");
};

exports.findByIdWithPassword = (id) => {
    return User.findById(id).select("+password");
};

exports.findByEmail = (email) => {
    return User.findOne({ email });
};

exports.findByEmailWithPassword = (email) => {
    return User.findOne({ email }).select("+password");
};

exports.create = (data) => {
    return User.create(data);
};

exports.update = (id, data) => {
    return User.findByIdAndUpdate(
        id,
        data,
        {
            returnDocument: "after",
            runValidators: true
        }
    ).select("-password");
};

exports.remove = (id) => {
    return User.findByIdAndDelete(id);
};