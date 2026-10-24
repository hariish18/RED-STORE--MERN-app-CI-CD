const express = require("express");
const Stripe = require("stripe");
const optionalAuth = require("../middlewares/optionalAuth");
const PaymentIntent = require("../model/PaymentIntent");
const { processPayment } = require("../controller/payment.controller");

const router = express.Router();

// POST /api/payment/create-payment-intent
// Body: { totalPrice: number } — amount in dollars; converted to cents for Stripe
// optionalAuth (not isAuth): guest checkout is supported everywhere else (createOrder,
// req.user?._id below); isAuth here erroneously blocked guest card payments
router.post("/create-payment-intent", optionalAuth, async (req, res) => {
    try {
        const totalPrice = Number(req.body.totalPrice ?? req.body.amount);

        if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
            return res.status(400).json({ msg: "Invalid payment amount" });
        }

        const secretKey = process.env.STRIPE_SECRET_KEY;
        if (!secretKey || !secretKey.startsWith("sk_")) {
            return res.status(503).json({
                msg: "Stripe is not configured. Set STRIPE_SECRET_KEY=sk_test_… in backend/.env",
            });
        }

        // Convert dollars → cents (e.g. 49.99 → 4999)
        const amountInCents = Math.round(totalPrice * 100);

        if (amountInCents < 50) {
            return res.status(400).json({ msg: "Amount must be at least $0.50" });
        }

        const stripe = new Stripe(secretKey);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: "usd",
            payment_method_types: ["card"],
            metadata: {
                userId: req.user?._id ? String(req.user._id) : "guest",
            },
        });

        await PaymentIntent.findOneAndUpdate(
            { transactionId: paymentIntent.id },
            {
                transactionId: paymentIntent.id,
                amount: totalPrice,
                method: "card",
                status: "pending",
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amountInCents,
        });
    } catch (error) {
        console.error("create-payment-intent error:", error.message);
        res.status(500).json({
            msg: "Fail to create payment intent",
            error: error.message,
        });
    }
});

router.post("/process", processPayment);

module.exports = router;
