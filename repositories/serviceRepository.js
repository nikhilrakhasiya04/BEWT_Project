const Service = require("../models/Service");

exports.findAll = (filter = {}) => Service.find(filter).sort({ price: 1 });

exports.findById = (id) => Service.findById(id);

exports.findByName = (service_name) => Service.findOne({ service_name: { $regex: new RegExp(`^${service_name}$`, "i") } });

exports.create = (data) => Service.create(data);

exports.update = (id, data) =>
    Service.findByIdAndUpdate(
        id,
        data,
        {
            returnDocument: "after",
            runValidators: true
        }
    );

exports.remove = (id) =>
    Service.findByIdAndDelete(id);