const Customer = require("../models/Customer");

exports.findAll = async ({ search, page = 1, limit = 10 } = {}) => {
    const query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
        Customer.find(query).sort({ created_at: -1 }).skip(skip).limit(Number(limit)),
        Customer.countDocuments(query)
    ]);

    return {
        data,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
        }
    };
};

exports.findById = (id) => Customer.findById(id);

exports.findByPhone = (phone) => Customer.findOne({ phone });

exports.create = (data) => Customer.create(data);

exports.update = (id, data) =>
    Customer.findByIdAndUpdate(
        id,
        data,
        {
            returnDocument: "after",
            runValidators: true
        }
    );

exports.remove = (id) => Customer.findByIdAndDelete(id);