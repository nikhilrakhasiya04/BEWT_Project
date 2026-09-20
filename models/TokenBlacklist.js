const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            unique: true
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        expires_at: {
            type: Date,
            required: true,
            index: { expires: 0 } // Document auto-deletes when expires_at timestamp is reached
        },
        created_at: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: false,
        versionKey: false
    }
);

module.exports = mongoose.model("TokenBlacklist", tokenBlacklistSchema);
