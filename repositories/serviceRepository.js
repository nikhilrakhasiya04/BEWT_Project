const Service = require("../models/Service");

exports.findAll = () => Service.find();

exports.findById = (id) => Service.findById(id);

exports.create = (data) => Service.create(data);

exports.update = (id, data) =>
    Service.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );

exports.remove = (id) =>
    Service.findByIdAndDelete(id);