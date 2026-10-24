const mongoose = require("mongoose");

// Server record of an approved payment: prevents a client from forging a transactionId
// or replaying the same payment for multiple orders (see createOrder)
const paymentIntentSchema = new mongoose.Schema(
    {
        transactionId: {
            type: String,
            required: true,
            unique: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        method: {
            type: String,
            enum: ["card", "paypal"],
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "consumed"],
            default: "pending",
        },
    },
    { timestamps: true }
);

// Automatic cleanup of unused intents after 30 minutes
paymentIntentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1800 });

const PaymentIntent = mongoose.model("paymentIntent", paymentIntentSchema);
module.exports = PaymentIntent;
