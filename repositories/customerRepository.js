const Customer = require("../models/Customer");

exports.findAll = () => Customer.find();

exports.findById = (id) => Customer.findById(id);

exports.create = (data) => Customer.create(data);

exports.update = (id, data) =>
    Customer.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );

exports.remove = (id) =>
    Customer.findByIdAndDelete(id);