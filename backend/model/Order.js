const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },
        items: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
                title: String,
                price: { type: Number, required: true, min: 0 },
                size: Number,
                quantity: { type: Number, required: true, min: 1 },
                image: String,
            },
        ],
        shippingInfo: {
            fullName: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            phone: { type: String, required: true },
        },
        payment: {
            method: { type: String, enum: ["card", "paypal", "stripe"], default: "card" },
            status: { type: String, enum: ["paid", "failed"], default: "paid" },
            transactionId: String,
        },
        subtotal: { type: Number, required: true },
        tax: { type: Number, required: true },
        shipping: { type: Number, required: true },
        total: { type: Number, required: true },
        // Associates order with logged-in user if present (guest checkout otherwise).
        // ref "User" (uppercase): must match exactly mongoose.model('User', ...) in
        // model/User.js, otherwise .populate('createdBy') fails with MissingSchemaError
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        // Order processing/shipping status (distinct from payment.status which only
        // tracks payment) - modifiable by admin from dashboard
        status: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

// Index used by getMyOrders (profile page) which filters and sorts on these fields
orderSchema.index({ createdBy: 1, createdAt: -1 });

const Order = mongoose.model("order", orderSchema);
module.exports = Order;
