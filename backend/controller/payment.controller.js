const crypto = require("crypto");
const PaymentIntent = require("../model/PaymentIntent");

const DECLINED_TEST_CARD = "4000000000000002";

// createPaymentIntent is handled in routes/payment.routes.js
exports.processPayment = async (req, res) => {
    try {
        const { method, amount, cardNumber, expiry, cvv } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ msg: "Invalid payment amount" });
        }

        if (!["card", "paypal"].includes(method)) {
            return res.status(400).json({ msg: "Invalid payment method" });
        }

        if (method === "card") {
            const digitsOnly = (cardNumber || "").replace(/\s/g, "");
            if (!/^\d{13,19}$/.test(digitsOnly) || !expiry || !cvv) {
                return res.status(400).json({ msg: "Invalid card details" });
            }
            if (digitsOnly === DECLINED_TEST_CARD) {
                return res.status(402).json({
                    msg: "Payment declined. Please check your card details or try another card.",
                });
            }
        }

        // Simulates latency of a real payment gateway
        await new Promise((resolve) => setTimeout(resolve, 600));

        const transactionId = `MOCK-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
        await PaymentIntent.create({ transactionId, amount, method, status: "approved" });

        res.status(200).json({ msg: "Payment approved", transactionId });
    } catch (error) {
        res.status(500).json({ msg: "Fail to process payment", error });
    }
};
