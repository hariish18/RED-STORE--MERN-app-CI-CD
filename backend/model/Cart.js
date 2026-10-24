const mongoose = require("mongoose");

// Server-side persistent cart to sync across devices once logged in
// (Guests keep a local cart only, see localStorage on frontend)
const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            unique: true, // A user only has one cart
        },
        items: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
                title: String,
                price: { type: Number, min: 0 },
                image: String,
                brand: String,
                size: Number, // Size chosen by customer (e.g. 42)
                quantity: { type: Number, required: true, min: 1 },
                // Stock is managed in the Product model and verified in API route before adding
            },
        ],
        totalPrice: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

const Cart = mongoose.model("cart", cartSchema);
module.exports = Cart;