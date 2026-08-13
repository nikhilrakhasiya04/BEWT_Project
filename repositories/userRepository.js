const User = require("../models/User");

exports.findAll = () => {
    return User.find().select("-password");
};

exports.findById = (id) => {
    return User.findById(id).select("-password");
};

exports.findByEmail = (email) => {
    return User.findOne({ email });
};

exports.create = (data) => {
    return User.create(data);
};

exports.update = (id, data) => {
    return User.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    ).select("-password");
};

exports.remove = (id) => {
    return User.findByIdAndDelete(id);
};