const express = require("express");
const { createOrder, getOrderByNumber, getMyOrders } = require("../controller/order.controller");
const optionalAuth = require("../middlewares/optionalAuth");
const isAuth = require("../middlewares/isAuth");

const router = express.Router();

// Create an order (guest or authenticated)
router.post("/", optionalAuth, createOrder);
// Authenticated user's orders (profile page) - must precede /:orderNumber
router.get("/mine", isAuth, getMyOrders);
// Retrieve an order via order number (confirmation page) - guest allowed, but if
// order belongs to an account, only that account can read it (see getOrderByNumber)
router.get("/:orderNumber", optionalAuth, getOrderByNumber);

module.exports = router;
